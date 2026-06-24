export interface ComingSoonPageProps {
  title: string;
  weekLabel: string;
  description: string;
}

export default function ComingSoonPage({ title, weekLabel, description }: ComingSoonPageProps) {
  return (
    <article className="coming-soon">
      <p className="coming-soon-badge">Coming in {weekLabel}</p>
      <h1>{title}</h1>
      <p className="coming-soon-description">{description}</p>
    </article>
  );
}
