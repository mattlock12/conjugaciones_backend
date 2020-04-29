import random

from django.core.cache import caches
from rest_framework import response, viewsets

from .constants import MOST_COMMON_INFINITIVES_BY_LANGUAGE
from .models import Verb
from .serializers import VerbSerializer


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

        verbs = self._get_random_verbs(language=language)
        most_common = self._get_most_common(language=language)
        verbs += random.sample(most_common, min(len(most_common), 25))
        # random.shuffle mutates the list
        random.shuffle(verbs)

        serializer = self.get_serializer(
            data=verbs,
            many=True,
        )
        serializer.is_valid()

        return response.Response(data=serializer.data, status=200)
