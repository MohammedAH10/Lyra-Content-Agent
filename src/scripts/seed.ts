import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

const seed = async (): Promise<void> => {
  console.log('Starting local MongoDB instance...');
  const mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  console.log(`Connected to ${uri}`);

  await mongoose.connect(uri);

  console.log('Inserting seed files...');

  const collection = mongoose.connection.db!.collection('files');
  const now = new Date();

  const seedFiles = [
    {
      name: 'product-launch-campaign.png',
      type: 'image',
      size: 204800,
      url: 'https://s3.example.com/files/product-launch-campaign.png',
      tags: ['product', 'launch', 'marketing', 'campaign'],
      status: 'approved',
      uploadDate: now,
      createdAt: now,
      updatedAt: now,
    },
    {
      name: 'team-culture-video.mp4',
      type: 'video',
      size: 52428800,
      url: 'https://s3.example.com/files/team-culture-video.mp4',
      tags: ['team', 'culture', 'behind-the-scenes'],
      status: 'approved',
      uploadDate: now,
      createdAt: now,
      updatedAt: now,
    },
    {
      name: 'q4-finance-report.pdf',
      type: 'document',
      size: 1048576,
      url: 'https://s3.example.com/files/q4-finance-report.pdf',
      tags: ['finance', 'quarterly', 'report'],
      status: 'approved',
      uploadDate: now,
      createdAt: now,
      updatedAt: now,
    },
    {
      name: 'brand-logo-header.svg',
      type: 'image',
      size: 45056,
      url: 'https://s3.example.com/files/brand-logo-header.svg',
      tags: ['brand', 'logo', 'header'],
      status: 'approved',
      uploadDate: now,
      createdAt: now,
      updatedAt: now,
    },
    {
      name: 'customer-testimonial-intro.mp3',
      type: 'audio',
      size: 8388608,
      url: 'https://s3.example.com/files/customer-testimonial-intro.mp3',
      tags: ['customer', 'testimonial', 'audio'],
      status: 'approved',
      uploadDate: now,
      createdAt: now,
      updatedAt: now,
    },
    {
      name: 'feature-demo-screenshot.png',
      type: 'image',
      size: 512000,
      url: 'https://s3.example.com/files/feature-demo-screenshot.png',
      tags: ['feature', 'demo', 'product'],
      status: 'approved',
      uploadDate: now,
      createdAt: now,
      updatedAt: now,
    },
    {
      name: 'rejected-inappropriate-content.jpg',
      type: 'image',
      size: 150000,
      url: 'https://s3.example.com/files/rejected-inappropriate-content.jpg',
      tags: ['flagged'],
      status: 'rejected',
      moderationReason: 'Content violates community guidelines',
      uploadDate: now,
      createdAt: now,
      updatedAt: now,
    },
    {
      name: 'rejected-copyright-video.mp4',
      type: 'video',
      size: 31457280,
      url: 'https://s3.example.com/files/rejected-copyright-video.mp4',
      tags: ['music', 'video'],
      status: 'rejected',
      moderationReason: 'Copyright infringement detected',
      uploadDate: now,
      createdAt: now,
      updatedAt: now,
    },
    {
      name: 'pending-upload-image.png',
      type: 'image',
      size: 300000,
      url: 'https://s3.example.com/files/pending-upload-image.png',
      tags: ['pending', 'upload'],
      status: 'upload_initiated',
      uploadDate: now,
      createdAt: now,
      updatedAt: now,
    },
    {
      name: 'scanning-document.pdf',
      type: 'document',
      size: 2048000,
      url: 'https://s3.example.com/files/scanning-document.pdf',
      tags: ['scanning', 'pending'],
      status: 'scan_in_progress',
      uploadDate: now,
      createdAt: now,
      updatedAt: now,
    },
    {
      name: 'social-media-banner.jpg',
      type: 'image',
      size: 750000,
      url: 'https://s3.example.com/files/social-media-banner.jpg',
      tags: ['social', 'banner', 'marketing'],
      status: 'approved',
      uploadDate: now,
      createdAt: now,
      updatedAt: now,
    },
    {
      name: 'rejected-offensive-audio.mp3',
      type: 'audio',
      size: 4194304,
      url: 'https://s3.example.com/files/rejected-offensive-audio.mp3',
      tags: ['audio'],
      status: 'rejected',
      moderationReason: 'Contains offensive language',
      uploadDate: now,
      createdAt: now,
      updatedAt: now,
    },
  ];

  const result = await collection.insertMany(seedFiles);

  console.log(`Successfully seeded ${Object.keys(result.insertedIds).length} files:`);
  console.log(`  Approved:          ${seedFiles.filter((f) => f.status === 'approved').length}`);
  console.log(`  Rejected:          ${seedFiles.filter((f) => f.status === 'rejected').length}`);
  console.log(`  Upload Initiated:  ${seedFiles.filter((f) => f.status === 'upload_initiated').length}`);
  console.log(`  Scan In Progress:  ${seedFiles.filter((f) => f.status === 'scan_in_progress').length}`);
  console.log('');
  console.log('Seed complete.');

  await mongoose.disconnect();
  await mongoServer.stop();
  process.exit(0);
};

seed().catch((error) => {
  console.error('Seed failed:', error);
  process.exit(1);
});
