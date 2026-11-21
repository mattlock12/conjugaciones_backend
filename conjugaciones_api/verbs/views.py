import random

from django.core.cache import caches
from django.db.models import prefetch_related_objects
from rest_framework import generics, permissions, response, status, viewsets

from .answers import is_correct
from .constants import MOST_COMMON_INFINITIVES_BY_LANGUAGE
from .models import Verb, VerbWeighter
from .serializers import VerbSerializer, VerbResponseSerializer

# v2: entries now hold verb ids rather than pickled model instances, and the
# old key may hold a list built from the misspelled infinitives in constants.
MOST_COMMON_TEMPLATE = '__%s__most_common_v2'
RANDOM_VERB_COUNT = 25
NUM_VERBS = 50


class VerbsViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Verb.objects.prefetch_related('verbconjugation_set')
    serializer_class = VerbSerializer

    def _get_most_common(self, language):
        rcache = caches['redis']

        cache_key = MOST_COMMON_TEMPLATE % language
        verb_ids = rcache.get(cache_key)
        if verb_ids is None:
            verb_ids = list(
                Verb.objects
                .filter(language=language, infinitive__in=MOST_COMMON_INFINITIVES_BY_LANGUAGE[language])
                .values_list('id', flat=True)
            )
            rcache.set(cache_key, verb_ids, None)

        return list(Verb.objects.filter(id__in=verb_ids))

    def _get_random_verbs(self, language):
        verbs = Verb.objects.filter(language=language).order_by('id')
        start = random.randint(0, max(0, verbs.count() - RANDOM_VERB_COUNT))

        return list(verbs[start:start + RANDOM_VERB_COUNT])

    def list(self, request):
        try:
            language = Verb.Languages(request.query_params.get('l', '').upper())
        except ValueError:
            return response.Response(
                data={'errors': ['Bad language str in query']},
                status=status.HTTP_400_BAD_REQUEST
            )

        if request.user.is_authenticated:
            verbs = VerbWeighter.sample_verbs(user=request.user, language=language, num_verbs=NUM_VERBS)
        else:
            verbs = self._get_random_verbs(language=language)
            most_common = self._get_most_common(language=language)
            verbs += random.sample(most_common, min(len(most_common), NUM_VERBS))
            # random.shuffle mutates the list
            random.shuffle(verbs)

        prefetch_related_objects(verbs, 'verbconjugation_set')
        serializer = self.get_serializer(verbs, many=True)

        return response.Response(data=serializer.data, status=200)


class VerbResponseViewSet(generics.GenericAPIView):
    serializer_class = VerbResponseSerializer
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        verb = generics.get_object_or_404(Verb, id=request.data.get('verb_id'))
        conjugations_by_tense = {
            c.tense.lower(): c
            for c in verb.verb_conjugations()
        }

        vr_serializer = self.get_serializer(data=request.data)
        vr_serializer.is_valid(raise_exception=True)

        total_correct = 0
        total_incorrect = 0
        for answers_this_tense in vr_serializer.validated_data['answers']:
            conjugation_this_tense = conjugations_by_tense.get(answers_this_tense['tense'].lower())
            if conjugation_this_tense is None:
                continue

            for form, answer in answers_this_tense.items():
                if form == 'tense':
                    continue

                answer = answer.strip()
                # blank answers are unfinished: neither correct nor incorrect
                if not answer:
                    continue

                correct_answer = getattr(conjugation_this_tense, form.replace('form', 'form_'), None)
                # placeholders like "—" mark persons a defective verb doesn't have
                if not correct_answer or not any(ch.isalpha() for ch in correct_answer):
                    continue

                if is_correct(correct_answer, answer, verb.infinitive):
                    total_correct += 1
                else:
                    total_incorrect += 1

        weighter = VerbWeighter.objects.get_or_create(verb=verb, user=request.user)[0]
        weighter.record_review(total_correct, total_incorrect)

        return response.Response(data={'weight': weighter.weight}, status=200)
