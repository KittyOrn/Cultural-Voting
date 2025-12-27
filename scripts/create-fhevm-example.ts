#!/usr/bin/env ts-node

/**
 * create-fhevm-example - CLI tool to generate standalone FHEVM example repositories
 *
 * Usage: ts-node scripts/create-fhevm-example.ts <example-name> [output-dir]
 *
 * Example: ts-node scripts/create-fhevm-example.ts fhe-counter ./output/fhe-counter
 */

import * as fs from 'fs';
import * as path from 'path';

// Color codes for terminal output
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

function error(message: string): never {
  log(`Error: ${message}`, Color.Red);
  process.exit(1);
}

function success(message: string): void {
  log(`Success: ${message}`, Color.Green);
}

function info(message: string): void {
  log(`Info: ${message}`, Color.Blue);
}

// Example configuration interface
interface ExampleConfig {
  contract: string;
  test: string;
  description: string;
  category: string;
}

// Map of example names to their contract and test paths
const EXAMPLES_MAP: Record<string, ExampleConfig> = {
  'fhe-counter': {
    contract: 'contracts/basic/FHECounter.sol',
    test: 'test/basic/FHECounter.ts',
    description: 'A simple FHE counter demonstrating basic encrypted operations',
    category: 'basic',
  },
  'equality-comparison': {
    contract: 'contracts/basic/EqualityComparison.sol',
    test: 'test/basic/EqualityComparison.ts',
    description: 'Demonstrates FHE equality comparison operations',
    category: 'basic',
  },
  'arithmetic-operations': {
    contract: 'contracts/basic/ArithmeticOperations.sol',
    test: 'test/basic/ArithmeticOperations.ts',
    description: 'Basic arithmetic operations on encrypted integers (add, sub, mul)',
    category: 'basic',
  },
  'encrypt-single-value': {
    contract: 'contracts/basic/encrypt/EncryptSingleValue.sol',
    test: 'test/basic/encrypt/EncryptSingleValue.ts',
    description: 'Demonstrates how to work with a single encrypted value',
    category: 'encryption',
  },
  'encrypt-multiple-values': {
    contract: 'contracts/basic/encrypt/EncryptMultipleValues.sol',
    test: 'test/basic/encrypt/EncryptMultipleValues.ts',
    description: 'Handling multiple encrypted values of different types',
    category: 'encryption',
  },
  'user-decrypt-single-value': {
    contract: 'contracts/basic/decrypt/UserDecryptSingleValue.sol',
    test: 'test/basic/decrypt/UserDecryptSingleValue.ts',
    description: 'User decryption with proper permission handling',
    category: 'decryption',
  },
  'public-decrypt-single-value': {
    contract: 'contracts/basic/decrypt/PublicDecryptSingleValue.sol',
    test: 'test/basic/decrypt/PublicDecryptSingleValue.ts',
    description: 'Public decryption mechanism for revealing encrypted values',
    category: 'decryption',
  },
  'access-control': {
    contract: 'contracts/basic/AccessControlExample.sol',
    test: 'test/basic/AccessControlExample.ts',
    description: 'FHE.allow, FHE.allowThis, and FHE.allowTransient patterns',
    category: 'access-control',
  },
  'input-proof': {
    contract: 'contracts/basic/InputProofExample.sol',
    test: 'test/basic/InputProofExample.ts',
    description: 'Input proofs explained with examples',
    category: 'access-control',
  },
  'anti-patterns': {
    contract: 'contracts/basic/AntiPatterns.sol',
    test: 'test/basic/AntiPatterns.ts',
    description: 'Common FHEVM mistakes and how to avoid them',
    category: 'best-practices',
  },
  'blind-auction': {
    contract: 'contracts/advanced/BlindAuction.sol',
    test: 'test/advanced/BlindAuction.ts',
    description: 'Sealed-bid auction with encrypted bids',
    category: 'advanced',
  },
  'cultural-voting': {
    contract: 'contracts/CulturalVoting.sol',
    test: 'test/CulturalVoting.ts',
    description: 'Privacy-preserving voting platform for cultural project selection',
    category: 'advanced',
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
      // Skip node_modules, artifacts, cache, etc.
      if (['node_modules', 'artifacts', 'cache', 'coverage', 'types', 'dist', 'fhevmTemp'].includes(item)) {
        return;
      }
      copyDirectoryRecursive(sourcePath, destPath);
    } else {
      fs.copyFileSync(sourcePath, destPath);
    }
  });
}

