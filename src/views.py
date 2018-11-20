import json

from flask import request

from app import app
from .models import Verb, VerbConjugation
from .utils import jsonify_verb


@app.route('/verbs')
def verb_list():
    start = int(request.args.get('s'))
    end = int(request.args.get('e'))
    return json.dumps([jsonify_verb(v) for v in Verb.query.all()[start:end]]), 200