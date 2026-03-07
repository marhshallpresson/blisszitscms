#!/usr/bin/env node

import { spawnSync } from 'node:child_process';

const args = process.argv.slice(2);
const hasArg = (name) => args.includes(name);
const getArgValue = (name, fallback = '') => {
  const index = args.indexOf(name);
  if (index < 0 || index === args.length - 1) return fallback;
  return args[index + 1];
};

const projectId = getArgValue('--project', process.env.FIREBASE_PROJECT_ID || '');
const healthUrl = getArgValue('--health-url', process.env.DEPLOY_HEALTH_URL || '');
const skipBuild = hasArg('--skip-build');
const dryRun = hasArg('--dry-run');
const deployOnly = getArgValue('--only', 'hosting,firestore:rules');

const run = (command, commandArgs, options = {}) => {
  const printable = `${command} ${commandArgs.join(' ')}`.trim();
  console.log(`\n> ${printable}`);
  if (dryRun) return 0;
  const result = spawnSync(command, commandArgs, {
    stdio: 'inherit',
    shell: process.platform === 'win32',
    ...options,
  });
  return result.status ?? 1;
};

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const checkHealth = async (url) => {
  if (!url) {
    console.log('Skipping health check (no --health-url provided).');
    return;
  }

  console.log(`\n> Health check: ${url}`);
  const attempts = 12;
  const delayMs = 5000;

  for (let i = 1; i <= attempts; i += 1) {
    if (dryRun) {
      console.log('Dry run mode: health check skipped.');
      return;
    }
    try {
      const response = await fetch(url, { method: 'GET', cache: 'no-store' });
      if (response.ok) {
        console.log(`Health check passed on attempt ${i}/${attempts}.`);
        return;
      }
      console.log(`Health check attempt ${i}/${attempts} failed with status ${response.status}.`);
    } catch (error) {
      console.log(`Health check attempt ${i}/${attempts} failed: ${error instanceof Error ? error.message : 'unknown error'}`);
    }
    if (i < attempts) await wait(delayMs);
  }

  throw new Error('Post-deploy health check failed.');
};

const main = async () => {
  if (!skipBuild) {
    const buildExit = run('npm', ['run', 'build']);
    if (buildExit !== 0) process.exit(buildExit);
  }

  if (!projectId) {
    console.error('Missing Firebase project id. Pass --project <id> or set FIREBASE_PROJECT_ID.');
    process.exit(1);
  }

  const deployArgs = ['deploy', '--project', projectId, '--only', deployOnly, '--non-interactive'];
  const deployExit = run('firebase', deployArgs);
  if (deployExit !== 0) process.exit(deployExit);

  await checkHealth(healthUrl);
  console.log('\nDeployment completed successfully.');
};

main().catch((error) => {
  console.error(`Deployment failed: ${error instanceof Error ? error.message : 'unknown error'}`);
  process.exit(1);
});
