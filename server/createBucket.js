const { S3Client, CreateBucketCommand } = require('@aws-sdk/client-s3');

// AWS S3 Client
const s3Client = new S3Client({
  region: 'us-east-1', // Specify your region
});

async function createBucket(bucketName) {
  try {
    const command = new CreateBucketCommand({
      Bucket: bucketName,
      // Optionally, you can specify the region if needed
    });
    
    const data = await s3Client.send(command);
    console.log(`Successfully created the bucket: ${bucketName}`);
    return data;
  } catch (error) {
    console.error(`Error creating bucket ${bucketName}:`, error);
  }
}

// Create a bucket
createBucket('artist-img-url-assignment'); // Replace with your desired bucket name
