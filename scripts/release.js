#!/usr/bin/env node

const { execSync } = require('child_process');
const readline = require('readline');
const fs = require('fs');
const path = require('path');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function ask(question) {
  return new Promise((resolve) => {
    rl.question(question, resolve);
  });
}

function run(command, options = {}) {
  console.log(`> ${command}`);
  try {
    const result = execSync(command, { 
      stdio: options.silent ? 'pipe' : 'inherit', 
      encoding: 'utf8',
      ...options 
    });
    return result;
  } catch (error) {
    console.error(`Failed to run: ${command}`);
    process.exit(1);
  }
}

function getCurrentVersion() {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  return packageJson.version;
}

function updateVersion(newVersion) {
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  packageJson.version = newVersion;
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');
}

function getNextVersion(current, type) {
  const parts = current.split('.').map(Number);
  switch (type) {
    case 'patch':
      parts[2]++;
      break;
    case 'minor':
      parts[1]++;
      parts[2] = 0;
      break;
    case 'major':
      parts[0]++;
      parts[1] = 0;
      parts[2] = 0;
      break;
    default:
      return type; // Custom version
  }
  return parts.join('.');
}

async function main() {
  console.log('🚀 expo-game-center Release Tool\n');

  // Check if we're on main branch
  const currentBranch = run('git rev-parse --abbrev-ref HEAD', { silent: true }).trim();
  if (currentBranch !== 'main') {
    console.error('❌ You must be on the main branch to release');
    process.exit(1);
  }

  // Check for uncommitted changes
  const gitStatus = run('git status --porcelain', { silent: true }).trim();
  if (gitStatus) {
    console.error('❌ You have uncommitted changes. Please commit or stash them first.');
    process.exit(1);
  }

  // Pull latest changes
  console.log('📥 Pulling latest changes...');
  run('git pull origin main');

  const currentVersion = getCurrentVersion();
  console.log(`📦 Current version: ${currentVersion}\n`);

  console.log('Select release type:');
  console.log('1. patch (bug fixes)');
  console.log('2. minor (new features)');
  console.log('3. major (breaking changes)');
  console.log('4. custom (specify version)');

  const choice = await ask('\nChoice (1-4): ');
  let newVersion;

  switch (choice) {
    case '1':
      newVersion = getNextVersion(currentVersion, 'patch');
      break;
    case '2':
      newVersion = getNextVersion(currentVersion, 'minor');
      break;
    case '3':
      newVersion = getNextVersion(currentVersion, 'major');
      break;
    case '4':
      newVersion = await ask('Enter version: ');
      break;
    default:
      console.error('Invalid choice');
      process.exit(1);
  }

  console.log(`\n📋 Release Summary:`);
  console.log(`   Current: ${currentVersion}`);
  console.log(`   New:     ${newVersion}`);

  const confirm = await ask('\nProceed with release? (y/N): ');
  if (confirm.toLowerCase() !== 'y') {
    console.log('❌ Release cancelled');
    process.exit(0);
  }

  try {
    // Run tests
    console.log('\n🧪 Running tests...');
    run('npm run test:ci');

    // Run type check
    console.log('\n🔍 Running type check...');
    run('npm run typecheck');

    // Run linter
    console.log('\n🔧 Running linter...');
    run('npm run lint');

    // Build package
    console.log('\n🏗️  Building package...');
    run('npm run build');

    // Update version
    console.log(`\n📝 Updating version to ${newVersion}...`);
    updateVersion(newVersion);

    // Commit version change
    console.log('\n📤 Committing version change...');
    run(`git add package.json`);
    run(`git commit -m "chore: bump version to ${newVersion}"`);

    // Create tag
    console.log(`\n🏷️  Creating tag v${newVersion}...`);
    run(`git tag v${newVersion}`);

    // Push changes
    console.log('\n⬆️  Pushing changes...');
    run('git push origin main');
    run('git push origin --tags');

    console.log('\n✅ Release process completed!');
    console.log(`\n📦 The GitHub workflow will automatically publish v${newVersion} to npm.`);
    console.log(`🔗 Monitor the release: https://github.com/Rouic/expo-game-center/actions`);

  } catch (error) {
    console.error('\n❌ Release failed:', error.message);
    process.exit(1);
  } finally {
    rl.close();
  }
}

main().catch(console.error);