import { useState } from 'react';
import { MessageSquare, Sparkles } from 'lucide-react';
import { api } from '../api/client.js';
import styles from './InterviewDraft.module.css';

// "Write a post/article for this": a short interview, then a draft written
// only from the writer's answers. Drafting uses one analysis.
export default function InterviewDraft({ question, kind, onDraft, onSkip }) {
  const [step, setStep] = useState('start'); // start | asking | answering | drafting
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [error, setError] = useState('');

  const answered = questions.filter((_, i) => (answers[i] || '').trim().length >= 15).length;

  async function start() {
    setStep('asking');
    setError('');
    try {
      const { data } = await api.interviewQuestions({ question, kind });
      setQuestions(data?.questions || []);
      setStep('answering');
    } catch (err) {
      setError(err.message || 'Could not start the interview. Please try again.');
      setStep('start');
    }
  }

  async function draft() {
    setStep('drafting');
    setError('');
    try {
      const { data } = await api.interviewDraft({
        question, kind,
        answers: questions.map((q, i) => ({ question: q, answer: answers[i] || '' })).filter(a => a.answer.trim()),
      });
      onDraft(data.title, data.draft);
    } catch (err) {
      setError(err.message || 'Drafting failed. Please try again.');
      setStep('answering');
    }
  }

  return (
    <div className={styles.panel}>
      <div className={styles.head}>
        <MessageSquare size={16} aria-hidden="true" />
        <div>
          <div className={styles.title}>Draft it from your own answers</div>
          <div className={styles.sub}>
            Answering: <strong>{question}</strong>. We ask you a few questions, then draft the piece using only what you tell us,
            so it carries your experience instead of generic AI filler.
          </div>
        </div>
      </div>

      {step === 'start' || step === 'asking' ? (
        <div className={styles.actions}>
          <button type="button" className="btn btn-primary" onClick={start} disabled={step === 'asking'}>
            {step === 'asking' ? 'Preparing questions…' : 'Interview me'}
          </button>
          <button type="button" className="btn btn-ghost" onClick={onSkip}>I'll write it myself</button>
        </div>
      ) : (
        <>
          <ol className={styles.list}>
            {questions.map((q, i) => (
              <li key={q}>
                <label htmlFor={`iq-${i}`} className={styles.q}>{q}</label>
                <textarea
                  id={`iq-${i}`}
                  className={styles.answer}
                  rows={3}
                  value={answers[i] || ''}
                  onChange={e => setAnswers(a => ({ ...a, [i]: e.target.value }))}
                  placeholder="A few sentences in your own words. Skip any you can't answer."
                  disabled={step === 'drafting'}
                />
              </li>
            ))}
          </ol>
          <div className={styles.actions}>
            <button type="button" className="btn btn-primary" onClick={draft} disabled={answered < 2 || step === 'drafting'}>
              <Sparkles size={14} /> {step === 'drafting' ? 'Writing your draft…' : 'Write my draft (uses 1 analysis)'}
            </button>
            <button type="button" className="btn btn-ghost" onClick={onSkip} disabled={step === 'drafting'}>Cancel</button>
            <span className={styles.hint}>{answered < 2 ? 'Answer at least two questions.' : `${answered} of ${questions.length} answered.`}</span>
          </div>
        </>
      )}
      {error && <p className={styles.error} role="alert">{error}</p>}
    </div>
  );
}
