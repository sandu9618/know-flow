import './App.css';

const apiUrl = import.meta.env.VITE_API_URL;

export function App() {
  return (
    <main className="bootstrap">
      <h1>KnowFlow</h1>
      <p className="tagline">Week 0 bootstrap — local development environment</p>
      <dl className="meta">
        <div>
          <dt>API</dt>
          <dd>
            <code>{apiUrl}</code>
          </dd>
        </div>
        <div>
          <dt>Web</dt>
          <dd>
            <code>http://localhost:5173</code>
          </dd>
        </div>
        <div>
          <dt>Worker</dt>
          <dd>
            <code>http://localhost:8000</code>
          </dd>
        </div>
      </dl>
      <p className="hint">
        Run <code>docker compose up -d</code> and <code>npm run dev</code> from the repo root.
      </p>
    </main>
  );
}
