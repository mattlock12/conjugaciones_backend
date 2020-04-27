from django.db import models
from django.utils.translation import gettext_lazy as _

from users.models import ConjugacionesUser


class Verb(models.Model):
    class Languages(models.TextChoices):
        SPANISH = 'ES', _('Español')
        ITALIAN = 'IT', _('Italiano')

    language = models.CharField(max_length=2, choices=Languages.choices)
    infinitive = models.CharField(max_length=127, unique=True)
    infinitive_english = models.CharField(max_length=127)
    past_participle = models.CharField(max_length=127)
    gerund = models.CharField(max_length=127)

    def conjugations(self):
        return self.verbconjugation_set.all()


class VerbConjugation(models.Model):
    verb = models.ForeignKey('Verb', on_delete=models.CASCADE)
    # TODO: enum here?
    tense = models.CharField(max_length=127)
    form_1s = models.CharField(max_length=127, blank=True, null=True)
    form_2s = models.CharField(max_length=127, blank=True, null=True)
    form_3s = models.CharField(max_length=127, blank=True, null=True)
    form_1p = models.CharField(max_length=127, blank=True, null=True)
    form_2p = models.CharField(max_length=127, blank=True, null=True)
    form_3p = models.CharField(max_length=127, blank=True, null=True)


class VerbWeighter(models.Model):
    verb = models.ForeignKey('Verb', on_delete=models.CASCADE)
    user = models.ForeignKey(ConjugacionesUser, on_delete=models.CASCADE)
    weight = models.DecimalField(max_digits=4, decimal_places=2)
    total_correct = models.IntegerField()
    total_incorrect = models.IntegerField()
    last_updated = models.DateTimeField()

    def set_weight(self):
        times_seen_weight = min(50, 50 * (5 / (self.times_seen + 5)))
        correct_ratio_weight = min(50, 50 * (self.total_incorrect / self.total_correct))
        self.weight = times_seen_weight + correct_ratio_weight