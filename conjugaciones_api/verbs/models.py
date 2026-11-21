import heapq
import math
import random
from datetime import timedelta
from decimal import Decimal

import django.utils.timezone as dtz
from django.db import models
from django.utils.translation import gettext_lazy as _

from users.models import ConjugacionesUser
from .constants import MOST_COMMON_INFINITIVES_BY_LANGUAGE


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


# --- verb selection tuning -------------------------------------------------
# Each answer submission is one "review"; older reviews fade by DECAY each time.
DECAY = 0.7
# Common verbs are this many times likelier to be picked, all else equal.
COMMON_BOOST = 3.0
# Unseen, uncommon verbs are damped so the long tail doesn't crowd out review.
NEW_VERB_FACTOR = 0.5
# struggle = STRUGGLE_FLOOR + STRUGGLE_SCALE * (1 - accuracy)^2
STRUGGLE_FLOOR = 0.2
STRUGGLE_SCALE = 4.0
# Spacing: a verb's "due" interval grows with demonstrated mastery.
BASE_INTERVAL = timedelta(minutes=10)
MAX_INTERVAL = timedelta(days=30)
INTERVAL_GROWTH = 3.0
MIN_SPACING = 0.05
MAX_SPACING = 1.5
# No verb's chance of being picked ever reaches zero.
MIN_WEIGHT = 0.02


def estimated_accuracy(decayed_score, decayed_count):
    """Laplace-smoothed, recency-weighted accuracy in (0, 1); 0.5 when unseen."""
    return (decayed_score + 1) / (decayed_count + 2)


def compute_weight(weighter, is_common, now):
    """
    Relative likelihood of presenting a verb: frequency x struggle x spacing.

    `weighter` is the user's VerbWeighter for the verb, or None if unseen.
    """
    frequency = COMMON_BOOST if is_common else 1.0

    if weighter is None or not weighter.decayed_count:
        if not is_common:
            frequency *= NEW_VERB_FACTOR
        accuracy = estimated_accuracy(0, 0)
        spacing = 1.0
    else:
        accuracy = estimated_accuracy(weighter.decayed_score, weighter.decayed_count)
        interval = min(
            MAX_INTERVAL,
            BASE_INTERVAL * math.exp(INTERVAL_GROWTH * accuracy * weighter.decayed_count),
        )
        if weighter.last_updated is None:
            spacing = 1.0
        else:
            elapsed = max(timedelta(0), now - weighter.last_updated)
            spacing = min(MAX_SPACING, max(MIN_SPACING, elapsed / interval))

    struggle = STRUGGLE_FLOOR + STRUGGLE_SCALE * (1 - accuracy) ** 2

    return max(MIN_WEIGHT, frequency * struggle * spacing)


def weighted_sample(items, weights, k, rng=random):
    """
    Weighted random sampling without replacement (Efraimidis-Spirakis):
    each item's chance of selection is proportional to its weight, but
    which items appear in a given batch is unpredictable.
    """
    keyed = (
        (rng.random() ** (1.0 / w), item)
        for item, w in zip(items, weights)
    )
    return [item for _, item in heapq.nlargest(k, keyed, key=lambda kv: kv[0])]


class VerbWeighter(models.Model):
    """
    A correct answer is considered to be all forms correctly answered without error.
    If any forms are left blank, that is considered unfinished, and neither correct nor incorrect.
    However, if a mistake is made, it is considered incorrect.
    """
    verb = models.ForeignKey('Verb', on_delete=models.CASCADE)
    user = models.ForeignKey(ConjugacionesUser, on_delete=models.CASCADE)
    # Snapshot of compute_weight at the last review; selection recomputes live
    # because spacing depends on the current time.
    weight = models.DecimalField(max_digits=5, decimal_places=2, default=50.00)
    total_correct = models.IntegerField(default=0)
    total_incorrect = models.IntegerField(default=0)
    times_seen = models.IntegerField(default=0)
    # Recency-weighted sums of per-review accuracy and review count.
    decayed_score = models.FloatField(default=0.0)
    decayed_count = models.FloatField(default=0.0)
    last_updated = models.DateTimeField(blank=True, null=True)

    @property
    def accuracy(self):
        return estimated_accuracy(self.decayed_score, self.decayed_count)

    def record_review(self, correct, incorrect):
        """Fold one answer submission into this verb's history and save."""
        self.total_correct += correct
        self.total_incorrect += incorrect
        self.times_seen += 1

        answered = correct + incorrect
        # blank submissions are unfinished: don't move the accuracy estimate
        if answered:
            self.decayed_score = DECAY * self.decayed_score + correct / answered
            self.decayed_count = DECAY * self.decayed_count + 1

        now = dtz.now()
        self.last_updated = now
        is_common = self.verb.infinitive in MOST_COMMON_INFINITIVES_BY_LANGUAGE.get(self.verb.language, ())
        self.weight = Decimal(compute_weight(self, is_common, now)).quantize(Decimal('0.01'))
        self.save()

    @classmethod
    def sample_verbs(cls, user, language, num_verbs=50, rng=random, now=None):
        """
        Pick `num_verbs` verbs for `user`, favouring common verbs and verbs the
        user struggles with, disfavouring mastered and just-seen verbs, with
        enough randomness that nothing recurs on a fixed schedule.
        """
        now = now or dtz.now()
        common = MOST_COMMON_INFINITIVES_BY_LANGUAGE.get(language, ())

        candidates = list(Verb.objects.filter(language=language).values_list('id', 'infinitive'))
        weighters = {
            vw.verb_id: vw
            for vw in cls.objects.filter(user=user, verb__language=language)
        }

        weights = [
            compute_weight(weighters.get(verb_id), infinitive in common, now)
            for verb_id, infinitive in candidates
        ]
        chosen_ids = weighted_sample([verb_id for verb_id, _ in candidates], weights, num_verbs, rng)

        verbs_by_id = Verb.objects.in_bulk(chosen_ids)
        return [verbs_by_id[verb_id] for verb_id in chosen_ids]
