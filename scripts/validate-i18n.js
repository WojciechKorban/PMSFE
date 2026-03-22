const fs = require('fs');
const path = require('path');

const i18nDir = path.join(__dirname, '../src/assets/i18n');
const languages = ['en', 'pl'];
const files = ['common', 'auth', 'validation', 'properties'];

function flattenKeys(obj, prefix = '') {
  return Object.entries(obj).flatMap(([key, value]) => {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      return flattenKeys(value, fullKey);
    }
    return [fullKey];
  });
}

let hasErrors = false;

for (const file of files) {
  const translations = {};
  for (const lang of languages) {
    const filePath = path.join(i18nDir, lang, `${file}.json`);
    try {
      translations[lang] = flattenKeys(JSON.parse(fs.readFileSync(filePath, 'utf-8')));
    } catch {
      console.error(`ERROR: Missing file ${filePath}`);
      hasErrors = true;
    }
  }

  if (translations['en'] && translations['pl']) {
    const enKeys = new Set(translations['en']);
    const plKeys = new Set(translations['pl']);

    for (const key of enKeys) {
      if (!plKeys.has(key)) {
        console.error(`MISSING in PL (${file}.json): ${key}`);
        hasErrors = true;
      }
    }
    for (const key of plKeys) {
      if (!enKeys.has(key)) {
        console.warn(`EXTRA in PL (${file}.json): ${key}`);
      }
    }
    console.log(`OK ${file}.json: ${enKeys.size} keys checked`);
  }
}

if (hasErrors) {
  console.error('\nFAILED: i18n validation FAILED');
  process.exit(1);
} else {
  console.log('\nPASSED: i18n validation PASSED');
}
