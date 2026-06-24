import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <article className="not-found">
      <h1>Page not found</h1>
      <p>The page you requested does not exist.</p>
      <Link to="/prompts">Go to Prompt Templates</Link>
    </article>
  );
}
