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
1. Install [Docker Desktop](https://docs.docker.com/desktop/) (includes `docker compose`)
1. `docker compose up --build -d`
1. Create the schema and load the verbs:
    ```
    docker compose exec backend python manage.py migrate
    docker compose exec backend python manage.py import_verbs_es -f verb_csvs/spanish_verbs_001.csv
    docker compose exec backend python manage.py import_verbs_it -f verb_csvs/italian_verbs_2019_04_12.csv
    ```
1. The API is served through nginx on `localhost` (`/api/...`)
1. The React dev server (with fast refresh) is on `localhost:9000`

### Tests
`docker compose exec backend python manage.py test`

### Production build
`docker compose -f docker-compose.yml -f docker-compose.prod.yml up client` writes the bundle to `./static`, which nginx serves.

### Upgrading an existing `./pgdata`
The database now runs on Postgres 18, which stores its data under `./pgdata/18/docker`.
Data from an older Postgres major version must be migrated, either with `pg_dump`/`pg_restore`
or with `pg_upgrade`, before it can be used.


USE: https://www.randomlists.com/data/spanish-words.json
