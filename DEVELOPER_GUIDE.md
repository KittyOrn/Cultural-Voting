# Developer Guide - Privacy-Protected Cultural Voting Platform

This guide provides comprehensive information for developers who want to understand, modify, and maintain the Cultural Voting smart contract project.

## Table of Contents

- [Project Overview](#project-overview)
- [Architecture](#architecture)
- [Codebase Structure](#codebase-structure)
- [Smart Contract Details](#smart-contract-details)
- [Testing Strategy](#testing-strategy)
- [Development Workflow](#development-workflow)
- [Building and Deploying](#building-and-deploying)
- [Code Quality and Linting](#code-quality-and-linting)
- [Upgrading Dependencies](#upgrading-dependencies)
- [Contributing](#contributing)

## Project Overview

The Privacy-Protected Cultural Voting Platform is a decentralized voting system that leverages Fully Homomorphic Encryption (FHE) to enable privacy-preserving voting on cultural projects. The core innovation is using FHEVM to keep individual vote scores encrypted while allowing vote aggregation.

### Key Technologies

- **FHEVM (Fully Homomorphic Encryption Virtual Machine)**: Enables computation on encrypted data
- **Solidity 0.8.24**: Smart contract language
- **Hardhat**: Development framework
- **TypeScript**: For tests and scripts
- **ethers.js v6**: Web3 library for contract interaction
- **Chai**: Assertion library for testing

### Core Concepts

**Fully Homomorphic Encryption (FHE)**:
- Allows computation on encrypted data without decryption
- Vote scores remain encrypted on-chain
- Only final aggregated results are decrypted
- Provides mathematical privacy guarantees

**Cultural Voting Architecture**:
- Projects can be proposed by anyone
- Admin authorizes eligible voters
- Voting happens in rounds with selected projects
- Votes are encrypted (euint8 type)
- Results revealed after voting period ends

## Architecture

### High-Level Flow

```
1. Project Proposal Phase
   ├── Anyone can propose cultural projects
   ├── Projects stored on-chain with metadata
   └── Project IDs generated sequentially

2. Voter Authorization
   ├── Admin authorizes specific addresses
   ├── Only authorized voters can vote
   └── Prevents Sybil attacks

3. Voting Round Setup
   ├── Admin initiates new round
   ├── Selects which projects are in round
   └── Voting becomes active

4. Encrypted Vote Submission
   ├── Voters submit scores (1-10)
   ├── Scores encrypted using FHE
   ├── Encrypted data stored in contract
   └── Individual votes remain private

5. Results Processing
   ├── Admin ends voting round
   ├── Encrypted votes requested for decryption
   ├── Results aggregated and revealed
   └── Winning project announced
```

### Smart Contract Hierarchy

```
CulturalVoting (main contract)
├── State Variables
│   ├── admin: address
│   ├── currentVotingRound: uint8
│   ├── projects: mapping (CulturalProject)
│   ├── votingRounds: mapping (VotingRound)
│   ├── votes: mapping (encrypted euint8)
│   └── authorizedVoters: mapping (bool)
├── Core Functions
│   ├── proposeProject()
│   ├── authorizeVoter()
│   ├── startVotingRound()
│   ├── submitVote()
│   ├── endVotingRound()
│   └── processResults()
└── View Functions
    ├── getCurrentRoundInfo()
    ├── getProjectInfo()
    ├── getRoundResults()
    └── ... (10+ helper functions)
```

## Codebase Structure

```
CulturalVoting/
├── contracts/
│   └── CulturalVoting.sol          # Main smart contract
├── test/
│   └── CulturalVoting.ts           # Comprehensive test suite
├── tasks/
│   ├── accounts.ts                 # List accounts task
│   └── CulturalVoting.ts           # Interaction tasks
├── deploy/
│   └── deploy.ts                   # Deployment script
├── hardhat.config.ts               # Hardhat configuration
├── tsconfig.json                   # TypeScript configuration
├── package.json                    # Dependencies and scripts
├── DEPLOYMENT.md                   # Deployment guide
├── DEVELOPER_GUIDE.md              # This file
└── README.md                       # User documentation
```

### File Descriptions

#### `contracts/CulturalVoting.sol`
Main smart contract containing:
- Struct definitions (CulturalProject, Vote, VotingRound)
- State management (projects, votes, voting rounds)
- Access control (admin, authorized voters)
- Voting logic and vote processing
- FHE integration for encrypted votes

Key Components:
- **Modifiers**: `onlyAdmin`, `onlyAuthorizedVoter`, `onlyDuringVoting`
- **Events**: ProjectProposed, VotingRoundStarted, VoteSubmitted, ResultsRevealed
- **FHE Operations**: Using `FHE.asEuint8()`, `FHE.allowThis()`, `FHE.allow()`

#### `test/CulturalVoting.ts`
Comprehensive test suite covering:
- Deployment initialization
- Project proposal functionality
- Voter authorization
- Voting round management
- Vote submission and validation
- Round completion and results
- FHE encryption features
- Helper functions

Test Structure:
- 140+ test cases across 10 describe blocks
- Setup fixtures for contract deployment
- Mock FHEVM environment for testing
- Edge cases and error conditions

#### `tasks/CulturalVoting.ts`
CLI tasks for contract interaction:
- `task:address` - Display contract address
- `task:propose` - Create new project proposal
- `task:authorize-voter` - Authorize voter
- `task:start-voting` - Initiate voting round
- `task:submit-vote` - Cast encrypted vote
- `task:get-project` - Retrieve project info
- `task:get-round-info` - Get current round state

Usage: `npx hardhat --network localhost task:<name> [--options]`

## Smart Contract Details

### CulturalVoting Contract Specification

#### State Variables

```solidity
address public admin;                              // Contract administrator
uint8 public currentVotingRound;                   // Current voting round number
mapping(uint8 => CulturalProject) public projects; // All proposed projects
mapping(uint8 => VotingRound) public votingRounds; // Voting round data
mapping(uint8 => mapping(uint8 => mapping(address => Vote))) public votes;
// Round => ProjectId => Voter => Vote
mapping(address => bool) public authorizedVoters;  // Authorized voters
uint8 public totalProjects;                        // Counter for projects
```

#### Core Data Structures

```solidity
struct CulturalProject {
    string name;           // Project name
    string description;    // Project description
    string category;       // Project category
    address proposer;      // Project proposer address
    bool isActive;         // Whether project is active
    uint256 proposalTime;  // Timestamp of proposal
}

struct Vote {
    euint8 encryptedScore; // Encrypted vote score (FHE)
    bool hasVoted;         // Whether voter has voted
    uint256 timestamp;     // Vote submission time
}

struct VotingRound {
    uint8[] projectIds;    // Project IDs in this round
    bool votingActive;     // Whether voting is ongoing
    bool resultsRevealed;  // Whether results are revealed
    uint256 startTime;     // Round start timestamp
    uint256 endTime;       // Round end timestamp
    address[] voters;      // Voters in this round
    uint8 winningProjectId; // Winner of the round
    uint8 maxScore;        // Winning project's score
}
```

#### Key Functions

**proposeProject(string, string, string)**
- Creates new cultural project proposal
- Callable by anyone
- Increments totalProjects
- Emits ProjectProposed event

**authorizeVoter(address)**
- Adds address to authorized voters
- Admin only
- Prevents unauthorized voting
- Emits VoterAuthorized event

**startVotingRound(uint8[])**
- Initiates new voting round
- Admin only
- Selects projects for this round
- Sets voting active state
- Emits VotingRoundStarted event

**submitVote(uint8, uint8)**
- Submits encrypted vote for project
- Authorized voters only
- Score must be 1-10
- Project must be in current round
- Prevents duplicate votes
- Uses FHE encryption for score
- Emits VoteSubmitted event

**endVotingRound()**
- Closes current voting round
- Admin only
- Requests decryption of votes
- Transitions to results processing

**processResults(uint256, uint8[], bytes[])**
- Processes decrypted votes
- Calculates winning project
- Updates round results
- Advances to next round
- Emits ResultsRevealed event

### FHE Integration Points

**Vote Encryption**:
```solidity
euint8 encryptedScore = FHE.asEuint8(_score);
FHE.allowThis(encryptedScore);
FHE.allow(encryptedScore, msg.sender);
```

**Key Points**:
- Scores encrypted as euint8 (encrypted unsigned 8-bit integer)
- Both contract and user permissions required
- `FHE.allowThis()` gives contract permission
- `FHE.allow()` gives user decryption permission

## Testing Strategy

### Test Coverage

The test suite provides comprehensive coverage across:

1. **Deployment Tests** (3 tests)
   - Admin initialization
   - Round counter setup
   - Voter authorization

2. **Project Proposal** (3 tests)
   - Proposal creation
   - Data storage
   - ID incrementing

3. **Voter Authorization** (3 tests)
   - Authorization process
   - Permission validation
   - Revocation functionality

4. **Voting Round Management** (4 tests)
   - Round initialization
   - Duplicate prevention
   - Project validation
   - Round info retrieval

5. **Voting Process** (6 tests)
   - Vote submission
   - Authorization checks
   - Score validation
   - Duplicate prevention
   - Multi-project voting
   - Vote tracking

6. **Round Completion** (3 tests)
   - Round ending
   - State transitions
   - Voting prevention

7. **Encryption & Privacy** (1 test)
   - FHE encryption verification

8. **Helper Functions** (2 tests)
   - Vote status checking
   - Round results retrieval

### Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npx hardhat test test/CulturalVoting.ts

# Run with verbose output
npx hardhat test --verbose

# Run with gas reporter
REPORT_GAS=true npm test

# Run with coverage report
npm run coverage
```

### Test Structure Pattern

```typescript
describe("Feature Group", function () {
  let contract: CulturalVoting;

  beforeEach(async function () {
    // Setup before each test
    if (!fhevm.isMock) {
      this.skip(); // Skip on real networks
    }
    // Deploy contract
  });

  it("should do something specific", async function () {
    // Arrange
    const input = "value";

    // Act
    const result = await contract.method(input);

    // Assert
    expect(result).to.equal(expected);
  });
});
```

## Development Workflow

### 1. Setting Up Local Development

```bash
# Clone or navigate to project
cd CulturalVoting

# Install dependencies
npm install

# Set environment variables
npx hardhat vars set MNEMONIC

# Verify setup
npm run compile
npm test
```

### 2. Making Contract Changes

```bash
# 1. Edit contracts/CulturalVoting.sol
# 2. Recompile
npm run compile

# 3. Update tests if needed
# Edit test/CulturalVoting.ts

# 4. Run tests
npm test

# 5. Check code quality
npm run lint
npm run prettier:write
```

### 3. Adding New Features

**Example: Adding a project status change feature**

1. **Update Contract**:
   ```solidity
   // In CulturalVoting.sol
   function deactivateProject(uint8 _projectId) external onlyAdmin {
       projects[_projectId].isActive = false;
       emit ProjectDeactivated(_projectId);
   }
   ```

2. **Add Event**:
   ```solidity
   event ProjectDeactivated(uint8 indexed projectId);
   ```

3. **Add Tests**:
   ```typescript
   it("should allow admin to deactivate projects", async function () {
       await culturalVotingContract.proposeProject(...);
       const tx = await culturalVotingContract.deactivateProject(1);
       expect(tx).to.emit(culturalVotingContract, "ProjectDeactivated");
   });
   ```

4. **Update Tasks**:
   ```typescript
   task("task:deactivate-project", "Deactivates a project")
       .addParam("id", "Project ID")
       .setAction(async function(taskArguments, hre) {
           // Implementation
       });
   ```

5. **Test and Deploy**:
   ```bash
   npm run compile
   npm test
   npm run deploy:localhost
   ```

## Building and Deploying

### Local Deployment

```bash
# Terminal 1: Start local blockchain
npm run chain

# Terminal 2: Deploy contract
npm run deploy:localhost

# Output: CulturalVoting contract: 0x...
```

### Sepolia Deployment

```bash
# Setup environment
npx hardhat vars set MNEMONIC
npx hardhat vars set INFURA_API_KEY

# Deploy
npm run deploy:sepolia

# Verify contract
npm run verify:sepolia <CONTRACT_ADDRESS>
```

### Deployment Checklist

- [ ] All tests passing: `npm test`
- [ ] No linting errors: `npm run lint`
- [ ] Contract compiles: `npm run compile`
- [ ] Gas reports reviewed (if applicable)
- [ ] Security audit considered
- [ ] Configuration verified
- [ ] Deployment tested on local network first
- [ ] Testnet deployment verified
- [ ] Contract verified on block explorer

## Code Quality and Linting

### Running Quality Checks

```bash
# Run all linting and formatting
npm run lint

# Check Solidity
npm run lint:sol

# Check TypeScript
npm run lint:ts

# Check formatting
npm run prettier:check

# Fix formatting issues
npm run prettier:write
```

### Code Standards

**Solidity**:
- Follow OpenZeppelin style guide
- Use meaningful variable names
- Include natspec comments for functions
- Emit events for state changes
- Use custom errors for reverts

**TypeScript**:
- Strict mode enabled
- Type all variables
- Use async/await for promises
- Include JSDoc comments
- Follow eslint rules

Example Function:
```solidity
/// @notice Submits an encrypted vote for a cultural project
/// @param _projectId ID of the project to vote for
/// @param _score Encrypted score (1-10, encrypted via FHE)
function submitVote(uint8 _projectId, uint8 _score)
    external
    onlyAuthorizedVoter
    onlyDuringVoting
{
    require(_score >= 1 && _score <= 10, "Score must be between 1-10");
    // ... implementation
}
```

## Upgrading Dependencies

### Checking for Updates

```bash
# Check outdated packages
npm outdated

# Update all to latest
npm update

# Update specific package
npm install @fhevm/solidity@latest
```

### Safe Upgrade Process

1. **Plan the upgrade**
   ```bash
   npm outdated  # Review what needs updating
   ```

2. **Update dependencies**
   ```bash
   npm install @fhevm/solidity@latest
   npm install @fhevm/hardhat-plugin@latest
   ```

3. **Recompile and test**
   ```bash
   npm run clean
   npm run compile
   npm test
   ```

4. **Check for breaking changes**
   - Review release notes
   - Update code if APIs changed
   - Test on local network

5. **Deploy and verify**
   ```bash
   npm run deploy:localhost
   # Verify functionality
   npm run deploy:sepolia  # After testing
   ```

### Managing FHEVM Updates

The FHEVM library is critical for this project:

```bash
# Check current version
npm list @fhevm/solidity

# Update FHEVM
npm install @fhevm/solidity@0.10.0

# Then update Hardhat plugin
npm install @fhevm/hardhat-plugin@0.3.1

# Test thoroughly
npm run clean && npm run compile && npm test
```

## Contributing

### Before Committing

1. **Code Quality**
   ```bash
   npm run lint
   npm run prettier:write
   npm run compile
   npm test
   ```

2. **Create clear commit messages**
   ```
   feat: Add voting deadline functionality
   - Allows admin to set voting deadline
   - Prevents votes after deadline
   - Emits VotingDeadlineSet event
   ```

3. **Update documentation**
   - Update README.md if user-facing
   - Update DEVELOPER_GUIDE.md if internal
   - Add natspec to new functions
   - Update test comments

### Pull Request Checklist

- [ ] All tests pass
- [ ] Code is linted and formatted
- [ ] Contract compiles without warnings
- [ ] New functions have natspec comments
- [ ] Tests added for new functionality
- [ ] README/docs updated
- [ ] No hardcoded secrets or test keys
- [ ] Clear commit messages
- [ ] Deployed and tested on testnet

## Performance Optimization

### Gas Optimization Tips

1. **Avoid storage updates in loops**
   ```solidity
   // Bad
   for (uint i = 0; i < arr.length; i++) {
       counter++;  // Storage write in loop
   }

   // Good
   uint256 temp = 0;
   for (uint i = 0; i < arr.length; i++) {
       temp++;
   }
   counter = temp;  // Single storage write
   ```

2. **Use events for audit trails**
   ```solidity
   // Instead of storing everything on-chain
   emit VoteSubmitted(voter, projectId, score);
   ```

3. **Batch operations**
   - Process multiple items in one transaction
   - Reduces transaction overhead

### Measuring Gas Usage

```bash
# Deploy with gas reporting
REPORT_GAS=true npm test

# Check contract size
npx hardhat size-contracts
```

## Debugging

### Using console logs

```solidity
import "hardhat/console.sol";

function myFunction() public {
    console.log("Sender:", msg.sender);
    console.log("Value:", msg.value);
}
```

### Using Hardhat debugger

```bash
npx hardhat node --network hardhat
# In another terminal
npx hardhat --network localhost test test/CulturalVoting.ts --grep "specific test"
```

### Debugging Encrypted Values

For FHE debugging:
```typescript
// In tests, you can decrypt to verify:
const decrypted = await fhevm.userDecryptEuint(
    FhevmType.euint8,
    encryptedValue,
    contractAddress,
    signer
);
console.log("Decrypted value:", decrypted);
```

## Resources

- [FHEVM Documentation](https://docs.zama.ai/fhevm)
- [Hardhat Documentation](https://hardhat.org/docs)
- [Solidity Documentation](https://docs.soliditylang.org/)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts/)
- [ethers.js v6 Documentation](https://docs.ethers.org/v6/)

## Support and Community

- **Zama Discord**: https://discord.com/invite/zama
- **Zama Forum**: https://www.zama.ai/community
- **GitHub Issues**: Create issues in the repository
- **Security**: Report security issues responsibly

---

**Last Updated**: December 2025
**Maintained by**: Community Contributors
**License**: MIT
