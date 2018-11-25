# conjugaciones-backend
Serves json responses of Spanish verbs and their conjugations in various tenses and moods.

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
1. `docker-compose up --build -d`
1. `docker ps` to find the container id of **conjugaciones-backend**
1. `docker exec -it <conjugaciones-backend id>`
1. from inside docker container:
    - `python` (to open python interpreter)
        - `from src.models import *`
        - `from app import db`
        - `db.create_all()`
        - `db.sesion.commit()`
        - `db.session.close()`
        - `exit`
    - `export PYTHONPATH=.`
    - `python scripts/verb_csv_importer.py ./verbs.csv`
1. backend is now served on `localhost:8000`
