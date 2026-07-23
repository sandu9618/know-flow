export type UploadObjectInput = {
  key: string;
  body: Buffer;
  mimeType: string;
};

export type BucketClient = {
  uploadObject(input: UploadObjectInput): Promise<void>;
  deleteObject(key: string): Promise<void>;
};

export type BucketProvider = 'local' | 's3';
