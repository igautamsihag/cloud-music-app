module.exports = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'artist-img-url-assignment.s3.us-east-1.amazonaws.com',
        pathname: '/artist-images/**',  
      },
    ],
  },
};
