require('dotenv').config();
const dns = require('dns');
const { URL } = require('url');
const express = require('express');
const cors = require('cors');
const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

const urlDatabase = {};
let urlCounter = 1;

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.post('/api/shorturl', function(req, res) {
  const url = req.body.url;
  if (!url) {
    return res.status(400).json({ error: 'Invalid URL' });
  }

  let hostname;
  try {
    const parsedUrl = new URL(url);
    hostname = parsedUrl.hostname;
  } catch (e) {
    return res.status(400).json({ error: 'Invalid URL' });
  }

  // Verify hostname using dns
  dns.lookup(hostname, (err) => {
    if (err) {
      return res.status(400).json({ error: 'Invalid URL' });
    } else {
      // Check if URL already exists
      for (const key in urlDatabase) {
        if (urlDatabase[key] === url) {
          return res.json({ original_url: url, short_url: key });
        }
      }
      // If not, create a new short URL
      const shortUrl = urlCounter++;
      urlDatabase[shortUrl] = url;
      return res.json({ original_url: url, short_url: shortUrl });
    }
  });  
});

app.get('/api/shorturl/:shortUrl', function(req, res) {
  const shortUrl = req.params.shortUrl;
  const originalUrl = urlDatabase[shortUrl];
  if (originalUrl) {
    res.redirect(originalUrl);
  } else {
    res.status(404).json({ error: 'No short URL found for the given input'});
  }
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
