import collections
import random

import django.utils.timezone as dtz
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

    def verb_conjugations(self):
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
    """
    A correct answer is considered to be all forms correctly answered without error.
    If any forms are left blank, that is considered unfinished, and neither correct nor incorrect.
    However, if a mistake is made, it is considered incorrect.
    """
    verb = models.ForeignKey('Verb', on_delete=models.CASCADE)
    user = models.ForeignKey(ConjugacionesUser, on_delete=models.CASCADE)
    weight = models.DecimalField(max_digits=5, decimal_places=2, default=50.00)
    total_correct = models.IntegerField(default=0)
    total_incorrect = models.IntegerField(default=0)
    times_seen = models.IntegerField(default=0)
    last_updated = models.DateTimeField(blank=True, null=True)

    @classmethod
    def heaviest_verbs(cls, user, language, num_verbs=50):
        all_verb_weighters = cls.objects\
            .select_related('verb')\
            .filter(
                user=user,
                verb__language=language
            )

        verb_weighters_by_weight = collections.defaultdict(list)
        for vw in all_verb_weighters:
            verb_weighters_by_weight[vw.weight].append(vw)

        retval = []
        for weight in sorted(verb_weighters_by_weight.keys(), reverse=True):
            if len(retval) >= num_verbs:
                continue

            vws = verb_weighters_by_weight[weight]
            retval += random.sample(vws, min(len(vws), num_verbs - len(retval)))

        return retval

    def set_weight(self):
        # don't set weight on initial creation
        if not self.id:
            return

        # avoid division by zero errors on intial create or in the case that stupid losers can't get any correct
        incorrect_correct_ratio = 0
        if self.total_correct:
            incorrect_correct_ratio = self.total_incorrect / self.total_correct

        times_seen_weight = min(50, 50 * (5 / (self.times_seen + 5)))
        correct_ratio_weight = min(50, 50 * (incorrect_correct_ratio))
        self.weight = times_seen_weight + correct_ratio_weight

    def save(self, *args, **kwargs):
        self.set_weight()
        self.last_updated = dtz.now()

        super(VerbWeighter, self).save(*args, **kwargs)