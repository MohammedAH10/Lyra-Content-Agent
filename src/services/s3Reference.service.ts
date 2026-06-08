import crypto from 'crypto';

export interface S3Reference {
  s3Bucket: string;
  s3Key: string;
  s3Url: string;
}

const S3_BUCKET = 't-world-media';
const S3_REGION = 'us-east-1';
const S3_ENDPOINT = `https://${S3_BUCKET}.s3.${S3_REGION}.amazonaws.com`;

export const generateS3Reference = (fileName: string): S3Reference => {
  const timestamp = Date.now();
  const randomId = crypto.randomBytes(4).toString('hex');
  const extension = fileName.split('.').pop() || 'bin';
  const nameWithoutExt = fileName
    .replace(/\.[^/.]+$/, '')
    .replace(/[^a-zA-Z0-9-_]/g, '-')
    .toLowerCase();

  const s3Key = `uploads/${timestamp}-${randomId}/${nameWithoutExt}.${extension}`;

  return {
    s3Bucket: S3_BUCKET,
    s3Key,
    s3Url: `${S3_ENDPOINT}/${s3Key}`,
  };
};

export const generatePresignedUrl = (s3Key: string, expiresInSeconds = 3600): string => {
  const expires = Date.now() + expiresInSeconds * 1000;
  return `${S3_ENDPOINT}/${s3Key}?X-Amz-Expires=${expiresInSeconds}&X-Amz-Date=${new Date().toISOString()}&X-Amz-Signature=simulated`;
};

export const parseS3KeyFromUrl = (s3Url: string): string | null => {
  const prefix = `${S3_ENDPOINT}/`;
  if (s3Url.startsWith(prefix)) {
    return s3Url.slice(prefix.length);
  }
  return null;
};
