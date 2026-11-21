"""
Matching a typed answer against a stored conjugation.

Stored forms can encode several acceptable answers:
  * comma-separated alternatives:  "MORIRÒ, MORRÒ", "PERSE, PERDÉ, PERDETTE"
    A shorter alternative reuses the leading words of the first one:
    "HO PERSO, PERDUTO" accepts "ho perso" and "ho perduto".
  * gendered endings after a slash: "PREOCCUPATO/A", "PREOCCUPATI/E"
  * optional letters in brackets:   "M(U)OVEVO" accepts "muovevo" and "movevo"

Keep in sync with client/src/constants/Answers.js.
"""
import itertools
import re

_SLASH_ENDING = re.compile(r'(\S+)/(\S+)')
_OPTIONAL = re.compile(r'\(([^()]*)\)')


def normalize(text):
    text = (text or '').replace('’', "'").lower()
    return ' '.join(text.split())


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


def accepted_answers(expected):
    expected = normalize(expected)
    alternatives = [alt.strip() for alt in expected.split(',') if alt.strip()]
    if not alternatives:
        return set()

    lead_words = alternatives[0].split()
    full = []
    for alt in alternatives:
        words = alt.split()
        missing = len(lead_words) - len(words)
        if missing > 0:
            words = lead_words[:missing] + words
        full.append(' '.join(words))

    return {
        normalize(variant)
        for alt in full
        for gendered in _expand_slashes(alt)
        for variant in _expand_optional(gendered)
    }


def is_correct(expected, given):
    given = normalize(given)
    return bool(given) and given in accepted_answers(expected)
