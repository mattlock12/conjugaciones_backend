"""
Make sure to EXPORT PYTHON_PATH=. from the root dir before running this
Then run python scripts/verb_csv_importer <path_to_file>
"""
import csv
import sys

from src.models import Verb, VerbConjugation

def main():
    filename = sys.argv[1]
    print("Importing verbs from %s" % filename)
    
    verb_list  = list(csv.reader(open(filename, 'r')))
    verb_ids_by_infinitive = {}
    saved_verbs = 0
    saved_conjugation = 0

    for verb_row in verb_list:
        infinitive, infinitive_english, mood, mood_english, tense, tense_english, verb_english, \
            form_1s, form_2s, form_3s, form_1p, form_2p, form_3p, gerund, gerund_english, past_participle, \
            pastparticiple_english = verb_row

        # skip header
        if 'infinitive' in infinitive:
            continue
        
        verb_id = verb_ids_by_infinitive.get(infinitive, None)
        if not verb_id:
            # need to create the Verb model
            verb = Verb(
                infinitive=infinitive,
                infinitive_english=infinitive_english,
                past_participle=past_participle,
                gerund=gerund
            )
            verb.save()
            verb_id = verb.id
            verb_ids_by_infinitive[infinitive] = verb_id
            saved_verbs += 1
        
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


if __name__ == '__main__':
    print("Starting verb import script")
    main()