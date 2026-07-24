import type { ChatMessage } from '@/types/chat.types';
import styles from '@/features/chat/ChatPage.module.css';

type ChatMessageListProps = {
  messages: ChatMessage[];
  isAsking: boolean;
};

export default function ChatMessageList({ messages, isAsking }: ChatMessageListProps) {
  if (messages.length === 0 && !isAsking) {
    return (
      <p className={styles.empty}>
        Select an indexed document and ask a question about its content.
      </p>
    );
  }

  return (
    <ul className={styles.messageList} aria-live="polite">
      {messages.map((message) => (
        <li
          key={message.id}
          className={
            message.role === 'user' ? styles.messageUser : styles.messageAssistant
          }
        >
          <span className={styles.messageRole}>
            {message.role === 'user' ? 'You' : 'Assistant'}
          </span>
          <p className={styles.messageContent}>{message.content}</p>
        </li>
      ))}
      {isAsking ? (
        <li className={styles.messageAssistant}>
          <span className={styles.messageRole}>Assistant</span>
          <p className={styles.messageContent}>Thinking…</p>
        </li>
      ) : null}
    </ul>
  );
}
