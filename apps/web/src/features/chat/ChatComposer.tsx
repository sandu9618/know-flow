import type { FormEvent } from 'react';
import styles from '@/features/chat/ChatPage.module.css';

type ChatComposerProps = {
  draft: string;
  onDraftChange: (value: string) => void;
  onSubmit: () => void;
  disabled: boolean;
  isAsking: boolean;
};

export default function ChatComposer({
  draft,
  onDraftChange,
  onSubmit,
  disabled,
  isAsking,
}: ChatComposerProps) {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit();
  }

  return (
    <form className={styles.composer} onSubmit={handleSubmit}>
      <label className={styles.composerLabel} htmlFor="chat-question">
        Question
      </label>
      <textarea
        id="chat-question"
        className={styles.composerInput}
        value={draft}
        onChange={(event) => onDraftChange(event.target.value)}
        placeholder="e.g. What is the EU refund policy?"
        rows={3}
        disabled={disabled}
      />
      <div className={styles.composerActions}>
        <button type="submit" disabled={disabled || !draft.trim() || isAsking}>
          {isAsking ? 'Asking…' : 'Ask'}
        </button>
      </div>
    </form>
  );
}
