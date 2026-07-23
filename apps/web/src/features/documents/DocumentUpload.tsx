import { useRef, useState } from 'react';
import {
  ACCEPTED_UPLOAD_TYPES,
  MAX_UPLOAD_BYTES,
} from '@/types/knowledge-source.types';
import {
  getUploadErrorMessage,
  useDocumentUpload,
} from '@/features/documents/useDocumentUpload';
import styles from '@/features/documents/DocumentsPage.module.css';

function formatFileSize(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function DocumentUpload() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [clientError, setClientError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const { upload, isUploading, progress, error, reset } = useDocumentUpload();

  function validateFile(file: File): string | null {
    if (file.size > MAX_UPLOAD_BYTES) {
      return 'File exceeds the 25 MB upload limit.';
    }

    const allowedTypes = ['application/pdf', 'text/plain'];
    if (!allowedTypes.includes(file.type)) {
      return 'Only PDF and TXT files are supported.';
    }

    return null;
  }

  function handleFileSelected(file: File | null) {
    setClientError(null);
    setSuccessMessage(null);
    reset();

    if (!file) {
      setSelectedFile(null);
      return;
    }

    const validationError = validateFile(file);
    if (validationError) {
      setClientError(validationError);
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
  }

  function handleInputChange(event: React.ChangeEvent<HTMLInputElement>) {
    handleFileSelected(event.target.files?.[0] ?? null);
  }

  function handleDrop(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    handleFileSelected(event.dataTransfer.files[0] ?? null);
  }

  function handleUpload() {
    if (!selectedFile) {
      return;
    }

    const validationError = validateFile(selectedFile);
    if (validationError) {
      setClientError(validationError);
      return;
    }

    setClientError(null);
    setSuccessMessage(null);

    upload(
      { file: selectedFile },
      {
        onSuccess: (source) => {
          setSuccessMessage(`"${source.title}" uploaded successfully.`);
          setSelectedFile(null);
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        },
      },
    );
  }

  const displayError = clientError ?? (error ? getUploadErrorMessage(error) : null);

  return (
    <section className={styles.uploadSection} aria-labelledby="document-upload-heading">
      <h2 id="document-upload-heading">Upload knowledge source</h2>
      <p className={styles.uploadHint}>
        PDF or TXT files up to {formatFileSize(MAX_UPLOAD_BYTES)}.
      </p>

      <div
        className={styles.dropZone}
        onDragOver={(event) => event.preventDefault()}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          id="document-file-input"
          type="file"
          accept={ACCEPTED_UPLOAD_TYPES}
          onChange={handleInputChange}
          disabled={isUploading}
          className={styles.fileInput}
        />
        <label htmlFor="document-file-input" className={styles.fileLabel}>
          {selectedFile ? selectedFile.name : 'Choose a file or drag it here'}
        </label>
        {selectedFile && (
          <p className={styles.fileMeta}>{formatFileSize(selectedFile.size)}</p>
        )}
      </div>

      {isUploading && (
        <div className={styles.progress} role="status" aria-live="polite">
          <div className={styles.progressBar}>
            <div
              className={styles.progressFill}
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className={styles.progressLabel}>Uploading… {progress}%</p>
        </div>
      )}

      {displayError && (
        <p className={styles.error} role="alert">
          {displayError}
        </p>
      )}

      {successMessage && (
        <p className={styles.success} role="status">
          {successMessage}
        </p>
      )}

      <div className={styles.uploadActions}>
        <button
          type="button"
          onClick={handleUpload}
          disabled={!selectedFile || isUploading}
        >
          {isUploading ? 'Uploading…' : 'Upload'}
        </button>
      </div>
    </section>
  );
}
