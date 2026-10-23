import { Link } from 'react-router-dom';
import styles from './WhyNotCited.module.css';

// Plain-English explainer for the Citation Monitor: how AI picks the sites it
// cites, why yours might not be one, and why it takes consistency over time.
// Opens by itself when the latest check came back "Not cited".
export default function WhyNotCited({ open = false }) {
  return (
    <details className={styles.box} open={open}>
      <summary className={styles.summary}>Why am I not being cited?</summary>
      <div className={styles.body}>
        <h4>How AI picks the sites it cites</h4>
        <p>
          When someone asks ChatGPT, Gemini or Google's AI a question, it searches the web right then, reads a handful of
          pages, writes an answer, and cites the pages it relied on. It favours pages that answer the exact question
          clearly, near the top, from a source it has seen be reliable on that topic before.
        </p>

        <h4>Common reasons you're not cited yet</h4>
        <ul>
          <li><strong>The page doesn't answer this exact question.</strong> If the answer is buried or vague, the AI uses a page that says it plainly.</li>
          <li><strong>Others are more trusted on the topic.</strong> Reviews, directory listings, press mentions and links from other sites all tell AI who to believe.</li>
          <li><strong>AI can't read the page.</strong> Blocked AI crawlers, text that only loads with scripts, or no text at all (images, PDFs) keep you out.</li>
          <li><strong>It's new or rarely updated.</strong> AI search needs time to find and trust a page, and prefers ones that are kept current.</li>
          <li><strong>Each answer is a fresh search.</strong> The same question can cite different sites from one day to the next, so a single "Not cited" is a snapshot, not a verdict.</li>
        </ul>

        <h4>Citations favour consistency over time</h4>
        <p>
          AI trusts sources that stay consistent: the same clear message about who you are and what you offer,
          kept up over the medium to long term. Citations build gradually, so judge progress by the trend across
          many checks, not by any single one.
        </p>

        <h4>What to do next</h4>
        <ol>
          <li>Make the page answer the question in its first lines: <Link to="/analyze">Content Optimizer</Link> or <Link to="/url-scanner">URL Scanner</Link> shows exactly what to fix.</li>
          <li>Make sure AI can read the page: the URL Scanner checks crawler access and structured data.</li>
          <li>Get listed where AI looked: the sources in your result are the sites to be on.</li>
          <li>Track the question weekly, so you see the trend instead of a single answer.</li>
        </ol>
      </div>
    </details>
  );
}
