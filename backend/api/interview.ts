// api/interview.ts — POST /api/interview/questions · POST /api/interview/draft
import express from 'express';
import { findUserByApiKey, incrementUserUsage } from '../services/dbService';
import { interviewQuestions, draftFromInterview, type DraftKind, type InterviewAnswer } from '../services/interviewService';
import { createDailyLimiter } from '../services/dailyLimiter';
import { classifyGeminiError } from '../services/geminiErrors';
import type { ApiError } from '../types';

const takeQuestionSlot = createDailyLimiter(40);

async function authUser(req: express.Request, res: express.Response) {
  const h = req.headers.authorization;
  const apiKey = (Array.isArray(h) ? h[0] : h)?.split(' ')[1];
  if (!apiKey) { res.status(401).json({ error: 'unauthorized', message: 'API key missing' } as ApiError); return null; }
  const user = await findUserByApiKey(apiKey);
  if (!user) { res.status(401).json({ error: 'unauthorized', message: 'Invalid API key' } as ApiError); return null; }
  return user;
}

const cleanQuestion = (v: unknown) => (typeof v === 'string' ? v.replace(/\s+/g, ' ').trim().slice(0, 300) : '');
const cleanKind = (v: unknown): DraftKind => (v === 'article' ? 'article' : 'blog');

export async function questionsHandler(req: express.Request, res: express.Response) {
  const user = await authUser(req, res);
  if (!user) return;
  const question = cleanQuestion(req.body?.question);
  if (question.length < 8) return res.status(400).json({ error: 'bad_request', message: 'Add the question the piece should answer.' } as ApiError);
  if (!takeQuestionSlot(user.id)) {
    return res.status(429).json({ error: 'rate_limit_exceeded', message: 'You have started 40 interviews today. Try again tomorrow.' } as ApiError);
  }
  try {
    const questions = await interviewQuestions(question, cleanKind(req.body?.kind));
    if (!questions.length) return res.status(502).json({ error: 'no_questions', message: 'Could not come up with interview questions this time. Please try again.' } as ApiError);
    return res.status(200).json({ success: true, questions });
  } catch (err) {
    const { status, body } = classifyGeminiError(err, 'interview-questions');
    return res.status(status).json(body as ApiError);
  }
}

export async function draftHandler(req: express.Request, res: express.Response) {
  const user = await authUser(req, res);
  if (!user) return;
  const question = cleanQuestion(req.body?.question);
  const answers: InterviewAnswer[] = Array.isArray(req.body?.answers)
    ? req.body.answers
        .map((a: any) => ({ question: cleanQuestion(a?.question), answer: typeof a?.answer === 'string' ? a.answer.trim().slice(0, 3000) : '' }))
        .filter((a: InterviewAnswer) => a.question && a.answer)
        .slice(0, 8)
    : [];
  if (question.length < 8) return res.status(400).json({ error: 'bad_request', message: 'Add the question the piece should answer.' } as ApiError);
  if (answers.length < 2 || answers.reduce((n, a) => n + a.answer.length, 0) < 80) {
    return res.status(400).json({ error: 'bad_request', message: 'Answer at least two questions in a sentence or two each, so the draft has something real to work from.' } as ApiError);
  }
  if (user.usage.count >= user.usage.limit) {
    return res.status(429).json({ error: 'rate_limit_exceeded', message: 'You have used all your analyses for this period. Upgrade to keep drafting.' } as ApiError);
  }
  try {
    const out = await draftFromInterview(question, answers, cleanKind(req.body?.kind));
    if (!out) return res.status(502).json({ error: 'no_draft', message: 'The draft came back incomplete. Please try again; you were not charged.' } as ApiError);
    const updated = await incrementUserUsage(user.id);
    if (updated) res.setHeader('X-Usage-Info', JSON.stringify(updated.usage));
    return res.status(200).json({ success: true, title: out.title || question, draft: out.draft });
  } catch (err) {
    const { status, body } = classifyGeminiError(err, 'interview-draft');
    return res.status(status).json(body as ApiError);
  }
}
