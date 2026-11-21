"""
Matching a typed answer against a stored conjugation.

Stored forms can encode several acceptable answers:
  * comma-separated alternatives:  "MORIRÒ, MORRÒ", "PERSE, PERDÉ, PERDETTE"
    A shorter alternative reuses the leading words of the first one:
    "HO PERSO, PERDUTO" accepts "ho perso" and "ho perduto".
  * gendered endings after a slash: "PREOCCUPATO/A", "PREOCCUPATI/E"
  * optional letters in brackets:   "M(U)OVEVO" accepts "muovevo" and "movevo"

Matching ignores case and accents on vowels, so "perde" is accepted for
"PERDÉ" and "hablo" for "HABLÓ". Marks on consonants still count: "nino" is
not "niño".

Given the infinitive, small typos in the root of the verb are forgiven; only
the conjugated part has to be exact. The root of a word is the part it shares
with the infinitive's stem ("mangi" for MANGIARE), so "magio" is accepted for
"MANGIO" while "mangia" is not. Stem changes are part of the conjugation:
"sono" is still wrong for "SUENO" (SONAR).

Keep in sync with client/src/constants/Answers.js.
"""
import itertools
import re
import unicodedata

_SLASH_ENDING = re.compile(r'(\S+)/(\S+)')
_OPTIONAL = re.compile(r'\(([^()]*)\)')
_VOWEL_MARKS = re.compile('([aeiou])[̀-ͯ]+')

EXACT = 'exact'
ROOT_TYPO = 'root_typo'

# roots shorter than this are too short to tell a typo from a different word
MIN_ROOT = 3


def _tidy(text):
    """Lowercase, straighten apostrophes and collapse whitespace; keeps accents."""
    text = unicodedata.normalize('NFC', text or '').lower().replace('’', "'")
    return ' '.join(text.split())


def _fold_vowels(text):
    # NFD splits "ó" into "o" + combining accent; drop marks only after vowels
    # so "ñ" survives, then recompose
    text = unicodedata.normalize('NFD', text)
    return unicodedata.normalize('NFC', _VOWEL_MARKS.sub(r'\1', text))


def normalize(text):
    return _fold_vowels(_tidy(text))


def _expand_slashes(text):
    # "preoccupato/a" -> ["preoccupato", "preoccupata"]
    parts = _SLASH_ENDING.split(text)
    # split() interleaves: [before, word, ending, between, word, ending, after]
    choices = [[parts[0]]]
    for i in range(1, len(parts), 3):
        word, ending = parts[i], parts[i + 1]
        choices.append([word, word[:-len(ending)] + ending if len(ending) < len(word) else ending])
        choices.append([parts[i + 2]])
    return [''.join(combo) for combo in itertools.product(*choices)]


def _expand_optional(text):
    # "m(u)ovevo" -> ["muovevo", "movevo"]
    parts = _OPTIONAL.split(text)
    choices = [[part] if i % 2 == 0 else [part, ''] for i, part in enumerate(parts)]
    return [''.join(combo) for combo in itertools.product(*choices)]


def _variants(expected):
    """Every spelling the stored form accepts, accents kept, in a stable order."""
    alternatives = [alt.strip() for alt in _tidy(expected).split(',') if alt.strip()]
    if not alternatives:
        return []

    lead_words = alternatives[0].split()
    full = []
    for alt in alternatives:
        words = alt.split()
        missing = len(lead_words) - len(words)
        if missing > 0:
            words = lead_words[:missing] + words
        full.append(' '.join(words))

    seen = []
    for alt in full:
        for gendered in _expand_slashes(alt):
            for variant in _expand_optional(gendered):
                variant = _tidy(variant)
                if variant not in seen:
                    seen.append(variant)
    return seen


def accepted_answers(expected):
    return {_fold_vowels(variant) for variant in _variants(expected)}


def verb_stem(infinitive):
    """'mangiare' -> 'mangi', 'abandonarse' -> 'abandon', 'mudar(se)' -> 'mud'."""
    stem = normalize(infinitive).replace('(se)', '').replace('(si)', '')
    stem = re.sub(r'rs[ei]$', 'r', stem)
    return re.sub(r'[aeiou](?:rre|re|r)$', '', stem)


def _edit_distance(a, b):
    """Optimal string alignment distance: insert, delete, substitute, swap neighbours."""
    rows = [[i + j if i * j == 0 else 0 for j in range(len(b) + 1)] for i in range(len(a) + 1)]
    for i in range(1, len(a) + 1):
        for j in range(1, len(b) + 1):
            rows[i][j] = min(
                rows[i - 1][j] + 1,
                rows[i][j - 1] + 1,
                rows[i - 1][j - 1] + (a[i - 1] != b[j - 1]),
            )
            if i > 1 and j > 1 and a[i - 1] == b[j - 2] and a[i - 2] == b[j - 1]:
                rows[i][j] = min(rows[i][j], rows[i - 2][j - 2] + 1)
    return rows[-1][-1]


def root_length(word, stem):
    """How many leading letters of an expected word are root rather than conjugation."""
    shared = 0
    while shared < min(len(word), len(stem)) and word[shared] == stem[shared]:
        shared += 1
    # the last letter is always conjugation, so a bare stem can't swallow the word
    shared = min(shared, len(word) - 1)
    return shared if shared >= MIN_ROOT else 0


def _root_typo_ok(word, given, stem):
    root = root_length(word, stem)
    if not root:
        return False
    ending = word[root:]
    given_root = given[:len(given) - len(ending)]
    # the letter before the ending anchors the boundary: "mangiao" is not "mangio"
    if not given.endswith(ending) or not given_root or given_root[-1] != word[root - 1]:
        return False
    return 0 < _edit_distance(given_root, word[:root]) <= max(1, root // 3)


def _matches_with_root_typos(variant, given, stem):
    words, given_words = variant.split(), given.split()
    if len(words) != len(given_words):
        return False
    return all(
        w == g or _root_typo_ok(w, g, stem)
        for w, g in zip(words, given_words)
    )


def check_answer(expected, given, infinitive=None):
    """EXACT, ROOT_TYPO (accepted, with a slip in the verb's root) or None (wrong)."""
    given = normalize(given)
    if not given:
        return None
    variants = [_fold_vowels(v) for v in _variants(expected)]
    if given in variants:
        return EXACT
    stem = verb_stem(infinitive) if infinitive else ''
    if stem and any(_matches_with_root_typos(v, given, stem) for v in variants):
        return ROOT_TYPO
    return None


def is_correct(expected, given, infinitive=None):
    return check_answer(expected, given, infinitive) is not None
