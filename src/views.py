import json
import random

from flask import request

from app import app
from .models import Verb, VerbConjugation
from .utils import jsonify_verb


@app.route('/verbs')
def verb_list():
    # TODO: weight verbs and return irregulars more
    if not hasattr(app, 'all_verbs'):
        all_verbs = [jsonify_verb(v) for v in Verb.query.all()]
        app.all_verbs = all_verbs
    return json.dumps(random.sample(app.all_verbs, 50)), 200