const express = require('express');
const bodyParser = require('body-parser');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 3001;

// Use your DeepSeek API key here
const DEEPSEEK_API_KEY = 'sk-2d9be709ee16460e9cce905940c7e806';

app.use(bodyParser.json({ limit: '10mb' }));

app.post('/analyze', async (req, res) => {
  try {
    const { image } = req.body;
    if (!image) {
      return res.status(400).json({ error: 'No image provided' });
    }

    // Prepare DeepSeek Vision API request
    const response = await fetch('https://api.deepseek.com/v1/vision/food-recognition', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        image: image // base64 string from your app
      })
    });

    const data = await response.json();

    // You may want to transform the DeepSeek response to your app's expected format here
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to analyze image', details: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`DeepSeek backend running on http://localhost:${PORT}`);
}); 