import random
from collections import Counter
from datetime import timedelta

import django.utils.timezone as dtz
from django.test import override_settings
from rest_framework.test import APITestCase

from users.models import ConjugacionesUser
from .constants import MOST_COMMON_ES
from .answers import EXACT, ROOT_TYPO, check_answer, is_correct, verb_stem
from .models import MIN_WEIGHT, Verb, VerbConjugation, VerbWeighter, compute_weight

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

    def test_authenticated_user_gets_weighted_sample(self):
        user = ConjugacionesUser.objects.create_user('a@example.com', 'a@example.com', 'pw')
        make_verb('hablar')
        make_verb('comer')
        make_verb('parlare', language='IT')
        resp = self.client.get(self.url, {'l': 'ES'}, HTTP_AUTHORIZATION=f'Token {user.token}')
        self.assertEqual(sorted(v['infinitive'] for v in resp.json()), ['comer', 'hablar'])

    def test_user_without_weighters_still_gets_full_batch(self):
        user = ConjugacionesUser.objects.create_user('a@example.com', 'a@example.com', 'pw')
        for i in range(60):
            make_verb(f'verbo{i}')
        resp = self.client.get(self.url, {'l': 'ES'}, HTTP_AUTHORIZATION=f'Token {user.token}')
        self.assertEqual(len(resp.json()), 50)


def make_weighter(user, verb, correct_reviews=0, wrong_reviews=0, ago=timedelta(days=60)):
    vw = VerbWeighter.objects.create(user=user, verb=verb)
    for _ in range(wrong_reviews):
        vw.record_review(0, 6)
    for _ in range(correct_reviews):
        vw.record_review(6, 0)
    VerbWeighter.objects.filter(pk=vw.pk).update(last_updated=dtz.now() - ago)
    vw.refresh_from_db()
    return vw


class ComputeWeightTests(APITestCase):
    def setUp(self):
        self.user = ConjugacionesUser.objects.create_user('a@example.com', 'a@example.com', 'pw')
        self.now = dtz.now()

    def test_struggling_beats_unseen_beats_mastered(self):
        struggling = make_weighter(self.user, make_verb('verbo1'), wrong_reviews=4)
        mastered = make_weighter(self.user, make_verb('verbo2'), correct_reviews=4, ago=timedelta(minutes=30))
        w_struggling = compute_weight(struggling, False, self.now)
        w_unseen = compute_weight(None, False, self.now)
        w_mastered = compute_weight(mastered, False, self.now)
        self.assertGreater(w_struggling, w_unseen)
        self.assertGreater(w_unseen, w_mastered)

    def test_recent_mistakes_outweigh_old_ones(self):
        recovered = VerbWeighter.objects.create(user=self.user, verb=make_verb('verbo1'))
        for _ in range(5):
            recovered.record_review(0, 6)
        for _ in range(3):
            recovered.record_review(6, 0)
        self.assertGreater(recovered.accuracy, 0.6)

    def test_common_beats_rare(self):
        self.assertGreater(compute_weight(None, True, self.now), compute_weight(None, False, self.now))
        vw = make_weighter(self.user, make_verb('verbo1'), wrong_reviews=2)
        self.assertGreater(compute_weight(vw, True, self.now), compute_weight(vw, False, self.now))

    def test_just_answered_is_suppressed_until_due(self):
        vw = make_weighter(self.user, make_verb('verbo1'), wrong_reviews=2, ago=timedelta(0))
        just_now = compute_weight(vw, False, self.now)
        later = compute_weight(vw, False, self.now + timedelta(days=1))
        self.assertLess(just_now * 10, later)

    def test_weight_never_below_floor(self):
        vw = make_weighter(self.user, make_verb('verbo1'), correct_reviews=20, ago=timedelta(0))
        self.assertGreaterEqual(compute_weight(vw, False, self.now), MIN_WEIGHT)