function getContractName(contractPath: string): string | null {
  const content = fs.readFileSync(contractPath, 'utf-8');
  const match = content.match(/^\s*contract\s+(\w+)(?:\s+is\s+|\s*\{)/m);
  return match ? match[1] : null;
}

function updateDeployScript(outputDir: string, contractName: string): void {
  const deployScriptPath = path.join(outputDir, 'deploy', 'deploy.ts');

  const deployScript = `import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  const deployed${contractName} = await deploy("${contractName}", {
    from: deployer,
    log: true,
  });

  console.log(\`${contractName} contract: \`, deployed${contractName}.address);
};
export default func;
func.id = "deploy_${contractName.toLowerCase()}";
func.tags = ["${contractName}"];
`;

  fs.writeFileSync(deployScriptPath, deployScript);
}

function updatePackageJson(outputDir: string, exampleName: string, description: string): void {
  const packageJsonPath = path.join(outputDir, 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));

  packageJson.name = `fhevm-example-${exampleName}`;
  packageJson.description = description;

  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
}

function generateReadme(exampleName: string, description: string, contractName: string, category: string): string {
  return `# FHEVM Example: ${exampleName}

${description}

## Category

${category.charAt(0).toUpperCase() + category.slice(1)} Examples

## Quick Start

### Prerequisites

- **Node.js**: Version 20 or higher
- **npm**: Package manager

### Installation

1. **Install dependencies**

   \`\`\`bash
   npm install
   \`\`\`

2. **Set up environment variables**

   \`\`\`bash
   npx hardhat vars set MNEMONIC
   npx hardhat vars set INFURA_API_KEY
   # Optional: Set Etherscan API key for contract verification
   npx hardhat vars set ETHERSCAN_API_KEY
   \`\`\`

3. **Compile and test**

   \`\`\`bash
   npm run compile
   npm run test
   \`\`\`

## Contract

The main contract is \`${contractName}\` located in \`contracts/${contractName}.sol\`.

## Testing

Run the test suite:

\`\`\`bash
npm run test
\`\`\`

For Sepolia testnet testing:

\`\`\`bash
npm run test:sepolia
\`\`\`

## Deployment

Deploy to local network:

\`\`\`bash
npx hardhat node
npx hardhat deploy --network localhost
\`\`\`

Deploy to Sepolia:

\`\`\`bash
npx hardhat deploy --network sepolia
npx hardhat verify --network sepolia <CONTRACT_ADDRESS>
\`\`\`

## Documentation

- [FHEVM Documentation](https://docs.zama.ai/fhevm)
- [FHEVM Examples](https://docs.zama.org/protocol/examples)
- [FHEVM Hardhat Plugin](https://docs.zama.ai/protocol/solidity-guides/development-guide/hardhat)

## License

This project is licensed under the BSD-3-Clause-Clear License.

---

**Built with FHEVM by Zama**
`;
}

