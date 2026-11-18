import random

from django.core.cache import caches
from rest_framework import generics, permissions, status, response, viewsets

from .constants import MOST_COMMON_INFINITIVES_BY_LANGUAGE
from .models import Verb, VerbWeighter
from .serializers import VerbSerializer, VerbResponseSerializer

MOST_COMMON_TEMPLATE = '__%s__most_common'


class VerbsViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Verb.objects.all()
    serializer_class = VerbSerializer

    def _get_most_common(self, language):
        rcache = caches['redis']

        cache_key = MOST_COMMON_TEMPLATE % language
        cache_results = rcache.get(cache_key)
        if cache_results:
            return cache_results

        most_common_infinitives = MOST_COMMON_INFINITIVES_BY_LANGUAGE[language]
        most_common = Verb.objects.filter(infinitive__in=most_common_infinitives)
        most_common_list = list(most_common)

        rcache.set(cache_key, most_common_list, None)

        return most_common_list

    def _get_random_verbs(self, language):
        verb_count = Verb.objects.filter(language=language).count() - 26
        rand_idx = random.randint(0, verb_count)

        return [v for v in Verb.objects.filter(language=language)[rand_idx:(rand_idx + 25)]]

    def list(self, request):
        language_str = self.request.query_params.get('l', None)
        if not language_str:
            return response.Response(
                data={'errors': ['Bad language str in query']},
                status=400
            )

        language = Verb.Languages(language_str)

        if request.user.is_authenticated:
            verbs = [
                vw.verb for vw in
                VerbWeighter.heaviest_verbs(user=request.user, language=language, num_verbs=50)
            ]
        else:
            verbs = self._get_random_verbs(language=language)
            most_common = self._get_most_common(language=language)
            verbs += random.sample(most_common, min(len(most_common), 50))
            # random.shuffle mutates the list
            random.shuffle(verbs)

        serializer = self.get_serializer(
            data=verbs,
            many=True,
        )
        serializer.is_valid()

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
                if not correct_answer:
                    continue

                if answer.lower() == correct_answer.strip().lower():
                    total_correct += 1
                else:
                    total_incorrect += 1

        weighter = VerbWeighter.objects.get_or_create(verb=verb, user=request.user)[0]
        weighter.total_correct += total_correct
        weighter.total_incorrect += total_incorrect
        weighter.times_seen += 1
        weighter.save()

        return response.Response(data={'weight': weighter.weight}, status=200)
