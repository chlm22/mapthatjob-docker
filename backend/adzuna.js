const SAVE_FOR_MS = 15 * 60 * 1000;
const saved = new Map(); // place, lowercased -> { jobs, fetchedAt }

class JobSearchUnavailable extends Error {}

// ---------- Cleaning what Adzuna sends ----------

function plainText(value) {
  return String(value ?? '')
    .replace(/<[^>]*>/g, '')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .trim()
    .slice(0, 200);
}

function webLink(value) {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:' ? url.href : null;
  } catch {
    return null; 
  }
}

function coordinate(value, limit) {
  if (value === null || value === undefined || value === '') return null;
  const number = Number(value);
  return Number.isFinite(number) && Math.abs(number) <= limit ? number : null;
}

// One call to Adzuna, turned into the fields the app uses
async function fetchFromAdzuna(where) {
  const { ADZUNA_APP_ID, ADZUNA_APP_KEY } = process.env;
  if (!ADZUNA_APP_ID || !ADZUNA_APP_KEY) {
    throw new Error('ADZUNA_APP_ID and ADZUNA_APP_KEY must be set in .env');
  }

  const url = new URL('https://api.adzuna.com/v1/api/jobs/us/search/1');
  url.search = new URLSearchParams({
    app_id: ADZUNA_APP_ID,
    app_key: ADZUNA_APP_KEY,
    where,
    results_per_page: '50',
  }).toString();

  let response;
  try {
    response = await fetch(url, { signal: AbortSignal.timeout(10000) }); 
  } catch (err) {
    throw new JobSearchUnavailable(`Adzuna did not answer: ${err.message}`);
  }
  if ([429, 500, 502, 503, 504].includes(response.status)) {
    throw new JobSearchUnavailable(`Adzuna returned ${response.status}`);
  }
  if (!response.ok) {
    throw new Error(`Adzuna returned ${response.status}`);
  }
  const data = await response.json();

  return (data.results || []).map((job) => ({
    id: String(job.id),
    title: plainText(job.title),
    company: plainText(job.company?.display_name),
    lat: coordinate(job.latitude, 90),
    lng: coordinate(job.longitude, 180),
    website: webLink(job.redirect_url),
    industry: plainText(job.category?.label),
  }));
}

async function searchJobs(location, now = Date.now()) {
  const where = String(location || 'Ann Arbor, Michigan').trim().slice(0, 100);
  const key = where.toLowerCase();
  const old = saved.get(key);
  if (old && now - old.fetchedAt < SAVE_FOR_MS) return old.jobs;

  try {
    const jobs = await fetchFromAdzuna(where);
    saved.set(key, { jobs, fetchedAt: now });
    return jobs;
  } catch (err) {
    if (old) {
      console.warn(`Adzuna failed (${err.message}); using saved results for "${where}"`);
      return old.jobs;
    }
    throw err;
  }
}

function clearSaved() {
  saved.clear();
}

module.exports = { searchJobs, JobSearchUnavailable, clearSaved };