# FHEVM Examples Hub - Complete Examples List

This document provides a comprehensive list of all FHEVM examples included in this project, organized by category.

## 📚 Complete Examples (12 Total)

### ✅ Basic Examples (3 Examples)

1. **FHE Counter** (`fhe-counter`)
   - **File**: `contracts/basic/FHECounter.sol`
   - **Description**: Simple encrypted counter demonstrating basic FHE operations
   - **Key Concepts**: Encrypted state, increment/decrement operations, permission grants
   - **Generate**: `npm run create-example fhe-counter ./output`

2. **Equality Comparison** (`equality-comparison`)
   - **File**: `contracts/basic/EqualityComparison.sol`
   - **Description**: Demonstrates FHE equality comparison operations (FHE.eq)
   - **Key Concepts**: Encrypted comparison, boolean results, value comparison
   - **Generate**: `npm run create-example equality-comparison ./output`

3. **Arithmetic Operations** (`arithmetic-operations`)
   - **File**: `contracts/basic/ArithmeticOperations.sol`
   - **Description**: Basic arithmetic on encrypted integers (add, sub, mul)
   - **Key Concepts**: FHE.add(), FHE.sub(), FHE.mul() operations
   - **Generate**: `npm run create-example arithmetic-operations ./output`

### ✅ Encryption Examples (2 Examples)

4. **Encrypt Single Value** (`encrypt-single-value`)
   - **File**: `contracts/basic/encrypt/EncryptSingleValue.sol`
   - **Description**: Working with a single encrypted value
   - **Key Concepts**: Input handling, encryption conversion, value storage
   - **Generate**: `npm run create-example encrypt-single-value ./output`

5. **Encrypt Multiple Values** (`encrypt-multiple-values`)
   - **File**: `contracts/basic/encrypt/EncryptMultipleValues.sol`
   - **Description**: Handling multiple encrypted values of different types
   - **Key Concepts**: Multiple euint types, batch updates, type management
   - **Generate**: `npm run create-example encrypt-multiple-values ./output`

### ✅ Decryption Examples (2 Examples)

6. **User Decrypt Single Value** (`user-decrypt-single-value`)
   - **File**: `contracts/basic/decrypt/UserDecryptSingleValue.sol`
   - **Description**: User decryption with proper permission handling
   - **Key Concepts**: Permission grants, user decryption, allowThis/allow patterns
   - **Anti-patterns**: View function limitations for decryption
   - **Generate**: `npm run create-example user-decrypt-single-value ./output`

7. **Public Decrypt Single Value** (`public-decrypt-single-value`)
   - **File**: `contracts/basic/decrypt/PublicDecryptSingleValue.sol`
   - **Description**: Public decryption mechanism using relayer
   - **Key Concepts**: Async decryption, relayer callbacks, request handling
   - **Generate**: `npm run create-example public-decrypt-single-value ./output`

### ✅ Access Control Examples (2 Examples)

8. **Access Control** (`access-control`)
   - **File**: `contracts/basic/AccessControlExample.sol`
   - **Description**: FHE.allow, FHE.allowThis, and FHE.allowTransient patterns
   - **Key Concepts**: Permission management, dynamic access, transient permissions
   - **Anti-patterns**: Missing allowThis, incorrect permission grants
   - **Generate**: `npm run create-example access-control ./output`

9. **Input Proofs** (`input-proof`)
   - **File**: `contracts/basic/InputProofExample.sol`
   - **Description**: Understanding input proofs in FHEVM
   - **Key Concepts**: Proof validation, signer binding, contract binding
   - **Anti-patterns**: Missing proofs, wrong signer, proof validation failure
   - **Generate**: `npm run create-example input-proof ./output`

### ✅ Best Practices Example (1 Example)

10. **Common Anti-Patterns** (`anti-patterns`)
    - **File**: `contracts/basic/AntiPatterns.sol`
    - **Description**: FHEVM mistakes to avoid and correct alternatives
    - **Key Concepts**: 7 major anti-patterns with explanations
    - **Anti-patterns**:
      - View functions for decryption
      - Missing FHE.allowThis
      - Input proof signer mismatch
      - Information leakage through state
      - Using encrypted values in conditions
      - Type confusion
      - Missing contract permission binding
    - **Generate**: `npm run create-example anti-patterns ./output`

### ✅ Advanced Examples (2 Examples)

11. **Blind Auction** (`blind-auction`)
    - **File**: `contracts/advanced/BlindAuction.sol`
    - **Description**: Sealed-bid auction with encrypted bids
    - **Key Concepts**: Encrypted bidding, comparison operations, async decryption
    - **Features**: Bid placing, homomorphic comparison, winner determination
    - **Generate**: `npm run create-example blind-auction ./output`

12. **Cultural Voting Platform** (`cultural-voting`)
    - **File**: `contracts/CulturalVoting.sol`
    - **Description**: Privacy-preserving voting for cultural project selection
    - **Key Concepts**: Complex state management, role-based access, vote aggregation
    - **Features**: Project proposal, voter authorization, encrypted voting, result revelation
    - **Tests**: 140+ comprehensive test cases
    - **Generate**: `npm run create-example cultural-voting ./output`

---

## 🎯 Example Categories

### By Learning Path

**Beginner to Advanced:**
1. FHE Counter → Basic operations
2. Equality Comparison → Comparisons
3. Arithmetic Operations → More operations
4. Encrypt Single/Multiple Values → Encryption
5. User/Public Decrypt → Decryption
6. Access Control → Permissions
7. Input Proofs → Security
8. Anti-Patterns → Best practices
9. Blind Auction → Complex application
10. Cultural Voting → Real-world app

