#!/usr/bin/env ts-node

/**
 * generate-docs - Generate GitBook-compatible documentation from examples
 *
 * Usage: ts-node scripts/generate-docs.ts [example-name]
 *        ts-node scripts/generate-docs.ts --all
 */

import * as fs from 'fs';
import * as path from 'path';

// Example configuration
interface DocConfig {
  name: string;
  title: string;
  description: string;
  contractPath: string;
  testPath: string;
  category: string;
}

const EXAMPLES_CONFIG: DocConfig[] = [
  {
    name: 'fhe-counter',
    title: 'FHE Counter',
    description: 'A simple encrypted counter demonstrating basic FHE operations',
    contractPath: 'contracts/basic/FHECounter.sol',
    testPath: 'test/basic/FHECounter.ts',
    category: 'Basic Examples',
  },
  {
    name: 'equality-comparison',
    title: 'Equality Comparison',
    description: 'FHE equality comparison operations',
    contractPath: 'contracts/basic/EqualityComparison.sol',
    testPath: 'test/basic/EqualityComparison.ts',
    category: 'Basic Examples',
  },
  {
    name: 'arithmetic-operations',
    title: 'Arithmetic Operations',
    description: 'Basic arithmetic on encrypted integers',
    contractPath: 'contracts/basic/ArithmeticOperations.sol',
    testPath: 'test/basic/ArithmeticOperations.ts',
    category: 'Basic Examples',
  },
  {
    name: 'encrypt-single-value',
    title: 'Encrypt Single Value',
    description: 'Working with a single encrypted value',
    contractPath: 'contracts/basic/encrypt/EncryptSingleValue.sol',
    testPath: 'test/basic/encrypt/EncryptSingleValue.ts',
    category: 'Encryption Examples',
  },
  {
    name: 'encrypt-multiple-values',
    title: 'Encrypt Multiple Values',
    description: 'Handling multiple encrypted values',
    contractPath: 'contracts/basic/encrypt/EncryptMultipleValues.sol',
    testPath: 'test/basic/encrypt/EncryptMultipleValues.ts',
    category: 'Encryption Examples',
  },
  {
    name: 'user-decrypt-single-value',
    title: 'User Decrypt Single Value',
    description: 'User decryption with permission handling',
    contractPath: 'contracts/basic/decrypt/UserDecryptSingleValue.sol',
    testPath: 'test/basic/decrypt/UserDecryptSingleValue.ts',
    category: 'Decryption Examples',
  },
  {
    name: 'public-decrypt-single-value',
    title: 'Public Decrypt Single Value',
    description: 'Public decryption mechanism',
    contractPath: 'contracts/basic/decrypt/PublicDecryptSingleValue.sol',
    testPath: 'test/basic/decrypt/PublicDecryptSingleValue.ts',
    category: 'Decryption Examples',
  },
  {
    name: 'access-control',
    title: 'Access Control',
    description: 'FHE permission management patterns',
    contractPath: 'contracts/basic/AccessControlExample.sol',
    testPath: 'test/basic/AccessControlExample.ts',
    category: 'Access Control',
  },
  {
    name: 'input-proof',
    title: 'Input Proofs',
    description: 'Understanding input proofs in FHEVM',
    contractPath: 'contracts/basic/InputProofExample.sol',
    testPath: 'test/basic/InputProofExample.ts',
    category: 'Access Control',
  },
  {
    name: 'anti-patterns',
    title: 'Common Anti-Patterns',
    description: 'FHEVM mistakes to avoid',
    contractPath: 'contracts/basic/AntiPatterns.sol',
    testPath: 'test/basic/AntiPatterns.ts',
    category: 'Best Practices',
  },
  {
    name: 'blind-auction',
    title: 'Blind Auction',
    description: 'Sealed-bid auction with encrypted bids',
    contractPath: 'contracts/advanced/BlindAuction.sol',
    testPath: 'test/advanced/BlindAuction.ts',
    category: 'Advanced Examples',
  },
  {
    name: 'cultural-voting',
    title: 'Cultural Voting Platform',
    description: 'Privacy-preserving voting for cultural project selection',
    contractPath: 'contracts/CulturalVoting.sol',
    testPath: 'test/CulturalVoting.ts',
    category: 'Advanced Examples',
  },
];

