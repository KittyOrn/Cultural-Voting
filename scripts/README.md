# Automation Scripts Documentation

This directory contains automation tools for generating standalone FHEVM example repositories and documentation.

## Available Scripts

### 1. create-fhevm-example.ts

Generates a complete standalone repository for a single FHEVM example.

**Usage:**
```bash
npx ts-node scripts/create-fhevm-example.ts <example-name> [output-dir]
```

**Examples:**
```bash
# Create FHE Counter example
npx ts-node scripts/create-fhevm-example.ts fhe-counter ./output/fhe-counter

# Create Cultural Voting example
npx ts-node scripts/create-fhevm-example.ts cultural-voting ./output/cultural-voting

# Create Encrypt Single Value example
npx ts-node scripts/create-fhevm-example.ts encrypt-single-value ./output/encrypt-single
```

**What it does:**
- Copies the base Hardhat template
- Includes the specified contract and test files
- Updates package.json with example-specific details
- Generates deployment scripts
- Creates a customized README

**Available examples:**
- `fhe-counter` - Basic encrypted counter
- `cultural-voting` - Privacy-preserving voting platform
- `encrypt-single-value` - Single value encryption demo
- `arithmetic-operations` - Basic FHE arithmetic

---

### 2. create-fhevm-category.ts

Generates a project containing multiple related examples from a category.

**Usage:**
```bash
npx ts-node scripts/create-fhevm-category.ts <category> [output-dir]
```

**Examples:**
```bash
# Create project with all basic examples
npx ts-node scripts/create-fhevm-category.ts basic ./output/basic-examples

# Create project with advanced examples
npx ts-node scripts/create-fhevm-category.ts advanced ./output/advanced-examples
```

**What it does:**
- Creates a multi-example project
- Includes all contracts and tests from the category
- Provides unified build and test infrastructure
- Generates comprehensive README

**Available categories:**
- `basic` - Fundamental FHEVM operations (FHE Counter, Encryption, Arithmetic)
- `advanced` - Real-world applications (Cultural Voting, etc.)

---

### 3. generate-docs.ts

Generates GitBook-compatible documentation from example code.

**Usage:**
```bash
# Generate docs for a single example
npx ts-node scripts/generate-docs.ts <example-name>

# Generate docs for all examples
npx ts-node scripts/generate-docs.ts --all
```

**Examples:**
```bash
# Generate documentation for FHE Counter
npx ts-node scripts/generate-docs.ts fhe-counter

# Generate all documentation
npx ts-node scripts/generate-docs.ts --all
```

**What it does:**
- Extracts contract and test code
- Generates formatted markdown documentation
- Creates SUMMARY.md for GitBook structure
- Organizes docs by category

**Output:**
- Individual markdown files in `docs/` directory
- `docs/SUMMARY.md` with navigation structure
- Code examples with syntax highlighting

---

## NPM Script Shortcuts

For convenience, these scripts can be run via npm:

```bash
# In package.json
npm run create-example <name> <output-dir>
npm run create-category <category> <output-dir>
npm run generate-docs <example-name>
npm run generate-all-docs
```

---

## Workflow Examples

### Creating a New Standalone Example

```bash
# 1. Generate the standalone repository
npx ts-node scripts/create-fhevm-example.ts fhe-counter ./my-counter-project

# 2. Navigate to the generated project
cd my-counter-project

# 3. Install dependencies
npm install

# 4. Compile and test
npm run compile
npm run test

# 5. Deploy
npm run deploy:localhost
```

### Creating a Category-Based Learning Project

```bash
# 1. Generate category project with multiple examples
npx ts-node scripts/create-fhevm-category.ts basic ./fhe-learning

# 2. Navigate and setup
cd fhe-learning
npm install

# 3. Explore and test all examples
npm run compile
npm run test

# 4. Study individual contracts in contracts/ directory
```

### Generating Documentation for Publishing

```bash
# 1. Generate all documentation
npx ts-node scripts/generate-docs.ts --all

# 2. Review generated docs
ls docs/

# 3. Use with GitBook or similar tools
# - docs/SUMMARY.md is the navigation structure
# - Individual .md files contain example documentation
```

---

## Script Architecture

### Directory Structure Expected

