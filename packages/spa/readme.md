## Build Tauri desktop client

```bash
# done in root folder
yarn install
yarn build:deps

cd packages/spa
yarn tauri build
```

## Prerequisites

Follow - https://tauri.app/v1/guides/getting-started/prerequisites

### For local development

```bash
# done in root folder
yarn build:deps
yarn dev:web

# Optional set up push service

# in another terminal
cd packages/spa
cp .env.example .env
# windows: copy .env.example .env
yarn tauri dev
```

> Note: Email sign in for development mode doesn't work yet, because it requires deep linking. So testing has to be done with username and password sign in

### release

- bump up the version on packages/spa/src-tauri/tauri.conf.json (line 11) and push it to main
- go to https://github.com/Linen-dev/desktop-client/actions/workflows/main.yml and hit the "run workflow"
- after the workflow finishes go to https://github.com/Linen-dev/desktop-client/releases
