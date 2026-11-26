# nomansland website

website for the "nomads' manuscripts landscape" (nomansland) project. deployed at
<https://www.oeaw.ac.at/iran/nomansland/>.

## how to run

prerequisites:

- [node.js 26.x](https://nodejs.org/en/download)
- [pnpm 12.x](https://pnpm.io/installation)

> [!TIP]
>
> you can use `pnpm` to install the required node.js version with
> `pnpm runtime set node 26 --global`

set required environment variables in `.env.local`:

```bash
cp .env.local.example .env.local
```

adjust environment variables in `.github/workflows/validate.yml` and
`.github/workflows/build-deploy.yml`.

the following variables are available:

- `PUBLIC_REDMINE_ID` (required): service issue for this application in the acdh-ch
  [redmine](https://redmine.acdh.oeaw.ac.at) issue tracker.
- `PUBLIC_APP_BASE_URL` (required): the base url for this application. the default of
  "http://localhost:3000" should be fine for local development.
- `PUBLIC_APP_BASE_PATH` (optional): set this when deploying to a path other than "/".
- `PUBLIC_BOTS` (required): whether this website can be indexed by web crawlers like the google bot.
  supported values are "disabled" and "enabled", defaults to "disabled".
- `PUBLIC_MATOMO_BASE_URL` and `PUBLIC_MATOMO_ID` (optional): set these to support client-side
  analytics with matomo.
- `PUBLIC_GOOGLE_SITE_VERIFICATION` (optional): set this to verify site ownership for google search
  console.
- `ENV_VALIDATION` (optional): whether environment variables should be validated. supported values
  are "disabled", "enabled" and "public" (only validate public variables, which can be useful in a
  docker build context to avoid having to pass secrets to `docker build`), defaults to "enabled".

when adding new environment variables, don't forget to add them to `.env.local.example` as well.

install dependencies:

```bash
pnpm install
```

run a development server on <http://localhost:3000>:

```bash
pnpm run dev
```

> [!TIP]
>
> this template supports developing in containers. when opening the project in your editor, you
> should be prompted to re-open it in a devcontainer.

## tooling

The site uses Astro 7. Run `pnpm run format:fix` for oxfmt, `pnpm run lint:check` for oxlint and
Stylelint, and `pnpm run types:check` for Astro type checks. `pnpm run test:e2e` runs Playwright
against the production build. TypeScript stays on v6, which is supported by Astro’s checker.
Tailwind 4 uses its Vite plugin and CSS configuration in `src/styles/index.css`.

## how to edit content

run `pnpm run dev` and open <http://localhost:3000/admin> or <http://localhost:3000/keystatic>.
Keystatic saves changes to the local filesystem. Commit and push the changed content and assets to
publish them. The editor and its API are available only during local development and are excluded
from production builds. Local development always uses root-relative routes, regardless of the
production `PUBLIC_APP_BASE_PATH`.

## how to deploy

- ask a sysadmin to create a new acdh-ch kubernetes project.
- create a new namespace in that project via [rancher](https://rancher.acdh-dev.oeaw.ac.at), and set
  the `KUBE_NAMESPACE` github variable to that namespace.
- adjust the [`app_name`](./.github/workflows/build-deploy.yml#L36), which will be the name of the
  deployment in the above namespace.
- set the `PUBLIC_URL` github variable to the application's public url (e.g.
  "https://my-app.acdh-ch-dev.oeaw.ac.at"), and set the `KUBE_INGRESS_BASE_DOMAIN` to the public
  url's base domain (e.g. "acdh-ch-dev.oeaw.ac.at"). `PUBLIC_URL` should match
  `PUBLIC_APP_BASE_URL`.
- if you haven't yet, create a service issue in the acdh-ch
  [redmine](https://redmine.acdh.oeaw.ac.at) issue tracker, and set the `SERVICE_ID` github variable
  to the issue number. this should match the `PUBLIC_REDMINE_ID` variable in your `.env.local` file.
- ensure required build args (prefixed with `PUBLIC_`) are referenced in both the
  [`Dockerfile`](./Dockerfile), as well as the [validation](./.github/workflows/validate.yml) and
  [deployment](./.github/workflows/build-deploy.yml) pipelines, and set as github variables.
- ensure both the github repository, as well as the
  [package registry](https://github.com/orgs/acdh-oeaw/packages/container/my-app/settings) is set to
  public.

if everything is set up correctly, every git push to the `main` branch will create a new deployment
if the validation pipeline passes.

you can reference the [template repository](https://github.com/acdh-oeaw/template-website-astro) for
a working setup.

production builds generate static files in `dist/`, including the Pagefind search index. The
`Dockerfile` serves these files with Caddy on port 3000 as an unprivileged user. Node.js and
Keystatic are not part of the runtime image. All application configuration is supplied at build
time; no Keystatic credentials are required.

The build prunes unreferenced images from generated `assets/content/` and `_astro/` files before
packaging the site. Linked originals, downloads, and all source files are preserved. Run `pnpm test`
for the asset-pruning regression test.

`PUBLIC_APP_BASE_PATH` is baked into the build and Caddy configuration. Use the same value when
building the image and deploying it behind a path prefix (without a trailing slash). Caddy serves
`404.html` for missing pages and caches fingerprinted Astro assets for one year.

GitHub Actions restores the Astro image cache before the Docker build and exports the updated cache
afterward. The `astro-cache` Docker stage contains only this cache, not installed dependencies or
generated site files.
