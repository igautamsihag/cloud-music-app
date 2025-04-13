const { S3Client, CreateBucketCommand } = require('@aws-sdk/client-s3');

const s3Client = new S3Client({
  region: 'us-east-1', 
});

async function createBucket(bucketName) {
  try {
    const command = new CreateBucketCommand({
      Bucket: bucketName,
    });
    
    const data = await s3Client.send(command);
    console.log(`The music bucket was created successfully: ${bucketName}`);
    return data;
  } catch (error) {
    console.error(`Music bucket: ${bucketName} creation failed`, error);
  }
}

createBucket('artist-img-url-assignment'); 
