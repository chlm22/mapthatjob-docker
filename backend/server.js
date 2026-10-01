require('dotenv').config();
const express = require('express');
const { searchJobs, JobSearchUnavailable } = require('./adzuna');
const { cleanLocation, InvalidInput } = require('./validate');

const PORT = Number(process.env.PORT) || 8080;
const app = express();
app.disable('x-powered-by'); // Security best practice: don't advertise the server software

// GET /api/jobs?location=Novi, Michigan
// Answers with a JSON list: [{ id, title, company, lat, lng, website, industry }, ...]
app.get('/api/jobs', async (req, res) => {
  let location;
  try {
    location = cleanLocation(req.query.location, 'Ann Arbor, Michigan');
  } catch (err) {
    if (err instanceof InvalidInput) return res.status(400).json({ error: err.message });
    throw err;
  }

  try {
    res.json(await searchJobs(location));
  } catch (err) {
    console.error('Fetching jobs failed:', err.message);
    if (err instanceof JobSearchUnavailable) {
      return res.status(503).json({ error: 'The job search service is busy right now. Try again in a few minutes.' });
    }
    res.status(502).json({ error: "Couldn't load jobs right now. Try again in a moment." });
  }
});

// Docker asks this every 30 seconds to check if the container is healthy
app.get('/api/health', (req, res) => {
  res.json({ ok: true });
});

// Catch-all for any unknown API routes
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.listen(PORT, () => console.log(`MapThatJob API Gateway is running on port ${PORT}`));