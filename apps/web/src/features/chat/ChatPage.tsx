import ChatComposer from '@/features/chat/ChatComposer';
import ChatMessageList from '@/features/chat/ChatMessageList';
import SourcePicker from '@/features/chat/SourcePicker';
import { useChat } from '@/features/chat/useChat';
import { useDocuments } from '@/features/documents/useDocuments';
import { getNavItemByPath } from '@/routes/navConfig';
import styles from '@/features/chat/ChatPage.module.css';

const navItem = getNavItemByPath('/chat')!;

export default function ChatPage() {
  const documentsQuery = useDocuments();
  const {
    sourceId,
    setSourceId,
    messages,
    draft,
    setDraft,
    isAsking,
    error,
    sendMessage,
  } = useChat();

  const hasIndexedSources =
    (documentsQuery.data ?? []).some((source) => source.status === 'indexed');

  return (
    <article className={styles.page}>
      <p className={styles.pageBadge}>{navItem.weekLabel}</p>
      <h1>{navItem.label}</h1>
      <p className={styles.pageDescription}>{navItem.description}</p>

      <div className={styles.chatPanel}>
        <SourcePicker
          sources={documentsQuery.data ?? []}
          selectedId={sourceId}
          onSelect={setSourceId}
          isLoading={documentsQuery.isLoading}
          error={documentsQuery.error}
        />

        <ChatMessageList messages={messages} isAsking={isAsking} />

        {error ? <p className={styles.error}>{error}</p> : null}

        <ChatComposer
          draft={draft}
          onDraftChange={setDraft}
          onSubmit={() => {
            void sendMessage();
          }}
          disabled={!sourceId || !hasIndexedSources}
          isAsking={isAsking}
        />
      </div>
    </article>
  );
}
