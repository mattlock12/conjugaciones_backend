# GETTING STARTED
1. install postgres
1. createdb conjugaciones
1. create/activate your virtualenv
1. pip install requirements.txt
1. from home dir, in python shell:
    - from app import db
    - db.create_all()
    - db.session.commit()

# RUN THE APP
1. python application.py
1. backend is now served on localhost:8000

# TO LOAD VERBS
1. from home dir:
    - export PYTHON_PATH=.
    - python scripts/verb_csv_importer.py <path_to_verb_file>