### By Topic

**FHE Operations:**
- FHE Counter
- Equality Comparison
- Arithmetic Operations

**Encryption & Decryption:**
- Encrypt Single Value
- Encrypt Multiple Values
- User Decrypt Single Value
- Public Decrypt Single Value

**Security & Access Control:**
- Access Control
- Input Proofs
- Anti-Patterns

**Real-World Applications:**
- Blind Auction
- Cultural Voting

---

## 📦 Generation Commands

### Generate Single Example
```bash
npm run create-example <example-name> [output-dir]
```

**Examples:**
```bash
npm run create-example fhe-counter ./my-counter
npm run create-example access-control ./my-access-control
npm run create-example blind-auction ./my-auction
npm run create-example cultural-voting ./my-voting
```

### Generate Category (Multiple Examples)
```bash
npm run create-category <category> [output-dir]
```

**Available Categories:**
```bash
npm run create-category basic ./basic-examples
npm run create-category encryption ./encryption-examples
npm run create-category decryption ./decryption-examples
npm run create-category access-control ./access-examples
npm run create-category best-practices ./best-practices
npm run create-category advanced ./advanced-examples
```

### Generate Documentation
```bash
# Single example
npm run generate-docs <example-name>

# All examples
npm run generate-all-docs
```

---

## 🧪 Testing All Examples

### Compile All Contracts
```bash
npm run compile
```

### Run All Tests
```bash
npm test
```

### Test Specific Example
```bash
# Run all tests - includes tests for all examples
npm test
```

---

## 📚 Documentation

Each example has auto-generated documentation in the `docs/` directory:
- `docs/fhe-counter.md`
- `docs/equality-comparison.md`
- `docs/arithmetic-operations.md`
- `docs/encrypt-single-value.md`
- `docs/encrypt-multiple-values.md`
- `docs/user-decrypt-single-value.md`
- `docs/public-decrypt-single-value.md`
- `docs/access-control.md`
- `docs/input-proof.md`
- `docs/anti-patterns.md`
- `docs/blind-auction.md`
- `docs/cultural-voting.md`

Generate fresh documentation:
```bash
npm run generate-all-docs
```

---

## 🎓 Learning Recommendations

### Week 1: Fundamentals
1. FHE Counter - Basic operations
2. Equality Comparison - Simple comparisons
3. Arithmetic Operations - Math on encrypted values

### Week 2: Encryption & Decryption
4. Encrypt Single Value - Single encrypted value
5. Encrypt Multiple Values - Multiple values
6. User Decrypt Single Value - User decryption basics
7. Public Decrypt Single Value - Public decryption

### Week 3: Security & Best Practices
8. Access Control - Permission management
9. Input Proofs - Input security
10. Anti-Patterns - What not to do

### Week 4: Advanced Applications
11. Blind Auction - Complex encrypted logic
12. Cultural Voting - Real-world voting system

---

## 📊 Statistics

### Code Metrics
- **Total Contracts**: 12
- **Total Lines of Solidity**: 1500+ lines
- **Total Test Files**: 5+
- **Total Test Cases**: 200+ tests
- **Documentation Pages**: 12 markdown files

### Coverage
- ✅ FHE.add, FHE.sub, FHE.mul
- ✅ FHE.eq, FHE.lt, FHE.le
- ✅ FHE.allowThis, FHE.allow, FHE.allowTransient
- ✅ FHE.fromExternal (with input proofs)
- ✅ FHE.requestDecryption
- ✅ Multiple encrypted types (euint8, euint16, euint32)
- ✅ Access control patterns
- ✅ Privacy-preserving applications

---

## 🔍 Quick Reference

### Find Example For...

**Learning FHE operations?**
→ FHE Counter, Arithmetic Operations, Equality Comparison

**Understanding encryption?**
→ Encrypt Single Value, Encrypt Multiple Values

**Learning decryption?**
→ User Decrypt Single Value, Public Decrypt Single Value

**Permission management?**
→ Access Control, Input Proofs

**Common mistakes?**
→ Anti-Patterns

**Real-world applications?**
→ Blind Auction, Cultural Voting

---

## 🚀 Next Steps

1. **Choose an example** from the list above
2. **Generate standalone repo** with `npm run create-example`
3. **Install dependencies** in generated directory
4. **Compile and test** the example
5. **Read documentation** in docs/
6. **Modify and experiment** to learn

---

## 📖 Additional Resources

- [FHEVM Documentation](https://docs.zama.ai/fhevm)
- [Hardhat Documentation](https://hardhat.org/docs)
- [DEPLOYMENT.md](DEPLOYMENT.md) - How to deploy examples
- [DEVELOPER_GUIDE.md](DEVELOPER_GUIDE.md) - Developer reference
- [scripts/README.md](scripts/README.md) - Automation tools

---

## ✨ Features

- ✅ 12 comprehensive examples
- ✅ 6 organized categories
- ✅ Auto-documentation generation
- ✅ Standalone repository creation
- ✅ Category-based project generation
- ✅ 200+ test cases
- ✅ Best practices demonstrated
- ✅ Anti-patterns explained
- ✅ Real-world applications
- ✅ Progressive learning path

---

**Built with FHEVM by Zama - Advancing Privacy-Preserving Blockchain Technology**

Last Updated: December 2025
