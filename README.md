# GETTING STARTED
1. install postgres
1. createdb conjugaciones
1. create/activate your virtualenv
1. pip install requirements.txt
1. from home dir, in python shell:
    - from app import db
    - db.create_all()
    - db.session.commit()
1. python application.py

# TO LOAD VERBS
1. from home dir:
    - export PYTHON_PATH=.
    - python scripts/verb_csv_importer.py <path_to_verb_file>
