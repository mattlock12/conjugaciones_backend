"""
Make sure to EXPORT PYTHONPATH=. from the root dir before running this
Then run python scripts/verb_csv_importer <path_to_file>
"""
import csv
import sys

from src.constants import EnglishMood, Languages
from src.models import Verb, VerbConjugation

WEIRD_MOODS = [
    EnglishMood.IMPERATIVE_AFFIRMATIVE.value, 
    EnglishMood.IMPERATIVE_NEGATIVE.value, 
    EnglishMood.SUBJUNCTIVE.value
]

def main():
    filename = sys.argv[1]
    print("Importing verbs from %s" % filename)
    
    verb_list  = list(csv.reader(open(filename, 'r')))
    verb_ids_by_infinitive = {}
    saved_verbs = 0
    saved_conjugation = 0
    tenses = set()

    for verb_row in verb_list:
        infinitive, infinitive_english, mood, mood_english, tense, tense_english, verb_english, \
            form_1s, form_2s, form_3s, form_1p, form_2p, form_3p, gerund, gerund_english, past_participle, \
            pastparticiple_english = verb_row

        # skip header
        if 'infinitive' in infinitive:
            continue
        
        tenses.add(tense)
        
        verb_id = verb_ids_by_infinitive.get(infinitive, None)
        if not verb_id:
            # need to create the Verb model
            verb = Verb(
                infinitive=infinitive,
                language=Languages.ES,
                infinitive_english=infinitive_english,
                past_participle=past_participle,
                gerund=gerund
            )
            verb.save()
            verb_id = verb.id
            verb_ids_by_infinitive[infinitive] = verb_id
            saved_verbs += 1
        if mood_english in WEIRD_MOODS:
            if mood_english in [EnglishMood.IMPERATIVE_AFFIRMATIVE.value, EnglishMood.IMPERATIVE_NEGATIVE.value]:
                if mood_english == EnglishMood.IMPERATIVE_NEGATIVE.value:
                    continue
                else:
                    mood = 'Imperativo'
            tense = "%s - %s" % (tense, mood)
            tenses.add(tense)

        conjugation = VerbConjugation(
            verb_id=verb_id,
            tense=tense,
            tense_english=tense_english,
            form_1s=form_1s,
            form_2s=form_2s,
            form_3s=form_3s,
            form_1p=form_1p,
            form_2p=form_2p,
            form_3p=form_3p
        )
        conjugation.save()
        saved_conjugation += 1

    print('Saved %s verbs!\nSaved %s conjugations!' % (saved_verbs, saved_conjugation))
    print('Here are all the tenses:\n%s' % ', '.join(tenses))


if __name__ == '__main__':
    print("Starting verb import script")
    main()