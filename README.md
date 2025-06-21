# Cloud Music App

A scalable music subscription platform that allows users to register, log in, subscribe to music, and view their personalized music library.

## Features

- User registration and authentication  
- Music subscription management  
- Personalized user music library  
- Efficient backend using serverless AWS Lambda functions via API Gateway  
- Fast content delivery with static assets hosted on Amazon S3  
- Deployed on AWS EC2 with DynamoDB for scalable data storage  

## Technologies Used

Next.js, Node.js, Express.js, AWS (EC2, S3, Lambda, API Gateway, DynamoDB)

## Architecture Overview

- **Frontend:** Built with Next.js for server-side rendering and rich UI  
- **Backend:** Node.js and Express.js server hosted on AWS EC2  
- **Serverless Functions:** AWS Lambda functions handle authentication, subscription, and other business logic, exposed via API Gateway  
- **Storage:** DynamoDB for user and subscription data; Amazon S3 for static assets like images  

## Getting Started

### Prerequisites

- Node.js and npm installed  
- AWS account with proper permissions for EC2, S3, Lambda, API Gateway, and DynamoDB  

### Installation

1. Clone the repo:  
   git clone https://github.com/igautamsihag/cloud-music-app.git
2. Install dependencices
   cd client
   npm install
   cd backend
   npm install
3. Configure AWS credentials and environment variables as needed.

### Deployment
Frontend and backend deployed on AWS EC2 instance <br>
Static files hosted on Amazon S3 <br>
Serverless functions deployed using AWS Lambda and API Gateway
