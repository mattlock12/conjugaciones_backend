// Matching a typed answer against a stored conjugation.
//
// Stored forms can encode several acceptable answers:
//   * comma-separated alternatives:  "MORIRÒ, MORRÒ", "PERSE, PERDÉ, PERDETTE"
//     A shorter alternative reuses the leading words of the first one:
//     "HO PERSO, PERDUTO" accepts "ho perso" and "ho perduto".
//   * gendered endings after a slash: "PREOCCUPATO/A", "PREOCCUPATI/E"
//   * optional letters in brackets:   "M(U)OVEVO" accepts "muovevo" and "movevo"
//
// Keep in sync with conjugaciones_api/verbs/answers.py.

export const normalize = text => (text || '')
  .replace(/’/g, "'")
  .toLowerCase()
  .trim()
  .split(/\s+/)
  .filter(Boolean)
  .join(' ');

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

export const acceptedAnswers = expected => {
  const alternatives = normalize(expected).split(',').map(a => a.trim()).filter(Boolean);
  if (alternatives.length === 0) {
    return new Set();
  }

  const leadWords = alternatives[0].split(' ');
  const full = alternatives.map(alt => {
    const words = alt.split(' ');
    const missing = leadWords.length - words.length;
    return (missing > 0 ? [...leadWords.slice(0, missing), ...words] : words).join(' ');
  });

  return new Set(
    full.flatMap(alt => expandSlashes(alt).flatMap(expandOptional)).map(normalize)
  );
};

export const isCorrectAnswer = (expected, given) => {
  const answer = normalize(given);
  return answer.length > 0 && acceptedAnswers(expected).has(answer);
};
