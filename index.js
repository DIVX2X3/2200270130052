const express = require('express');
const { nanoid } = require('nanoid');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static('public/')); // Serve HTML from /public

// File-based persistent storage
const DB_FILE = path.join(__dirname, 'urlDatabase.json');
let urlDatabase = {};

if (fs.existsSync(DB_FILE)) {
  urlDatabase = JSON.parse(fs.readFileSync(DB_FILE));
}

function saveDatabase() {
  fs.writeFileSync(DB_FILE, JSON.stringify(urlDatabase, null, 2));
}

app.post('/shorten', (req, res) => {
  const { originalUrl } = req.body;
  if (!originalUrl) return res.status(400).json({ error: 'URL required' });

  const shortId = nanoid(6);
  urlDatabase[shortId] = originalUrl;
  saveDatabase();

  const shortUrl = `http://localhost:${PORT}/${shortId}`;
  res.json({ shortUrl, originalUrl });
});

app.get('/:shortId', (req, res) => {
  const { shortId } = req.params;
  const originalUrl = urlDatabase[shortId];

  if (originalUrl) {
    res.redirect(originalUrl);
  } else {
    res.status(404).send('URL not found');
  }
});

app.listen(PORT, () => {
  console.log(`✅ URL Shortener running at http://localhost:${PORT}`);
});
