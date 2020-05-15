import csv

from django.db import transaction
from django.core.management.base import BaseCommand, CommandError
from verbs.models import Verb, VerbConjugation


WEIRD_MOODS = [
    'Imperative Affirmative',
    'Imperative Negative',
    'Subjunctive',
]


class Command(BaseCommand):
    help = 'Imports Spanish Verbs and their Conjugations from a CSV'

    def add_arguments(self, parser):
        parser.add_argument('-f', '--file', required=True, help='CSV with verbs to import')

    @transaction.atomic
    def handle(self, *args, **options):
        filename = options['file']
        self.stdout.write(self.style.SUCCESS("Importing verbs from %s" % filename))

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
                verb = Verb.objects.create(
                    infinitive=infinitive,
                    language=Verb.Languages('ES'),
                    infinitive_english=infinitive_english,
                    past_participle=past_participle,
                    gerund=gerund
                )
                verb_id = verb.id
                verb_ids_by_infinitive[infinitive] = verb_id
                saved_verbs += 1
            if mood_english in WEIRD_MOODS:
                if mood_english in ['Imperative Affirmative', 'Imperative Negative']:
                    if mood_english == 'Subjunctive':
                        print("WTF I thought imperative/subjunctive didn't happen...")
                        continue
                tense = "%s - %s" % (tense, mood)
                tenses.add(tense)

            VerbConjugation.objects.create(
                verb_id=verb_id,
                tense=tense,
                form_1s=form_1s,
                form_2s=form_2s,
                form_3s=form_3s,
                form_1p=form_1p,
                form_2p=form_2p,
                form_3p=form_3p
            )
            saved_conjugation += 1

        self.stdout.write(self.style.SUCCESS('Saved %s verbs!\nSaved %s conjugations!' % (saved_verbs, saved_conjugation)))
        self.stdout.write(self.style.SUCCESS('Here are all the tenses:\n%s' % ', '.join(tenses)))
