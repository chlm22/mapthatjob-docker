const MAX_LENGTH = 100;

// Letters in any language, digits, spaces, and , . ' ’ - # ( ) &
const ALLOWED = /^[\p{L}\p{M}\d ,.'’#()&-]+$/u;

class InvalidInput extends Error {}

function cleanLocation(raw, fallback) {
  if (raw === undefined) return fallback;
  if (typeof raw !== 'string') throw new InvalidInput('Send one location.');

  const text = raw.normalize('NFC').replace(/\s+/g, ' ').trim(); 
  if (!text) return fallback;
  if (text.length > MAX_LENGTH) {
    throw new InvalidInput(`Keep the location to ${MAX_LENGTH} characters or fewer.`);
  }
  if (!ALLOWED.test(text)) {
    throw new InvalidInput("Use only letters, numbers, spaces and , . ' - # ( ) &");
  }
  return text;
}

module.exports = { cleanLocation, InvalidInput, MAX_LENGTH };