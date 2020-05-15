import csv

from django.db import transaction
from django.core.management.base import BaseCommand, CommandError
from verbs.models import Verb, VerbConjugation


class Command(BaseCommand):
    help = 'Imports Italian Verbs and their Conjugations from a CSV'

    def add_arguments(self, parser):
        parser.add_argument('-f', '--file', required=True, help='CSV with verbs to import')

    @transaction.atomic
    def handle(self, *args, **options):
        filename = options['file']
        self.stdout.write(self.style.SUCCESS("Importing Italian verbs from %s" % filename))

        verb_list  = list(csv.reader(open(filename, 'r')))
        verb_ids_by_infinitive = {v.infinitive: v.id for v in Verb.objects.all()}
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
                verb = Verb.objects.create(
                    infinitive=it_infinitive,
                    language=Verb.Languages('IT'),
                    infinitive_english=en_infinitive,
                    past_participle='',
                    gerund=''
                )
                verb_id = verb.id
                verb_ids_by_infinitive[it_infinitive] = verb_id
                saved_verbs += 1

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