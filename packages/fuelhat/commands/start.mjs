/* eslint-disable no-console */
import c from 'chalk';
import { spawn } from 'child_process';
import path from 'path';
import Spinnies from 'spinnies';
import { fileURLToPath } from 'url';

import { createEnv } from '../utils/createEnv.mjs';

const dirname = path.dirname(fileURLToPath(import.meta.url));
const resolve = (str) => path.resolve(dirname, str);
const spinnies = new Spinnies({ succeedPrefix: '⚡️ ' });

function label(str) {
  return c.green.bold(str);
}

export const handler = async (argv) => {
  const {
    filepath: envPath,
    port,
    faucetPort,
    projectName,
  } = await createEnv(argv);

  const isTest = argv.t;
  const isDebug = argv.d;

  const args = [
    'run',
    '--ip',
    '127.0.0.1',
    '--port',
    '4000',
    '--chain',
    '../fuel-core/chainConfig.json',
    '--db-type',
    'in-memory',
  ];

  if (!isDebug) {
    spinnies.add('1', { text: 'Starting Fuel local node...' });
  }

  const process = spawn(
    'fuel-core',
    args,
    isDebug && { stdio: 'inherit' }
  );

  process.stdout?.on('data', (data) => {
    console.log(c.cyan(data));
  });
  process.stdout?.on('end', () => {
    if (!isDebug) {
      console.log('\n');
      spinnies.succeed('1', { text: 'Fuel node running locally!' });
      console.log(c.gray('----'));
    }
    console.log(
      `${label('⇢ Environment:')} ${isTest ? 'Test' : 'Development'}`
    );
    console.log(`${label('⇢ Provider URL:')} http://localhost:${port}/graphql`);
    console.log(
      `${label('⇢ Faucet URL:')} http://localhost:${faucetPort}/dispense`
    );
  });
};

export const command = 'start';
