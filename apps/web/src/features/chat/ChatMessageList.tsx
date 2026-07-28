import type { ChatMessage } from '@/types/chat.types';
import styles from '@/features/chat/ChatPage.module.css';

type ChatMessageListProps = {
  messages: ChatMessage[];
  isStreaming: boolean;
  streamingMessageId: string | null;
};

export default function ChatMessageList({
  messages,
  isStreaming,
  streamingMessageId,
}: ChatMessageListProps) {
  if (messages.length === 0) {
    return (
      <p className={styles.empty}>
        Select an indexed document and ask a question about its content.
      </p>
    );
  }

  return (
    <ul className={styles.messageList} aria-live="polite">
      {messages.map((message) => {
        const isLiveAssistant =
          isStreaming && message.id === streamingMessageId && message.role === 'assistant';

        return (
          <li
            key={message.id}
            className={
              message.role === 'user' ? styles.messageUser : styles.messageAssistant
            }
          >
            <span className={styles.messageRole}>
              {message.role === 'user' ? 'You' : 'Assistant'}
              {isLiveAssistant ? (
                <span className={styles.streamingHint}>Streaming</span>
              ) : null}
            </span>
            <p className={styles.messageContent}>
              {message.content || (isLiveAssistant ? '…' : '')}
            </p>
          </li>
        );
      })}
    </ul>
  );
}
