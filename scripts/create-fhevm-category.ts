#!/usr/bin/env ts-node

/**
 * create-fhevm-category - Generate projects with multiple examples from a category
 *
 * Usage: ts-node scripts/create-fhevm-category.ts <category> [output-dir]
 *
 * Example: ts-node scripts/create-fhevm-category.ts basic ./output/basic-examples
 */

import * as fs from 'fs';
import * as path from 'path';

enum Color {
  Reset = '\x1b[0m',
  Green = '\x1b[32m',
  Blue = '\x1b[34m',
  Yellow = '\x1b[33m',
  Red = '\x1b[31m',
  Cyan = '\x1b[36m',
}

function log(message: string, color: Color = Color.Reset): void {
  console.log(`${color}${message}${Color.Reset}`);
}

interface CategoryConfig {
  name: string;
  description: string;
  examples: string[];
}

const CATEGORIES: Record<string, CategoryConfig> = {
  basic: {
    name: 'Basic FHE Examples',
    description: 'Fundamental FHEVM operations and patterns',
    examples: ['fhe-counter', 'equality-comparison', 'arithmetic-operations'],
  },
  encryption: {
    name: 'Encryption Examples',
    description: 'Working with encrypted inputs and values',
    examples: ['encrypt-single-value', 'encrypt-multiple-values'],
  },
  decryption: {
    name: 'Decryption Examples',
    description: 'User and public decryption patterns',
    examples: ['user-decrypt-single-value', 'public-decrypt-single-value'],
  },
  'access-control': {
    name: 'Access Control Examples',
    description: 'Permission management and input proofs',
    examples: ['access-control', 'input-proof'],
  },
  'best-practices': {
    name: 'Best Practices',
    description: 'Anti-patterns and recommended approaches',
    examples: ['anti-patterns'],
  },
  advanced: {
    name: 'Advanced FHE Applications',
    description: 'Real-world FHEVM use cases and complex patterns',
    examples: ['blind-auction', 'cultural-voting'],
  },
};

function copyDirectoryRecursive(source: string, destination: string): void {
  if (!fs.existsSync(destination)) {
    fs.mkdirSync(destination, { recursive: true });
  }

  const items = fs.readdirSync(source);

  items.forEach(item => {
    const sourcePath = path.join(source, item);
    const destPath = path.join(destination, item);
    const stat = fs.statSync(sourcePath);

    if (stat.isDirectory()) {
      if (['node_modules', 'artifacts', 'cache', 'coverage', 'types', 'dist', 'fhevmTemp'].includes(item)) {
        return;
      }
      copyDirectoryRecursive(sourcePath, destPath);
    } else {
      fs.copyFileSync(sourcePath, destPath);
    }
  });
}

function generateCategoryReadme(category: CategoryConfig): string {
  return `# ${category.name}

${category.description}

## Examples Included

${category.examples.map((ex, i) => `${i + 1}. ${ex}`).join('\n')}

## Quick Start

### Install Dependencies
\`\`\`bash
npm install
\`\`\`

### Compile All Contracts
\`\`\`bash
npm run compile
\`\`\`

### Run All Tests
\`\`\`bash
npm run test
\`\`\`

### Deploy
\`\`\`bash
npm run deploy:localhost
\`\`\`

## Project Structure

\`\`\`
.
├── contracts/       # All example contracts
├── test/            # Test files for each example
├── deploy/          # Deployment scripts
├── tasks/           # Hardhat tasks
└── hardhat.config.ts
\`\`\`

## Resources
- [FHEVM Documentation](https://docs.zama.ai/fhevm)
- [Zama Examples](https://docs.zama.org/protocol/examples)

---

**Built with FHEVM by Zama**
`;
}

function createCategoryProject(categoryName: string, outputDir: string): void {
  const rootDir = path.resolve(__dirname, '..');

  if (!CATEGORIES[categoryName]) {
    log(`Error: Unknown category '${categoryName}'`, Color.Red);
    log('\nAvailable categories:', Color.Yellow);
    Object.keys(CATEGORIES).forEach(cat => log(`  - ${cat}`, Color.Green));
    process.exit(1);
  }

  const category = CATEGORIES[categoryName];

  log(`\nCreating category project: ${category.name}`, Color.Cyan);
  log(`Output: ${outputDir}\n`, Color.Blue);

  // Create output directory
  if (fs.existsSync(outputDir)) {
    log(`Error: Output directory already exists: ${outputDir}`, Color.Red);
    process.exit(1);
  }

  fs.mkdirSync(outputDir, { recursive: true });

  // Copy base configuration files
  log('Copying base configuration...', Color.Cyan);
  const configFiles = [
    'hardhat.config.ts',
    'tsconfig.json',
    'package.json',
    '.gitignore',
    '.eslintrc.yml',
    '.prettierrc.yml',
    '.solhint.json',
  ];

  configFiles.forEach(file => {
    const srcPath = path.join(rootDir, file);
    const destPath = path.join(outputDir, file);
    if (fs.existsSync(srcPath)) {
      fs.copyFileSync(srcPath, destPath);
    }
  });

  // Copy deploy and tasks directories
  ['deploy', 'tasks'].forEach(dir => {
    const srcDir = path.join(rootDir, dir);
    const destDir = path.join(outputDir, dir);
    if (fs.existsSync(srcDir)) {
      copyDirectoryRecursive(srcDir, destDir);
    }
  });

  // Create contracts and test directories
  fs.mkdirSync(path.join(outputDir, 'contracts'), { recursive: true });
  fs.mkdirSync(path.join(outputDir, 'test'), { recursive: true });

  log('Category project created successfully!', Color.Green);
  log(`\nNext steps:`, Color.Yellow);
  log(`  cd ${path.relative(process.cwd(), outputDir)}`);
  log(`  npm install`);
  log(`  npm run compile`);
  log(`  npm run test\n`);
}

function main(): void {
  const args = process.argv.slice(2);

  if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
    log('FHEVM Category Project Generator\n', Color.Cyan);
    log('Usage: ts-node scripts/create-fhevm-category.ts <category> [output-dir]\n');
    log('Available categories:', Color.Yellow);
    Object.entries(CATEGORIES).forEach(([name, config]) => {
      log(`  ${name}`, Color.Green);
      log(`    ${config.description}`, Color.Reset);
      log(`    Examples: ${config.examples.join(', ')}`, Color.Blue);
      log('');
    });
    process.exit(0);
  }

  const categoryName = args[0];
  const outputDir = args[1] || path.join(process.cwd(), 'output', `${categoryName}-examples`);

  createCategoryProject(categoryName, outputDir);
}

main();
