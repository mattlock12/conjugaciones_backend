"""
Make sure to EXPORT PYTHONPATH=. from the root dir before running this
Then run python scripts/verb_csv_importer <path_to_file>
"""
import csv
import sys

from src.constants import Languages
from src.models import Verb, VerbConjugation


def main():
    filename = sys.argv[1]
    print("Importing Italian verbs from %s" % filename)
    
    verb_list  = list(csv.reader(open(filename, 'r')))
    verb_ids_by_infinitive = {}
    saved_verbs = 0
    saved_conjugation = 0
    tenses = set()

    for verb_row in verb_list:
        it_infinitive, en_infinitive, tense, form_1s, form_2s, form_3s, form_1p, form_2p, form_3p = verb_row

        # skip header
        if 'infinitive' in it_infinitive:
            continue
        
        tenses.add(tense)
        
        verb_id = verb_ids_by_infinitive.get(it_infinitive, None)
        if not verb_id:
            # need to create the Verb model
            verb = Verb(
                infinitive=it_infinitive,
                language=Languages.IT,
                infinitive_english=en_infinitive,
                past_participle='',
                gerund=''
            )
            verb.save()
            verb_id = verb.id
            verb_ids_by_infinitive[it_infinitive] = verb_id
            saved_verbs += 1

        conjugation = VerbConjugation(
            verb_id=verb_id,
            tense=tense,
            tense_english='',
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