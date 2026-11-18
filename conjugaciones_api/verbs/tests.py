from rest_framework.test import APITestCase

from users.models import ConjugacionesUser
from .models import Verb, VerbConjugation, VerbWeighter

def make_verb(infinitive, language='ES', **forms):
    verb = Verb.objects.create(language=language, infinitive=infinitive,
                               infinitive_english='to ' + infinitive, past_participle='', gerund='')
    VerbConjugation.objects.create(verb=verb, tense='Presente', **forms)
    return verb


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
