from django.test import override_settings
from rest_framework.test import APITestCase

from users.models import ConjugacionesUser
from .constants import MOST_COMMON_ES
from .models import Verb, VerbConjugation, VerbWeighter

LOCMEM_CACHES = {
    'default': {'BACKEND': 'django.core.cache.backends.locmem.LocMemCache', 'LOCATION': 'default'},
    'redis': {'BACKEND': 'django.core.cache.backends.locmem.LocMemCache', 'LOCATION': 'redis'},
}


def make_verb(infinitive, language='ES', **forms):
    verb = Verb.objects.create(language=language, infinitive=infinitive,
                               infinitive_english='to ' + infinitive, past_participle='', gerund='')
    VerbConjugation.objects.create(verb=verb, tense='Presente', **forms)
    return verb


class MostCommonConstantsTests(APITestCase):
    def test_infinitives_have_no_stray_whitespace(self):
        self.assertEqual([v for v in MOST_COMMON_ES if v != v.strip()], [])


@override_settings(CACHES=LOCMEM_CACHES)
class VerbListTests(APITestCase):
    url = '/api/verbs/'

    def setUp(self):
        from django.core.cache import caches
        caches['redis'].clear()

    def test_missing_language_is_400(self):
        self.assertEqual(self.client.get(self.url).status_code, 400)

    def test_unknown_language_is_400(self):
        self.assertEqual(self.client.get(self.url, {'l': 'FR'}).status_code, 400)

    def test_lowercase_language_accepted(self):
        make_verb('hablar', form_1s='hablo')
        self.assertEqual(self.client.get(self.url, {'l': 'es'}).status_code, 200)

    def test_fewer_verbs_than_page_size(self):
        """randint() used to be called with a negative upper bound and 500."""
        make_verb('hablar', form_1s='hablo')
        resp = self.client.get(self.url, {'l': 'ES'})
        self.assertEqual(resp.status_code, 200)
        infinitives = {v['infinitive'] for v in resp.json()}
        self.assertEqual(infinitives, {'hablar'})

    def test_serializes_conjugations_in_camel_case(self):
        make_verb('ganar', form_1s='gano', form_2s='ganas')
        verb = self.client.get(self.url, {'l': 'ES'}).json()[0]
        self.assertEqual(verb['infinitiveEnglish'], 'to ganar')
        conj = verb['verbConjugations'][0]
        self.assertEqual((conj['tense'], conj['form1s'], conj['form2s']), ('Presente', 'gano', 'ganas'))

    def test_most_common_includes_previously_misspelled(self):
        for i in range(30):
            make_verb(f'zzz{i}')
        make_verb('ganar')
        make_verb('haber')
        with self.assertNumQueries(5):
            # count, random slice, cached most-common ids, most-common verbs, conjugations
            infinitives = {v['infinitive'] for v in self.client.get(self.url, {'l': 'ES'}).json()}
        self.assertTrue({'ganar', 'haber'} <= infinitives)

    def test_stale_token_is_401(self):
        make_verb('hablar')
        resp = self.client.get(self.url, {'l': 'ES'}, HTTP_AUTHORIZATION='Token deadbeef')
        self.assertEqual(resp.status_code, 401)

    def test_authenticated_user_gets_heaviest_verbs(self):
        user = ConjugacionesUser.objects.create_user('a@example.com', 'a@example.com', 'pw')
        heavy = make_verb('hablar')
        light = make_verb('comer')
        make_verb('parlare', language='IT')
        VerbWeighter.objects.create(user=user, verb=heavy, weight=90)
        VerbWeighter.objects.create(user=user, verb=light, weight=10)
        resp = self.client.get(self.url, {'l': 'ES'}, HTTP_AUTHORIZATION=f'Token {user.token}')
        self.assertEqual([v['infinitive'] for v in resp.json()], ['hablar', 'comer'])


class VerbResponseTests(APITestCase):
    url = '/api/responses/'

    def setUp(self):
        self.user = ConjugacionesUser.objects.create_user('a@example.com', 'a@example.com', 'pw')
        self.other = ConjugacionesUser.objects.create_user('b@example.com', 'b@example.com', 'pw')
        self.verb = make_verb('hablar', form_1s='hablo', form_2s='hablas', form_3s='habla')
        self.auth = {'HTTP_AUTHORIZATION': f'Token {self.user.token}'}

    def _post(self, answers, verb_id=None, **kwargs):
        return self.client.post(self.url, {'verbId': verb_id or self.verb.id, 'answers': answers},
                                format='json', **kwargs)

    def test_requires_authentication(self):
        resp = self.client.post(self.url, {
            'user': {'email': 'b@example.com'},
            'verbId': self.verb.id,
            'answers': [{'tense': 'Presente', 'form1s': 'hablo'}],
        }, format='json')
        self.assertEqual(resp.status_code, 401)
        self.assertFalse(VerbWeighter.objects.filter(user=self.other).exists())

    def test_scores_answers_for_token_user(self):
        resp = self._post([{'tense': 'presente', 'form1s': ' Hablo ', 'form2s': 'hablo', 'form3s': ''}],
                          **self.auth)
        self.assertEqual(resp.status_code, 200)
        weighter = VerbWeighter.objects.get(user=self.user, verb=self.verb)
        # blank answers are neither correct nor incorrect
        self.assertEqual((weighter.total_correct, weighter.total_incorrect, weighter.times_seen), (1, 1, 1))

    def test_unknown_tense_and_empty_form_are_ignored(self):
        resp = self._post([{'tense': 'Futuro', 'form1s': 'hablaré'},
                           {'tense': 'Presente', 'form1p': 'hablamos'}], **self.auth)
        self.assertEqual(resp.status_code, 200)
        weighter = VerbWeighter.objects.get(user=self.user, verb=self.verb)
        self.assertEqual((weighter.total_correct, weighter.total_incorrect), (0, 0))

    def test_unknown_verb_is_404(self):
        self.assertEqual(self._post([], verb_id=999999, **self.auth).status_code, 404)

    def test_invalid_payload_is_400(self):
        self.assertEqual(self._post([{'form1s': 'hablo'}], **self.auth).status_code, 400)
