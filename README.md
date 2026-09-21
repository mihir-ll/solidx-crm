# LeadTrack

LeadTrack is a mobile-responsive SolidX sales application with an eight-stage pipeline, repository-enforced lead ownership, follow-up reminders, audit history, imports/exports and a six-widget dashboard.

## Local setup

1. Copy `solid-api/.env.example` to `solid-api/.env` and `solid-ui/.env.example` to `solid-ui/.env`; set Postgres, JWT and SMTP values.
2. Install dependencies with `npm ci` in both `solid-api` and `solid-ui`.
3. From `solid-api`, seed metadata with `npx ts-node src/main-cli.ts seed --modules-to-seed leadtrack`.
4. Optionally load the sample users and leads with `npx ts-node src/main-cli.ts test data --load --modules-to-test leadtrack`.
5. Start the API with `npm run start:dev` and the UI with `npm run dev`.

The sample credentials are for local testing only: `admin@leadtrack.local` and `sales@leadtrack.local`, password `Test@1234`.

## Production

Copy the example environment files, replace every placeholder and keep `DEFAULT_DATABASE_SYNCHRONIZE=false`. Build and run from `deploy/` with `docker compose up -d --build`. Put TLS at the host load balancer or extend `deploy/nginx.conf` with your certificate paths.

Before first use, run the LeadTrack metadata seed command inside the API container. SMTP can remain unset while developing, but the reminder scheduler requires valid `COMMON_SMTP_EMAIL_*` values in production.

## Import format

The built-in importer accepts CSV/XLSX columns matching: `name`, `company`, `industry`, `email`, `phone`, `dealValue`, `currency`, `source`, `expectedCloseDate`, `stageUserKey`, `ownerUserKey`, and `remarks`. `stageUserKey` is the stage name configured under Configuration > Lead Stages.
