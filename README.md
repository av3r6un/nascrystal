# Nuxt Minimal Starter

Look at the [Nuxt documentation](https://nuxt.com/docs/getting-started/introduction) to learn more.

## Setup

Make sure to install dependencies:

```bash
# npm
npm install

# pnpm
pnpm install

# yarn
yarn install

# bun
bun install
```

## Development Server

Start the development server on `http://localhost:3000`:

```bash
# npm
npm run dev

# pnpm
pnpm dev

# yarn
yarn dev

# bun
bun run dev
```

## Production

Build the application for production:

```bash
# npm
npm run build

# pnpm
pnpm build

# yarn
yarn build

# bun
bun run build
```

Locally preview production build:

```bash
# npm
npm run preview

# pnpm
pnpm preview

# yarn
yarn preview

# bun
bun run preview
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.

## Docker (SSR)

Build image locally:

```bash
docker build -t nascrystal:local .
```

Run with Compose:

```bash
docker compose up -d --build
```

To run a published Docker Hub image, set `DOCKER_IMAGE` (for example in `.env`):

```env
DOCKER_IMAGE=docker.io/<dockerhub-user>/<repository>:latest
```

Then deploy updates on server:

```bash
docker compose pull
docker compose up -d --force-recreate
```

## Docker Hub Publish Workflow

Workflow file: `.github/workflows/publish-dockerhub.yml`

Required GitHub Actions secrets:

- `DOCKERHUB_USERNAME`
- `DOCKERHUB_TOKEN`

Optional GitHub Actions variable:

- `DOCKERHUB_REPOSITORY` (defaults to GitHub repository name)
