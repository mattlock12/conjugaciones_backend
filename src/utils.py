def jsonify_verb(verb):
    return {
        "id": verb.id,
        "infinitive": verb.infinitive,
        "infinitiveEnglish": verb.infinitive_english,
        "gerund": verb.gerund,
        "pastParticiple": verb.past_participle,
        "conjugations": [
            {
                "tense": c.tense,
                "tenseEnglish": c.tense_english,
                "form1s": c.form_1s,
                "form2s": c.form_2s,
                "form3s": c.form_3s,
                "form1p": c.form_1p,
                "form2p": c.form_2p,
                "form3p": c.form_3p
            }
            for c in verb.verb_conjugations
        ]
    }