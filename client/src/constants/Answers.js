// Matching a typed answer against a stored conjugation.
//
// Stored forms can encode several acceptable answers:
//   * comma-separated alternatives:  "MORIRÒ, MORRÒ", "PERSE, PERDÉ, PERDETTE"
//     A shorter alternative reuses the leading words of the first one:
//     "HO PERSO, PERDUTO" accepts "ho perso" and "ho perduto".
//   * gendered endings after a slash: "PREOCCUPATO/A", "PREOCCUPATI/E"
//   * optional letters in brackets:   "M(U)OVEVO" accepts "muovevo" and "movevo"
//
// Matching ignores case and accents on vowels, so "perde" is accepted for
// "PERDÉ" and "hablo" for "HABLÓ". Marks on consonants still count: "nino" is
// not "niño".
//
// Given the infinitive, small typos in the root of the verb are forgiven; only
// the conjugated part has to be exact. The root of a word is the part it shares
// with the infinitive's stem ("mangi" for MANGIARE), so "magio" is accepted for
// "MANGIO" while "mangia" is not. Stem changes are part of the conjugation:
// "sono" is still wrong for "SUENO" (SONAR).
//
// Keep in sync with conjugaciones_api/verbs/answers.py.

export const EXACT = 'exact';
export const ROOT_TYPO = 'root_typo';

// roots shorter than this are too short to tell a typo from a different word
const MIN_ROOT = 3;

// lowercase, straighten apostrophes and collapse whitespace; keeps accents
const tidy = text => (text || '')
  .normalize('NFC')
  .toLowerCase()
  .replace(/’/g, "'")
  .trim()
  .split(/\s+/)
  .filter(Boolean)
  .join(' ');

// NFD splits "ó" into "o" + combining accent; drop marks only after vowels
// so "ñ" survives, then recompose
const foldVowels = text => text
  .normalize('NFD')
  .replace(/([aeiou])[̀-ͯ]+/g, '$1')
  .normalize('NFC');

export const normalize = text => foldVowels(tidy(text));

const product = choices => choices.reduce(
  (acc, options) => acc.flatMap(prefix => options.map(option => prefix + option)),
  ['']
);

// "preoccupato/a" -> ["preoccupato", "preoccupata"]
const expandSlashes = text => {
  const parts = text.split(/(\S+)\/(\S+)/);
  const choices = [[parts[0]]];
  for (let i = 1; i < parts.length; i += 3) {
    const word = parts[i];
    const ending = parts[i + 1];
    choices.push([word, ending.length < word.length ? word.slice(0, -ending.length) + ending : ending]);
    choices.push([parts[i + 2]]);
  }
  return product(choices);
};

// "m(u)ovevo" -> ["muovevo", "movevo"]
const expandOptional = text => product(
  text.split(/\(([^()]*)\)/).map((part, i) => (i % 2 === 0 ? [part] : [part, '']))
);

// every spelling the stored form accepts, accents kept, in a stable order
const variants = expected => {
  const alternatives = tidy(expected).split(',').map(a => a.trim()).filter(Boolean);
  if (alternatives.length === 0) {
    return [];
  }

  const leadWords = alternatives[0].split(' ');
  const full = alternatives.map(alt => {
    const words = alt.split(' ');
    const missing = leadWords.length - words.length;
    return (missing > 0 ? [...leadWords.slice(0, missing), ...words] : words).join(' ');
  });

  return [...new Set(full.flatMap(alt => expandSlashes(alt).flatMap(expandOptional)).map(tidy))];
};

export const acceptedAnswers = expected => new Set(variants(expected).map(foldVowels));

// 'mangiare' -> 'mangi', 'abandonarse' -> 'abandon', 'mudar(se)' -> 'mud'
export const verbStem = infinitive => normalize(infinitive)
  .replace('(se)', '')
  .replace('(si)', '')
  .replace(/rs[ei]$/, 'r')
  .replace(/[aeiou](?:rre|re|r)$/, '');