class SampleVerbsTests(APITestCase):
    def setUp(self):
        self.user = ConjugacionesUser.objects.create_user('a@example.com', 'a@example.com', 'pw')

    def _counts(self, trials=2000, k=5):
        rng = random.Random(1234)
        counts = Counter()
        for _ in range(trials):
            counts.update(v.infinitive for v in
                          VerbWeighter.sample_verbs(self.user, 'ES', num_verbs=k, rng=rng))
        return counts

    def test_struggle_and_common_verbs_are_favoured_but_mastered_still_appear(self):
        common = sorted(MOST_COMMON_ES)[:3]
        for inf in common:
            make_verb(inf)
        for i in range(20):
            make_verb(f'raro{i}')
        make_weighter(self.user, make_verb('dificil'), wrong_reviews=4)
        make_weighter(self.user, make_verb('facil'), correct_reviews=4, ago=timedelta(hours=1))

        counts = self._counts()
        rare_avg = sum(counts[f'raro{i}'] for i in range(20)) / 20
        common_avg = sum(counts[inf] for inf in common) / len(common)

        self.assertGreater(counts['dificil'], 2 * rare_avg)
        self.assertGreater(common_avg, 2 * rare_avg)
        self.assertLess(counts['facil'], rare_avg)
        self.assertGreater(counts['facil'], 0)

    def test_batches_vary(self):
        for i in range(30):
            make_verb(f'verbo{i}')
        rng = random.Random(1)
        batches = {tuple(v.id for v in VerbWeighter.sample_verbs(self.user, 'ES', num_verbs=10, rng=rng))
                   for _ in range(5)}
        self.assertGreater(len(batches), 1)


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

    def test_placeholder_forms_are_not_scored(self):
        verb = make_verb('bisognare', language='IT', form_1s='—', form_3s='bisogna')
        self._post([{'tense': 'Presente', 'form1s': 'bisogno', 'form3s': 'bisogna'}], verb_id=verb.id, **self.auth)
        weighter = VerbWeighter.objects.get(user=self.user, verb=verb)
        self.assertEqual((weighter.total_correct, weighter.total_incorrect), (1, 0))

    def test_unknown_verb_is_404(self):
        self.assertEqual(self._post([], verb_id=999999, **self.auth).status_code, 404)

    def test_invalid_payload_is_400(self):
        self.assertEqual(self._post([{'form1s': 'hablo'}], **self.auth).status_code, 400)

    def test_review_updates_recency_weighted_history(self):
        self._post([{'tense': 'Presente', 'form1s': 'hablo', 'form2s': 'mal'}], **self.auth)
        weighter = VerbWeighter.objects.get(user=self.user, verb=self.verb)
        self.assertAlmostEqual(weighter.decayed_score, 0.5)
        self.assertAlmostEqual(weighter.decayed_count, 1.0)
        self.assertIsNotNone(weighter.last_updated)


class AnswerMatchingTests(APITestCase):
    def assertAccepts(self, expected, *answers):
        for answer in answers:
            self.assertTrue(is_correct(expected, answer), f'{answer!r} should match {expected!r}')

    def assertRejects(self, expected, *answers):
        for answer in answers:
            self.assertFalse(is_correct(expected, answer), f'{answer!r} should not match {expected!r}')

    def test_plain_form(self):
        self.assertAccepts('HABLO', 'hablo', ' Hablo ')
        self.assertRejects('HABLO', '', 'habla', 'hablo, habla')

    def test_comma_alternatives(self):
        self.assertAccepts('MORIRÒ, MORRÒ', 'morirò', 'morrò')
        self.assertAccepts('PERSE, PERDÉ, PERDETTE', 'perse', 'perdé', 'perdette')
        self.assertAccepts("VA, VAI, VA'", 'va', 'vai', "va'", 'va’')
        self.assertRejects('MORIRÒ, MORRÒ', 'morirò, morrò', 'morire')

    def test_vowel_accents_are_optional_in_any_case(self):
        self.assertAccepts('PERDÉ', 'perdé', 'perde', 'PERDE', 'PERDÉ', 'perdè', 'perde\u0301')
        self.assertAccepts('È STATO', 'è stato', 'e stato', 'E stato', 'É stato')
        self.assertAccepts('HABLÓ', 'hablo', 'HABLO', 'habló', 'hablò')
        self.assertAccepts('MORIRÒ, MORRÒ', 'moriro', 'MORRO')
        self.assertAccepts('ESTÁIS', 'estais', 'ESTAIS')
        self.assertAccepts('OÍMOS', 'oimos', 'OIMOS')
        self.assertAccepts('ARGÜIR', 'arguir', 'ARGUIR')
        self.assertAccepts('PERSE, PERDÉ, PERDETTE', 'perde')
        self.assertRejects('PERDÉ', 'perda')

    def test_consonant_marks_still_count(self):
        self.assertAccepts('NIÑO', 'niño', 'NIÑO', 'nin\u0303o')
        self.assertRejects('NIÑO', 'nino')
        self.assertAccepts('AÑADÍ', 'añadi')
        self.assertRejects('AÑADÍ', 'anadi')

    def test_short_alternative_reuses_leading_words(self):
        self.assertAccepts('HO PERSO, PERDUTO', 'ho perso', 'ho perduto', 'ho  perduto')
        self.assertRejects('HO PERSO, PERDUTO', 'perduto', 'perso')

    def test_gendered_endings(self):
        self.assertAccepts('MI SONO PREOCCUPATO/A', 'mi sono preoccupato', 'mi sono preoccupata')
        self.assertAccepts('CI SIAMO PREOCCUPATI/E', 'ci siamo preoccupati', 'ci siamo preoccupate')
        self.assertRejects('MI SONO PREOCCUPATO/A', 'mi sono preoccupato/a', 'mi sono preoccupati', 'preoccupato')

    def test_optional_letters(self):
        self.assertAccepts('MI M(U)OVEVO', 'mi muovevo', 'mi movevo')
        self.assertAccepts('NUTR(ISC)O', 'nutrisco', 'nutro')
        self.assertRejects('NUTR(ISC)O', 'nutr(isc)o', 'nutrsco')

    def test_response_scoring_accepts_alternatives(self):
        user = ConjugacionesUser.objects.create_user('a@example.com', 'a@example.com', 'pw')
        verb = make_verb('preoccuparsi', language='IT', form_1s='MI SONO PREOCCUPATO/A', form_2s='TI SEI PREOCCUPATO/A')
        self.client.post('/api/responses/', {'verbId': verb.id, 'answers': [
            {'tense': 'Presente', 'form1s': 'mi sono preoccupata', 'form2s': 'ti sei preoccupato'},
        ]}, format='json', HTTP_AUTHORIZATION=f'Token {user.token}')
        weighter = VerbWeighter.objects.get(user=user, verb=verb)
        self.assertEqual((weighter.total_correct, weighter.total_incorrect), (2, 0))

    def test_response_scoring_forgives_root_typos(self):
        user = ConjugacionesUser.objects.create_user('a@example.com', 'a@example.com', 'pw')
        verb = make_verb('MANGIARE', language='IT', form_1s='MANGIO', form_2s='MANGI', form_3s='MANGIA')
        self.client.post('/api/responses/', {'verbId': verb.id, 'answers': [
            {'tense': 'Presente', 'form1s': 'magio', 'form2s': 'mangi', 'form3s': 'magio'},
        ]}, format='json', HTTP_AUTHORIZATION=f'Token {user.token}')
        weighter = VerbWeighter.objects.get(user=user, verb=verb)
        self.assertEqual((weighter.total_correct, weighter.total_incorrect), (2, 1))


