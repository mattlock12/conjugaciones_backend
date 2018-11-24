import json
import random

from flask import request

from app import app
from .constants import MOST_COMMON
from .models import Verb, VerbConjugation, VerbConjugationResponse
from .utils import jsonify_verb


@app.route('/verbs')
def verb_list():
    # TODO: weight verbs and return irregulars more
    if not hasattr(app, 'all_verbs'):
        all_verbs_query = Verb.query.all()
        all_verbs = [jsonify_verb(v) for v in all_verbs_query]
        most_common = [jsonify_verb(v) for v in all_verbs_query if v.infinitive in MOST_COMMON]
        app.all_verbs = all_verbs
        app.most_common = most_common

    return json.dumps(
        random.sample(app.all_verbs, 25) + random.sample(app.most_common, 25)
        ), 200

@app.route('/responses', methods=['POST'])
def responses():
    conjugation = VerbConjugation.query.filter(id=int(request.form['conjugation_id']))
    if not conjugation:
        return 'No such conjugation', 400
    
    form1s = request.form.get('form1s', None)
    form2s = request.form.get('form1ps', None)
    form3s = request.form.get('form1ps', None)
    form1p = request.form.get('form1ps', None)
    form2p = request.form.get('form1ps', None)
    form3p = request.form.get('form1ps', None)

    

    vcr_kwargs = {
        'verb_conjugation_id': conjugation.id,
        'answer_form1s': request.form.get('answer_form1s', None),
        'answer_form2s': request.form.get('answer_form1ps', None),
        'answer_form3s': request.form.get('answer_form1ps', None),
        'answer_form1p': request.form.get('answer_form1ps', None),
        'answer_form2p': request.form.get('answer_form1ps', None),
        'answer_form3p': request.form.get('answer_form1ps', None),
    }
    vcr = VerbConjugationResponse(**vcr_kwargs)
    vcr.save()
    return 'ok', 200