// optimal string alignment (insert, delete, substitute, swap neighbours).
// Returns the distance and which letters of `target` the typed `typed` got wrong.
const alignment = (typed, target) => {
  const rows = Array.from({ length: typed.length + 1 }, (_, i) =>
    Array.from({ length: target.length + 1 }, (_, j) => (i * j === 0 ? i + j : 0)));
  for (let i = 1; i <= typed.length; i++) {
    for (let j = 1; j <= target.length; j++) {
      rows[i][j] = Math.min(
        rows[i - 1][j] + 1,
        rows[i][j - 1] + 1,
        rows[i - 1][j - 1] + (typed[i - 1] === target[j - 1] ? 0 : 1),
      );
      if (i > 1 && j > 1 && typed[i - 1] === target[j - 2] && typed[i - 2] === target[j - 1]) {
        rows[i][j] = Math.min(rows[i][j], rows[i - 2][j - 2] + 1);
      }
    }
  }

  // walk back to find the letters of `target` involved in each edit
  const marks = new Set();
  let i = typed.length;
  let j = target.length;
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && rows[i][j] === rows[i - 1][j - 1] && typed[i - 1] === target[j - 1]) {
      i--; j--;
    } else if (i > 0 && j > 0 && rows[i][j] === rows[i - 1][j - 1] + 1) {
      marks.add(j - 1); i--; j--; // wrong letter
    } else if (i > 1 && j > 1 && typed[i - 1] === target[j - 2] && typed[i - 2] === target[j - 1]
      && rows[i][j] === rows[i - 2][j - 2] + 1) {
      marks.add(j - 1); marks.add(j - 2); i -= 2; j -= 2; // swapped letters
    } else if (j > 0 && rows[i][j] === rows[i][j - 1] + 1) {
      marks.add(j - 1); j--; // missing letter
    } else {
      marks.add(Math.min(j, target.length - 1)); i--; // extra letter: flag where it went in
    }
  }
  return { distance: rows[typed.length][target.length], marks };
};

// how many leading letters of an expected word are root rather than conjugation
export const rootLength = (word, stem) => {
  let shared = 0;
  while (shared < Math.min(word.length, stem.length) && word[shared] === stem[shared]) {
    shared++;
  }
  // the last letter is always conjugation, so a bare stem can't swallow the word
  shared = Math.min(shared, word.length - 1);
  return shared >= MIN_ROOT ? shared : 0;
};

// the letters of `word` to flag, or null if `given` isn't just a root slip
const rootTypoMarks = (word, given, stem) => {
  const root = rootLength(word, stem);
  if (!root) {
    return null;
  }
  const ending = word.slice(root);
  const givenRoot = given.slice(0, given.length - ending.length);
  // the letter before the ending anchors the boundary: "mangiao" is not "mangio"
  if (!given.endsWith(ending) || !givenRoot || givenRoot[givenRoot.length - 1] !== word[root - 1]) {
    return null;
  }
  const { distance, marks } = alignment(givenRoot, word.slice(0, root));
  return distance > 0 && distance <= Math.max(1, Math.floor(root / 3)) ? marks : null;
};

// letter positions in `variant` to flag, or null if it doesn't match
const matchWithRootTypos = (variant, given, stem) => {
  const words = variant.split(' ');
  const givenWords = given.split(' ');
  if (words.length !== givenWords.length) {
    return null;
  }
  const flagged = [];
  let offset = 0;
  for (let w = 0; w < words.length; w++) {
    if (words[w] !== givenWords[w]) {
      const marks = rootTypoMarks(words[w], givenWords[w], stem);
      if (!marks) {
        return null;
      }
      marks.forEach(m => flagged.push(offset + m));
    }
    offset += words[w].length + 1;
  }
  return flagged.sort((a, b) => a - b);
};

// { result: EXACT | ROOT_TYPO | null, display, marks }
// For ROOT_TYPO, `display` is the accepted spelling and `marks` the indexes of
// its letters the typed answer got wrong.
export const checkAnswer = (expected, given, infinitive) => {
  const answer = normalize(given);
  if (!answer) {
    return { result: null };
  }
  const spellings = variants(expected);
  const folded = spellings.map(foldVowels);
  if (folded.includes(answer)) {
    return { result: EXACT };
  }
  const stem = infinitive ? verbStem(infinitive) : '';
  if (stem) {
    for (let v = 0; v < folded.length; v++) {
      const marks = matchWithRootTypos(folded[v], answer, stem);
      if (marks) {
        // folding keeps one letter per letter, so positions carry over; if a
        // stray combining mark broke that, show the spelling without flags
        const display = spellings[v];
        return { result: ROOT_TYPO, display, marks: display.length === folded[v].length ? marks : [] };
      }
    }
  }
  return { result: null };
};

export const isCorrectAnswer = (expected, given, infinitive) =>
  checkAnswer(expected, given, infinitive).result !== null;
