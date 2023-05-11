import fs from 'fs/promises';
import path from 'path';
import { spawn } from 'child_process';
import process from 'process';

const config = {
  domain: 'https://linen-assets-staging.s3.amazonaws.com/desktop',
  isNewVersion: true,
  notes: process.argv[2] || `new update`,
  build: true,
  releaseOrDebug: 'debug',
};

function cmd(...command) {
  let p = spawn(command[0], command.slice(1));
  return new Promise((resolveFunc) => {
    p.stdout.on('data', (x) => {
      process.stdout.write(x.toString());
    });
    p.stderr.on('data', (x) => {
      process.stderr.write(x.toString());
    });
    p.on('exit', (code) => {
      resolveFunc(code);
    });
  });
}

const tauriConfig = JSON.parse(
  await fs.readFile(path.resolve('./src-tauri/tauri.conf.json'), {
    encoding: 'utf-8',
  })
);
let version = tauriConfig.package.version;

if (config.isNewVersion) {
  version = version.split('.');
  version[2] = Number(version[2]) + 1;
  version = version.join('.');
  tauriConfig.package.version = version;
}

await fs.writeFile(
  path.resolve('./src-tauri/tauri.conf.json'),
  JSON.stringify(tauriConfig, null, 2)
);

if (config.build) {
  await cmd('yarn', 'tauri:build');
}

await fs.mkdir(path.resolve(`./.releases/desktop/${version}/darwin-aarch64`), {
  recursive: true,
});

const sigSilicon = await fs.readFile(
  path.resolve(
    `./src-tauri/target/aarch64-apple-darwin/${config.releaseOrDebug}/bundle/macos/linen-app.app.tar.gz.sig`
  ),
  { encoding: 'utf-8' }
);

await fs.copyFile(
  path.resolve(
    `./src-tauri/target/aarch64-apple-darwin/${config.releaseOrDebug}/bundle/dmg/linen-app_${version}_aarch64.dmg`
  ),
  path.resolve(
    `./.releases/desktop/${version}/darwin-aarch64/linen-app_${version}_aarch64.dmg`
  )
);

await fs.copyFile(
  path.resolve(
    `./src-tauri/target/aarch64-apple-darwin/${config.releaseOrDebug}/bundle/macos/linen-app.app.tar.gz`
  ),
  path.resolve(
    `./.releases/desktop/${version}/darwin-aarch64/linen-app.app.tar.gz`
  )
);

if (config.build) {
  await cmd('yarn', 'tauri:build:intel');
}

await fs.mkdir(path.resolve(`./.releases/desktop/${version}/darwin-x86_64`), {
  recursive: true,
});

const sigIntel = await fs.readFile(
  path.resolve(
    `./src-tauri/target/x86_64-apple-darwin/${config.releaseOrDebug}/bundle/macos/linen-app.app.tar.gz.sig`
  ),
  { encoding: 'utf-8' }
);

await fs.copyFile(
  path.resolve(
    `./src-tauri/target/x86_64-apple-darwin/${config.releaseOrDebug}/bundle/dmg/linen-app_${version}_x64.dmg`
  ),
  path.resolve(
    `./.releases/desktop/${version}/darwin-x86_64/linen-app_${version}_x64.dmg`
  )
);

await fs.copyFile(
  path.resolve(
    `./src-tauri/target/x86_64-apple-darwin/${config.releaseOrDebug}/bundle/macos/linen-app.app.tar.gz`
  ),
  path.resolve(
    `./.releases/desktop/${version}/darwin-x86_64/linen-app.app.tar.gz`
  )
);

const jsonServer = {
  version: `${version}`,
  notes: config.notes,
  pub_date: new Date().toISOString(),
  platforms: {
    'darwin-x86_64': {
      signature: sigIntel,
      url: `${config.domain}/${version}/darwin-x86_64/linen-app.app.tar.gz`,
    },
    'darwin-aarch64': {
      signature: sigSilicon,
      url: `${config.domain}/${version}/darwin-aarch64/linen-app.app.tar.gz`,
    },
    'linux-x86_64': {
      signature: `TODO`,
      url: `${config.domain}/${version}/linux-x86_64/TODO.tar.gz`,
    },
    'windows-x86_64': {
      signature: `TODO`,
      url: `${config.domain}/${version}/windows-x86_64/TODO.msi.zip`,
    },
  },
};

await fs.writeFile(
  path.resolve('./.releases/desktop/releases.json'),
  JSON.stringify(jsonServer, null, 2)
);

await cmd('aws', 's3', 'sync', '.releases', 's3://linen-assets-staging');

await fs.rm('./.releases', { recursive: true, force: true });