class RootTypoTests(APITestCase):
    def assertResult(self, infinitive, expected, result, *answers):
        for answer in answers:
            self.assertEqual(check_answer(expected, answer, infinitive), result,
                             f'{answer!r} for {expected!r} ({infinitive})')

    def test_verb_stem(self):
        for infinitive, stem in [('MANGIARE', 'mangi'), ('abandonarse', 'abandon'), ('LAVARSI', 'lav'),
                                 ('mudar(se)', 'mud'), ('CONDURRE', 'cond'), ('reír', 're')]:
            self.assertEqual(verb_stem(infinitive), stem)

    def test_typo_in_root_is_forgiven(self):
        self.assertResult('MANGIARE', 'MANGIO', ROOT_TYPO, 'magio', 'mamgio', 'manngio', 'Magio')
        self.assertResult('MANGIARE', 'MANGERÒ', ROOT_TYPO, 'magerò', 'magero')
        self.assertResult('MANGIARE', 'HO MANGIATO', ROOT_TYPO, 'ho magiato', 'ho magniato')
        self.assertResult('UCCIDERE', 'UCCISI', ROOT_TYPO, 'ucisi')
        self.assertResult('abandonarse', 'me abandono', ROOT_TYPO, 'me abandno', 'me abnadono')
        self.assertResult('PREOCCUPARE', 'PREOCCUPATO/A', ROOT_TYPO, 'preocupata')
        self.assertResult('MANGIARE', 'MANGIO', EXACT, 'mangio')

    def test_conjugation_must_be_exact(self):
        self.assertResult('MANGIARE', 'MANGIO', None, 'mangia', 'magia', 'mangiao')
        self.assertResult('MANGIARE', 'MANGERÒ', None, 'mangiro')
        self.assertResult('MANGIARE', 'HO MANGIATO', None, 'ha magiato', 'ho mangaito')
        self.assertResult('abandonarse', 'me abandono', None, 'te abandono')
        # stem changes are conjugation
        self.assertResult('sonar', 'sueno', None, 'sono', 'seuno')

    def test_large_or_unanchored_root_mistakes_are_wrong(self):
        self.assertResult('MANGIARE', 'MANGIO', None, 'xxngio')
        self.assertResult('abandonar', 'abandono', None, 'xyzdono')
        # roots under three letters are too short to forgive
        self.assertResult('DARE', 'DO', None, 'xo')
        # without an infinitive there is no root to forgive
        self.assertResult(None, 'MANGIO', None, 'magio')