```
project-root/
├── contracts/
│   ├── basic/
│   │   ├── FHECounter.sol
│   │   ├── ArithmeticOperations.sol
│   │   └── encrypt/
│   │       └── EncryptSingleValue.sol
│   └── CulturalVoting.sol
├── test/
│   ├── basic/
│   │   ├── FHECounter.ts
│   │   └── ArithmeticOperations.ts
│   └── CulturalVoting.ts
├── scripts/
│   ├── create-fhevm-example.ts
│   ├── create-fhevm-category.ts
│   └── generate-docs.ts
├── fhevm-hardhat-template/  # Base template (optional)
└── docs/                    # Generated documentation
```

### Configuration

Examples are configured in each script file. To add a new example:

1. **In `create-fhevm-example.ts`:**
   ```typescript
   const EXAMPLES_MAP = {
     'your-example': {
       contract: 'contracts/path/YourContract.sol',
       test: 'test/path/YourTest.ts',
       description: 'Your example description',
       category: 'basic',
     },
   };
   ```

2. **In `generate-docs.ts`:**
   ```typescript
   const EXAMPLES_CONFIG = [
     {
       name: 'your-example',
       title: 'Your Example Title',
       description: 'Description',
       contractPath: 'contracts/path/YourContract.sol',
       testPath: 'test/path/YourTest.ts',
       category: 'Basic Examples',
     },
   ];
   ```

3. **In `create-fhevm-category.ts`:**
   ```typescript
   const CATEGORIES = {
     'your-category': {
       name: 'Your Category Name',
       description: 'Category description',
       examples: ['example1', 'example2'],
     },
   };
   ```

---

## Customization

### Modifying Generated Output

**README Template** (in `create-fhevm-example.ts`):
- Edit the `generateReadme()` function
- Customize sections, add new content
- Include project-specific instructions

**Deploy Script** (in `create-fhevm-example.ts`):
- Edit the `updateDeployScript()` function
- Add initialization parameters
- Include post-deployment steps

**Documentation Format** (in `generate-docs.ts`):
- Edit the `generateDocForExample()` function
- Customize markdown structure
- Add new sections or examples

### Adding New Script Features

1. **Import additional Node.js modules** at the top
2. **Add new configuration interfaces** for structure
3. **Implement new functions** for features
4. **Update main()** to handle new commands
5. **Document in this README**

---

## Troubleshooting

### "Example not found" Error

**Problem:** The example name doesn't exist in the configuration.

**Solution:**
```bash
# List available examples
npx ts-node scripts/create-fhevm-example.ts --help

# Use exact name from list
npx ts-node scripts/create-fhevm-example.ts fhe-counter ./output
```

### "Directory already exists" Error

**Problem:** Output directory already exists.

**Solution:**
```bash
# Remove existing directory
rm -rf ./output/fhe-counter

# Or use a different output path
npx ts-node scripts/create-fhevm-example.ts fhe-counter ./output/fhe-counter-v2
```

### "Contract not found" Error

**Problem:** The contract file path in configuration doesn't exist.

**Solution:**
- Verify the contract file exists at the specified path
- Check for typos in the configuration
- Ensure contracts are in the correct directory structure

### TypeScript Compilation Errors

**Problem:** Scripts fail to compile or run.

**Solution:**
```bash
# Ensure TypeScript dependencies are installed
npm install

# Check tsconfig.json is present
ls tsconfig.json

# Run with explicit transpilation
npx ts-node --transpile-only scripts/create-fhevm-example.ts
```

---

## Best Practices

### When Creating Examples

1. **Test First:** Always test contracts before adding to examples
2. **Document Well:** Include comprehensive natspec comments
3. **Follow Patterns:** Use existing examples as templates
4. **Keep Simple:** Each example should demonstrate one concept clearly

### When Using Scripts

1. **Check Output:** Review generated files before committing
2. **Customize Carefully:** Preserve the base structure
3. **Version Control:** Track generated projects separately
4. **Test Thoroughly:** Compile and test before distributing

### When Generating Docs

1. **Update Regularly:** Regenerate when examples change
2. **Review Output:** Check markdown renders correctly
3. **Maintain Structure:** Keep SUMMARY.md organized
4. **Link Resources:** Add relevant external links

---

## Contributing

To improve these scripts:

1. Follow TypeScript best practices
2. Maintain backwards compatibility
3. Add error handling
4. Update documentation
5. Test with all examples

---

## Resources

- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Node.js File System](https://nodejs.org/api/fs.html)
- [GitBook Documentation](https://docs.gitbook.com/)
- [FHEVM Documentation](https://docs.zama.ai/fhevm)

---

**Last Updated:** December 2025
