// server/routes/images.js (Express route example)
const express = require('express');
const axios = require('axios');
const router = express.Router();

router.get('/image/:artist', async (req, res) => {
  const { artist } = req.params;
  const imageUrl = `https://artist-img-url-assignment.s3.amazonaws.com/artist-images/${encodeURIComponent(artist)}.jpg`;

  try {
    const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
    res.set('Content-Type', 'image/jpeg');
    res.send(response.data);
  } catch (error) {
    console.error('Error fetching image:', error.response ? error.response.data : error.message);
    res.status(500).send('Error fetching image');
  }
});

module.exports = router;
