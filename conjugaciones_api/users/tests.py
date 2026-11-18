from rest_framework.test import APITestCase

from verbs.models import Verb, VerbWeighter
from .models import ConjugacionesUser


class SignupTests(APITestCase):
    url = '/api/users/'

    def setUp(self):
        Verb.objects.create(language='ES', infinitive='hablar', infinitive_english='to speak',
                            past_participle='hablado', gerund='hablando')
        Verb.objects.create(language='IT', infinitive='parlare', infinitive_english='to speak',
                            past_participle='', gerund='')

    def _signup(self, **overrides):
        data = {'email': 'a@example.com', 'password': 'pw12345678', 'confirmpassword': 'pw12345678'}
        data.update(overrides)
        return self.client.post(self.url, data, format='json')

    def test_signup_creates_user_and_weighters(self):
        resp = self._signup()
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.json()['email'], 'a@example.com')
        user = ConjugacionesUser.objects.get(username='a@example.com')
        self.assertEqual(resp.json()['token'], user.token)
        self.assertEqual(VerbWeighter.objects.filter(user=user).count(), 2)

    def test_missing_confirmpassword_is_400(self):
        resp = self.client.post(self.url, {'email': 'a@example.com', 'password': 'x'}, format='json')
        self.assertEqual(resp.status_code, 400)

    def test_mismatched_passwords_is_400(self):
        self.assertEqual(self._signup(confirmpassword='nope').status_code, 400)

    def test_missing_email_is_400(self):
        self.assertEqual(self._signup(email='').status_code, 400)

    def test_duplicate_email_is_400(self):
        self._signup()
        resp = self._signup()
        self.assertEqual(resp.status_code, 400)
        self.assertEqual(ConjugacionesUser.objects.count(), 1)


class CurrentUserTests(APITestCase):
    url = '/api/users/'

    def setUp(self):
        self.user = ConjugacionesUser.objects.create_user('a@example.com', 'a@example.com', 'pw12345678')

    def test_returns_user_for_token(self):
        resp = self.client.get(self.url, HTTP_AUTHORIZATION=f'Token {self.user.token}')
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.json(), {'email': 'a@example.com', 'token': self.user.token})

    def test_no_header_is_400(self):
        self.assertEqual(self.client.get(self.url).status_code, 400)

    def test_other_auth_scheme_is_400(self):
        resp = self.client.get(self.url, HTTP_AUTHORIZATION='Bearer abc')
        self.assertEqual(resp.status_code, 400)

    def test_stale_token_is_401(self):
        resp = self.client.get(self.url, HTTP_AUTHORIZATION='Token deadbeef')
        self.assertEqual(resp.status_code, 401)

    def test_no_detail_routes(self):
        """Detail routes used to leak any user's token and allow edits/deletes without auth."""
        detail = f'{self.url}{self.user.id}/'
        auth = {'HTTP_AUTHORIZATION': f'Token {self.user.token}'}
        self.assertEqual(self.client.get(detail).status_code, 404)
        self.assertEqual(self.client.patch(detail, {}, format='json', **auth).status_code, 404)
        self.assertEqual(self.client.delete(detail, **auth).status_code, 404)
        self.assertTrue(ConjugacionesUser.objects.filter(id=self.user.id).exists())


class LoginTests(APITestCase):
    url = '/api/login/'

    def setUp(self):
        self.user = ConjugacionesUser.objects.create_user('a@example.com', 'a@example.com', 'pw12345678')

    def test_login(self):
        resp = self.client.post(self.url, {'email': 'a@example.com', 'password': 'pw12345678'}, format='json')
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.json()['token'], self.user.token)

    def test_bad_password(self):
        resp = self.client.post(self.url, {'email': 'a@example.com', 'password': 'wrong'}, format='json')
        self.assertEqual(resp.status_code, 400)

    def test_login_ignores_stale_token(self):
        resp = self.client.post(self.url, {'email': 'a@example.com', 'password': 'pw12345678'},
                                format='json', HTTP_AUTHORIZATION='Token deadbeef')
        self.assertEqual(resp.status_code, 200)
