from sqlalchemy import UniqueConstraint

from app import db
from src.constants import Languages


class BaseModelMixin(object):
    def save(self):
        db.session.add(self)
        db.session.commit()

    def delete(self):
        db.session.delete(self)
        db.session.commit()


# TODO
# class User(db.Model, BaseModelMixin):
#     id = db.Column(db.Integer, primary_key=True)
#     token = db.Column(db.String(128), unique=True, nullable=True)
#     username = db.Column(db.String(128), unique=True)
#     password = db.Column(db.String(128), unique=True)


class Verb(db.Model, BaseModelMixin):
    id = db.Column(db.Integer, primary_key=True)
    # TODO: add language enum
    language = db.Column(db.Enum(Languages))
    infinitive = db.Column(db.String(128), unique=True, index=True, nullable=False)
    infinitive_english = db.Column(db.String(128), nullable=False)
    past_participle = db.Column(db.String(128))
    gerund = db.Column(db.String(128))
    # TODO: this should not be lazy: rather, there should be another prop that lazily loads
    verb_conjugations = db.relationship('VerbConjugation', backref='verb', lazy='dynamic')

    def __init__(self, infinitive, infinitive_english, language, past_participle=None, gerund=None):
        self.infinitive = infinitive
        self.infinitive_english = infinitive_english
        self.language = language
        self.past_participle = past_participle
        self.gerund = gerund



class VerbConjugation(db.Model, BaseModelMixin):
    id = db.Column(db.Integer, primary_key=True)
    verb_id = db.Column(db.Integer, db.ForeignKey('verb.id'), nullable=False)
    tense = db.Column(db.String(128), nullable=False)
    tense_english = db.Column(db.String(128), nullable=False)
    form_1s = db.Column(db.String(128), nullable=False)
    form_2s = db.Column(db.String(128), nullable=False)
    form_3s = db.Column(db.String(128), nullable=False)
    form_1p = db.Column(db.String(128), nullable=False)
    form_2p = db.Column(db.String(128))
    form_3p = db.Column(db.String(128), nullable=False)

    def __init__(self, verb_id, tense, tense_english, form_1s, form_2s, form_3s, form_1p, form_3p, form_2p=None):
        self.verb_id = verb_id
        self.tense = tense
        self.tense_english = tense_english
        self.form_1s = form_1s
        self.form_2s = form_2s
        self.form_3s = form_3s
        self.form_1p = form_1p
        self.form_2p = form_2p
        self.form_3p = form_3p


# TODO
# class VerbConjugationResponse(db.Model, BaseModelMixin):
#     id = db.Column(db.Integer, primary_key=True)
#     verb_conjugation_id = db.Column(db.Integer, db.ForeignKey('verb_conjugation.id'), nullable=False)
#     form_1s_correct = db.Column(db.Boolean(128))
#     form_2s_correct = db.Column(db.Boolean(128))
#     form_3s_correct = db.Column(db.Boolean(128))
#     form_1p_correct = db.Column(db.Boolean(128))
#     form_2p_correct = db.Column(db.Boolean(128))
#     form_3p_correct = db.Column(db.Boolean(128))

#     def __init__(self, verb_conjugation_id, form_1s_correct, form_2s_correct, form_3s_correct, 
#         form_1p_correct, form_2p_correct, form_3p_correct):
#         self.verb_conjugation_id = verb_conjugation_id
#         self.form_1s_correct = form_1s_correct
#         self.form_2s_correct = form_2s_correct
#         self.form_3s_correct = form_3s_correct
#         self.form_1p_correct = form_1p_correct
#         self.form_2p_correct = form_2p_correct
#         self.form_3p_correct = form_3p_correct
