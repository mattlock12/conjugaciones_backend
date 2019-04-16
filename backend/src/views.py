import json
import random

from flask import request, Response

from app import app
from .constants import MOST_COMMON, Languages
from .models import Verb, VerbConjugation
from .utils import jsonify_verb


# @app.route('/')
# def index():
#     return app.send_static_file('index.html'), 200

@app.route('/api/verbs')
def verb_list():
    # TODO: weight verbs and return irregulars more
    language_str = request.args.get('l', 'ES')
    if language_str == Languages.ES.name:
        language = Languages.ES
    elif language_str == Languages.IT.name:
        language = Languages.IT
    else:
        raise Exception("Bad language")

    verb_cache_key = 'all_verbs__%s' % language_str
    most_common_cache_key = 'most_common__%s' % language_str
    if not hasattr(app, 'all_verbs__%s' % language_str):
        all_verbs_query = Verb.query.filter_by(language=language)
        all_verbs = [jsonify_verb(v) for v in all_verbs_query]
        most_common = [jsonify_verb(v) for v in all_verbs_query if v.infinitive in MOST_COMMON]
        setattr(app, verb_cache_key, all_verbs)
        setattr(app, most_common_cache_key, most_common)

    rando_sample_of_most_common = random.sample(
        getattr(app, most_common_cache_key),
        min(25, len(getattr(app, most_common_cache_key, [])))
    )
    resp = Response( json.dumps(
        random.sample(getattr(app, verb_cache_key), 25) + rando_sample_of_most_common
    ))

    return resp


# TODO
# @app.route('/responses', methods=['POST'])
# def responses():
#     conjugation = VerbConjugation.query.filter(id=int(request.form['conjugation_id']))
#     if not conjugation:
#         return 'No such conjugation', 400
#     answers = {
#         'form_1s': request.form.get('form_1s', None),
#         'form_2s': request.form.get('form_1ps', None),
#         'form_3s': request.form.get('form_1ps', None),
#         'form_1p': request.form.get('form_1ps', None),
#         'form_2p': request.form.get('form_1ps', None),
#         'form_3p': request.form.get('form_1ps', None),
#     }

#     vcr_kwargs = {
#         'verb_conjugation_id': conjugation.id,
#         'form_1s_correct': None,
#         'form_2s_correct': None,
#         'form_3s_correct': None,
#         'form_1p_correct': None,
#         'form_2p_correct': None,
#         'form_3p_correct': None,
#     }

#     for form_person, answer in answers.items():
#         if answer is not None:
#             vcr_kwargs['%s_correct' % form_person] = answer.lower() == getattr(conjugation, form_person).lower()

#     vcr = VerbConjugationResponse(**vcr_kwargs)
#     vcr.save()
#     return 'ok', 200