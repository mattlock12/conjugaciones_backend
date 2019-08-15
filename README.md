# Conjugaciones
Serves json responses of Spanish & Italian verbs and their conjugations in various tenses and moods.
React client to consume it

### Example:
```
{
    id: 578,
    infinitive: "sonar",
    infinitiveEnglish: "to sound; to ring",
    gerund: "sonando",
    pastParticiple: "sonado",
    conjugations: [
    {
        id: 9794,
        tense: "Presente",
        tenseEnglish: "Present",
        form1s: "sueno",
        form2s: "suenas",
        form3s: "suena",
        form1p: "sonamos",
        form2p: "sonáis",
        form3p: "suenan"
        },
        ...
    ]
}
```
## Getting Started
1. Make sure you have `docker` and `docker-compose` installed on your machine
    - To install docker: https://docs.docker.com/docker-for-mac/install/
    - `brew install docker-compose`
1. `docker-compose up --build -d`
1. `docker ps` to find the container id of **conjugaciones-backend**
1. `docker exec -it <conjugaciones-backend id> /bin/bash`
1. from inside docker container:
    - `python` (to open python interpreter)
        - `from src.models import *`
        - `from app import db`
        - `db.create_all()`
        - `db.session.commit()`
        - `db.session.close()`
        - `exit()`
    - `export PYTHONPATH=.`
    - `python scripts/verb_csv_importer.py ./verbs.csv`
    - `python scripts/import_italian_verbs.py ./italian_verbs_2019_04_12.csv`
1. backend is now served on `localhost:8000`
1. react dev server is served on `localhost:9000`

## As far as deploying
At some point I'll use certbot integrated with Docker.
But until that point, I manually install certbot on the host and nginx link the live cert directories.

Also don't forget that the command to bring it up in production is:
`docker-compose up -f docker-compose.yml -f docker-compose.prod.yml up -d --build


USE: https://www.randomlists.com/data/spanish-words.json
