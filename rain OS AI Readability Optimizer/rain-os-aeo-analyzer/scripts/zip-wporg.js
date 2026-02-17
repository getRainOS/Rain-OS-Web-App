#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const PLUGIN_NAME = 'rain-os-aeo-analyzer';
const ZIP_NAME = `${PLUGIN_NAME}.zip`;
const DIST_DIR = 'dist';

const REQUIRED_BUILD_FILES = [
    'build/gutenberg-sidebar.js',
    'build/gutenberg-sidebar.css',
    'build/gutenberg-sidebar.asset.php'
];

const EXCLUDE_PATTERNS = [
    'node_modules',
    'node_modules/**',
    'src',
    'src/**',
    '.git',
    '.git/**',
    '.gitignore',
    '.npmrc',
    'package-lock.json',
    'package.json',
    'tsconfig.json',
    'webpack.config.js',
    '*.map',
    'scripts',
    'scripts/**',
    'dist',
    'dist/**',
    '.DS_Store',
    '*.log'
];

console.log('=== rain OS AI Readability Optimizer - WordPress.org Packager ===\n');

console.log('1. Verifying build artifacts...');
const missingFiles = REQUIRED_BUILD_FILES.filter(file => !fs.existsSync(file));
if (missingFiles.length > 0) {
    console.error('ERROR: Missing required build files:');
    missingFiles.forEach(file => console.error(`   - ${file}`));
    console.error('\nRun "npm run build:replit" first to generate build artifacts.');
    process.exit(1);
}
console.log('   All build artifacts present.\n');

console.log('2. Creating dist directory...');
if (!fs.existsSync(DIST_DIR)) {
    fs.mkdirSync(DIST_DIR, { recursive: true });
}
console.log('   Done.\n');

console.log('3. Removing old zip if exists...');
const zipPath = path.join(DIST_DIR, ZIP_NAME);
if (fs.existsSync(zipPath)) {
    fs.unlinkSync(zipPath);
    console.log('   Removed old zip.');
} else {
    console.log('   No old zip found.');
}
console.log('');

console.log('4. Creating WordPress.org-ready zip...');

const pluginDir = process.cwd();
const parentDir = path.dirname(pluginDir);
const folderName = path.basename(pluginDir);

const excludeArgs = EXCLUDE_PATTERNS.map(p => `-x "${folderName}/${p}"`).join(' ');

try {
    execSync(`cd "${parentDir}" && zip -r "${path.resolve(zipPath)}" "${folderName}" ${excludeArgs} -x "${folderName}/node_modules/*" -x "${folderName}/src/*" -x "${folderName}/scripts/*" -x "${folderName}/dist/*"`, {
        stdio: 'inherit'
    });
} catch (error) {
    console.error('ERROR: Failed to create zip. Make sure zip is installed.');
    console.error('Try running: nix-shell -p zip');
    process.exit(1);
}

console.log('   Done.\n');

console.log('5. Verifying zip contents...');
try {
    const output = execSync(`unzip -l "${zipPath}" | head -50`, { encoding: 'utf8' });
    console.log(output);
} catch (error) {
    console.log('   (unzip not available for verification, but zip was created)');
}

const stats = fs.statSync(zipPath);
const sizeKB = (stats.size / 1024).toFixed(2);
console.log(`\n=== Package created successfully! ===`);
console.log(`File: ${zipPath}`);
console.log(`Size: ${sizeKB} KB`);
console.log(`\nThis zip is ready for WordPress.org submission.`);
console.log(`It includes the build/ folder and excludes node_modules.`);
