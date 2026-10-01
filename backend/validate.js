const MAX_LENGTH = 100;

// Letters in any language, digits, spaces, and , . ' ’ - # ( ) &
const ALLOWED = /^[\p{L}\p{M}\d ,.'’#()&-]+$/u;

// Input that breaks the rules. server.js answers 400 with this message.
class InvalidInput extends Error {}

// Returns a clean location, or `fallback` when none was sent.
// Throws InvalidInput when the location isn't allowed.
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