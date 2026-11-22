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
`cd client && npm run build` writes the bundle to `client/dist`; deploys upload it to `./static` on the
droplet, which nginx serves. As a fallback on a machine with enough memory,
`docker compose -f docker-compose.yml -f docker-compose.prod.yml run --rm client` builds straight into `./static`.

### Deployment
Every push to `master` (i.e. a merged PR) runs `.github/workflows/deploy.yml`. It builds the client
bundle on the GitHub runner, SSHes into the droplet to run `scripts/deploy.sh` (fast-forward to the
commit being deployed, rebuild images, `up -d`, reload nginx, `migrate`), then rsyncs the bundle into
`./static` on the droplet. The droplet never builds the client, so it doesn't need the memory for
webpack. The workflow can also be run manually from the Actions tab (on `master`).

One-time setup:
1. On the droplet, clone this repo (default path `/root/conjugaciones_backend`; override with the
   `DEPLOY_PATH` repository variable) and make sure the deploy user can run `docker` and `git fetch`.
1. Put the production secrets in `.env` in the checkout on the droplet (gitignored; Compose reads it
   automatically). `.env.example` lists the variables. Keep the real values in a local, gitignored
   `.env.production` and copy it up:
    ```
    scp .env.production <user>@<droplet>:<deploy path>/.env
    ssh <user>@<droplet> chmod 600 <deploy path>/.env
    ```
   Don't name the local copy `.env`: the dev stack would pick up its `POSTGRES_PASSWORD`.
   Postgres only applies `POSTGRES_PASSWORD` when `./pgdata` is first created. To switch an existing
   database to it, run once on the droplet (with the new password):
    ```
    docker compose exec db psql -U conjugaciones-user -d conjugaciones -c "ALTER USER \"conjugaciones-user\" PASSWORD '<new password>'"
    ```
   Production runs gunicorn with `DEBUG` off and `ALLOWED_HOSTS` set to `entend.io`/`www.entend.io`
   (see `docker-compose.prod.yml`). It needs Docker Compose v2.24.4+ (`docker compose version`).
1. Create a deploy keypair (`ssh-keygen -t ed25519 -f deploy_key -N ""`) and append `deploy_key.pub`
   to the deploy user's `~/.ssh/authorized_keys` on the droplet.
1. In GitHub → Settings → Environments, create `production` with these secrets:
    - `DEPLOY_SSH_KEY`: contents of `deploy_key`
    - `DEPLOY_HOST`: droplet IP or hostname
    - `DEPLOY_USER`: SSH user on the droplet
    - `DEPLOY_KNOWN_HOSTS`: output of `ssh-keyscan -H <droplet-ip>`

### Upgrading an existing `./pgdata`
The database now runs on Postgres 18, which stores its data under `./pgdata/18/docker`.
Data from an older Postgres major version must be migrated, either with `pg_dump`/`pg_restore`
or with `pg_upgrade`, before it can be used.


USE: https://www.randomlists.com/data/spanish-words.json
