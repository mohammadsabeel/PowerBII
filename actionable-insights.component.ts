const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

app.post('/api/predict', async (req, res) => {
  const { prompt } = req.body;

  try {
    const response = await fetch('https://<your-databricks-url>', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer <your_token>',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt }),
    });

    const result = await response.json();
    res.json(result);

  } catch (error) {
    console.error('Error calling Databricks:', error);
    res.status(500).json({ error: 'Failed to fetch prediction' });
  }
});

app.listen(PORT, () => {
  console.log(`Proxy server running at http://localhost:${PORT}`);
});