function createExample(exampleName: string, outputDir: string): void {
  const rootDir = path.resolve(__dirname, '..');
  const templateDir = path.join(rootDir, 'fhevm-hardhat-template');

  // Check if example exists
  if (!EXAMPLES_MAP[exampleName]) {
    error(`Unknown example: ${exampleName}\n\nAvailable examples:\n${Object.keys(EXAMPLES_MAP).map(k => `  - ${k}`).join('\n')}`);
  }

  const example = EXAMPLES_MAP[exampleName];
  const contractPath = path.join(rootDir, example.contract);
  const testPath = path.join(rootDir, example.test);

  // Validate paths exist
  if (!fs.existsSync(contractPath)) {
    error(`Contract not found: ${example.contract}`);
  }

  info(`Creating FHEVM example: ${exampleName}`);
  info(`Output directory: ${outputDir}`);

  // Step 1: Copy template
  log('\nStep 1: Copying template...', Color.Cyan);
  if (fs.existsSync(outputDir)) {
    error(`Output directory already exists: ${outputDir}`);
  }

  // If template doesn't exist, use current directory as base
  if (!fs.existsSync(templateDir)) {
    log('Template directory not found, using current project structure', Color.Yellow);
    fs.mkdirSync(outputDir, { recursive: true });

    // Copy essential directories
    const essentialDirs = ['deploy', 'tasks'];
    essentialDirs.forEach(dir => {
      const srcDir = path.join(rootDir, dir);
      const destDir = path.join(outputDir, dir);
      if (fs.existsSync(srcDir)) {
        copyDirectoryRecursive(srcDir, destDir);
      }
    });

    // Copy essential files
    const essentialFiles = [
      'hardhat.config.ts',
      'tsconfig.json',
      'package.json',
      '.gitignore',
      '.eslintrc.yml',
      '.eslintignore',
      '.prettierrc.yml',
      '.prettierignore',
      '.solhint.json',
      '.solhintignore'
    ];
    essentialFiles.forEach(file => {
      const srcFile = path.join(rootDir, file);
      const destFile = path.join(outputDir, file);
      if (fs.existsSync(srcFile)) {
        fs.copyFileSync(srcFile, destFile);
      }
    });

    // Create contracts and test directories
    fs.mkdirSync(path.join(outputDir, 'contracts'), { recursive: true });
    fs.mkdirSync(path.join(outputDir, 'test'), { recursive: true });
  } else {
    copyDirectoryRecursive(templateDir, outputDir);
  }
  success('Template copied');

  // Step 2: Copy contract
  log('\nStep 2: Copying contract...', Color.Cyan);
  const contractName = getContractName(contractPath);
  if (!contractName) {
    error('Could not extract contract name from contract file');
  }
  const destContractPath = path.join(outputDir, 'contracts', `${contractName}.sol`);

  fs.copyFileSync(contractPath, destContractPath);
  success(`Contract copied: ${contractName}.sol`);

  // Step 3: Copy test
  log('\nStep 3: Copying test...', Color.Cyan);
  if (fs.existsSync(testPath)) {
    const destTestPath = path.join(outputDir, 'test', path.basename(testPath));
    fs.copyFileSync(testPath, destTestPath);
    success(`Test copied: ${path.basename(testPath)}`);
  } else {
    log('Test file not found, skipping', Color.Yellow);
  }

  // Step 4: Update configuration files
  log('\nStep 4: Updating configuration...', Color.Cyan);
  updateDeployScript(outputDir, contractName);
  updatePackageJson(outputDir, exampleName, example.description);
  success('Configuration updated');

  // Step 5: Generate README
  log('\nStep 5: Generating README...', Color.Cyan);
  const readme = generateReadme(exampleName, example.description, contractName, example.category);
  fs.writeFileSync(path.join(outputDir, 'README.md'), readme);
  success('README.md generated');

  // Final summary
  log('\n' + '='.repeat(60), Color.Green);
  success(`FHEVM example "${exampleName}" created successfully!`);
  log('='.repeat(60), Color.Green);

  log('\nNext steps:', Color.Yellow);
  log(`  cd ${path.relative(process.cwd(), outputDir)}`);
  log('  npm install');
  log('  npm run compile');
  log('  npm run test');

  log('\nHappy coding with FHEVM!', Color.Cyan);
}

// Main execution
function main(): void {
  const args = process.argv.slice(2);

  if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
    log('FHEVM Example Generator', Color.Cyan);
    log('\nUsage: ts-node scripts/create-fhevm-example.ts <example-name> [output-dir]\n');
    log('Available examples:', Color.Yellow);
    Object.entries(EXAMPLES_MAP).forEach(([name, info]) => {
      log(`  ${name}`, Color.Green);
      log(`    ${info.description}`, Color.Reset);
    });
    log('\nExample:', Color.Yellow);
    log('  ts-node scripts/create-fhevm-example.ts fhe-counter ./output/fhe-counter\n');
    process.exit(0);
  }

  const exampleName = args[0];
  const outputDir = args[1] || path.join(process.cwd(), 'output', `fhevm-example-${exampleName}`);

  createExample(exampleName, outputDir);
}

main();
