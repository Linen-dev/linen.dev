## Build Tauri desktop client

```bash
yarn install

yarn tauri build:intel
```

## Prerequresites

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
yarn tauri dev
```

> Note: Email sign in for development mode doesn't work yet, because it requires deep linking. So testing has to be done with username and password sign in