function generateDocForExample(config: DocConfig, rootDir: string): string {
  const contractPath = path.join(rootDir, config.contractPath);
  const testPath = path.join(rootDir, config.testPath);

  let contractCode = '';
  let testCode = '';

  if (fs.existsSync(contractPath)) {
    contractCode = fs.readFileSync(contractPath, 'utf-8');
  }

  if (fs.existsSync(testPath)) {
    testCode = fs.readFileSync(testPath, 'utf-8');
  }

  return `# ${config.title}

${config.description}

## Contract Code

\`\`\`solidity
${contractCode}
\`\`\`

## Test Code

\`\`\`typescript
${testCode}
\`\`\`

## Key Concepts

### FHE Operations
This example demonstrates the use of Fully Homomorphic Encryption (FHE) in smart contracts.

### Important Patterns
- Encrypted input handling with \`FHE.fromExternal()\`
- Permission management with \`FHE.allowThis()\` and \`FHE.allow()\`
- Homomorphic operations on encrypted data

## Running the Example

### Install Dependencies
\`\`\`bash
npm install
\`\`\`

### Compile
\`\`\`bash
npm run compile
\`\`\`

### Test
\`\`\`bash
npm run test
\`\`\`

### Deploy
\`\`\`bash
npx hardhat deploy --network localhost
\`\`\`

## Resources
- [FHEVM Documentation](https://docs.zama.ai/fhevm)
- [Zama Examples](https://docs.zama.org/protocol/examples)

---

Category: **${config.category}**
`;
}

function generateSummary(configs: DocConfig[]): string {
  let summary = `# Summary

## Introduction
* [Overview](README.md)

`;

  const categories = Array.from(new Set(configs.map(c => c.category)));

  categories.forEach(category => {
    summary += `## ${category}\n\n`;
    const categoryExamples = configs.filter(c => c.category === category);
    categoryExamples.forEach(example => {
      summary += `* [${example.title}](${example.name}.md)\n`;
    });
    summary += '\n';
  });

  return summary;
}

function main(): void {
  const args = process.argv.slice(2);
  const rootDir = path.resolve(__dirname, '..');
  const docsDir = path.join(rootDir, 'docs');

  // Ensure docs directory exists
  if (!fs.existsSync(docsDir)) {
    fs.mkdirSync(docsDir, { recursive: true });
  }

  if (args.includes('--all')) {
    console.log('Generating documentation for all examples...');

    EXAMPLES_CONFIG.forEach(config => {
      console.log(`  - ${config.name}`);
      const doc = generateDocForExample(config, rootDir);
      const docPath = path.join(docsDir, `${config.name}.md`);
      fs.writeFileSync(docPath, doc);
    });

    // Generate SUMMARY.md
    const summary = generateSummary(EXAMPLES_CONFIG);
    fs.writeFileSync(path.join(docsDir, 'SUMMARY.md'), summary);

    console.log(`\nGenerated ${EXAMPLES_CONFIG.length} documentation files in docs/`);
  } else if (args.length > 0) {
    const exampleName = args[0];
    const config = EXAMPLES_CONFIG.find(c => c.name === exampleName);

    if (!config) {
      console.error(`Error: Example '${exampleName}' not found`);
      console.log('\nAvailable examples:');
      EXAMPLES_CONFIG.forEach(c => console.log(`  - ${c.name}`));
      process.exit(1);
    }

    console.log(`Generating documentation for ${exampleName}...`);
    const doc = generateDocForExample(config, rootDir);
    const docPath = path.join(docsDir, `${config.name}.md`);
    fs.writeFileSync(docPath, doc);

    console.log(`Generated: docs/${config.name}.md`);
  } else {
    console.log('FHEVM Documentation Generator\n');
    console.log('Usage:');
    console.log('  ts-node scripts/generate-docs.ts <example-name>');
    console.log('  ts-node scripts/generate-docs.ts --all\n');
    console.log('Available examples:');
    EXAMPLES_CONFIG.forEach(c => console.log(`  - ${c.name}`));
  }
}

main();
