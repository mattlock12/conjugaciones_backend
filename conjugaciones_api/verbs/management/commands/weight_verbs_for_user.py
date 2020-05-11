import csv

from django.db import transaction
from django.core.management.base import BaseCommand, CommandError
from verbs.models import Verb, VerbWeighter
from users.models import ConjugacionesUser


WEIRD_MOODS = [
    'Imperative Affirmative',
    'Imperative Negative',
    'Subjunctive',
]


class Command(BaseCommand):
    help = 'Create VerbWeighters for a User'

    def add_arguments(self, parser):
        parser.add_argument('-e', '--email', required=True, help='Email of user to weight verbs for')

    @transaction.atomic
    def handle(self, *args, **options):
        email = options['email']
        self.stdout.write("Weighting verbs for User with email %s" % email)

        user = ConjugacionesUser.objects.get(email=email)

        weights_created = 0
        for verb in Verb.objects.all():
            VerbWeighter.objects.get_or_create(user=user, verb=verb)
            weights_created += 1

        self.stdout.write(self.style.SUCCESS('Created %s VerbWeighters' % weights_created))
