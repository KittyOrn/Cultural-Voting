# Deployment Guide - Privacy-Protected Cultural Voting Platform

This guide provides step-by-step instructions for deploying and interacting with the Cultural Voting smart contract on both local and testnet environments.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Configuration](#environment-configuration)
- [Local Development](#local-development)
- [Sepolia Testnet Deployment](#sepolia-testnet-deployment)
- [Contract Interaction](#contract-interaction)
- [Troubleshooting](#troubleshooting)

## Prerequisites

Before deploying the Cultural Voting platform, ensure you have the following installed:

- **Node.js**: Version 20 or higher
  ```bash
  node --version  # Should show v20.x.x or higher
  ```

- **npm**: Version 7.0.0 or higher
  ```bash
  npm --version  # Should show 7.x.x or higher
  ```

- **Git**: For version control
  ```bash
  git --version
  ```

- **MetaMask** or another Web3 wallet (for testnet deployment)

## Installation

1. **Clone the repository** (or navigate to your project directory)
   ```bash
   cd D:\\\CulturalVoting
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

   This will install all required packages including:
   - Hardhat and related plugins
   - FHEVM Solidity library
   - TypeScript and testing frameworks
   - Deployment tools

3. **Verify installation**
   ```bash
   npx hardhat --version
   ```

## Environment Configuration

### Set Up Environment Variables

Hardhat uses configuration variables for sensitive information. Set these up using the Hardhat vars system:

1. **Set your mnemonic phrase** (12-word seed phrase)
   ```bash
   npx hardhat vars set MNEMONIC
   ```
   When prompted, enter your 12-word mnemonic phrase.

   > **Warning**: Never commit your actual mnemonic to version control. For local testing, you can use the default test mnemonic.

2. **Set Infura API Key** (for Sepolia deployment)
   ```bash
   npx hardhat vars set INFURA_API_KEY
   ```
   Get your free API key from [Infura](https://infura.io/)

3. **Set Etherscan API Key** (optional, for contract verification)
   ```bash
   npx hardhat vars set ETHERSCAN_API_KEY
   ```
   Get your API key from [Etherscan](https://etherscan.io/apis)

### Verify Configuration

List all configured variables:
```bash
npx hardhat vars list
```

## Local Development

### 1. Compile the Contracts

```bash
npm run compile
```

This will:
- Compile the Solidity contracts
- Generate TypeScript types
- Create artifacts in the `artifacts/` directory

Expected output:
```
Compiled 1 Solidity file successfully
```

### 2. Run Tests

Execute the test suite to ensure everything works:

```bash
npm test
```

This runs all tests in the `test/` directory against a local Hardhat Network mock.

Expected output:
```
  Cultural Voting Smart Contract
    Deployment
      ✓ should set the deployer as admin
      ✓ should initialize voting round to 1
    ...
  30 passing (2s)
```

### 3. Start Local Blockchain

In a **separate terminal window**, start a local Hardhat node:

```bash
npm run chain
```

This starts a local Ethereum node at `http://localhost:8545` with 10 pre-funded accounts.

Leave this terminal running while you deploy and interact with the contract.

### 4. Deploy to Local Network

In your **main terminal**, deploy the contract:

```bash
npm run deploy:localhost
```

Expected output:
```
deploying "CulturalVoting" (tx: 0x...)
CulturalVoting contract: 0x5FbDB2315678afecb367f032d93F642f64180aa3
```

**Save the contract address** - you'll need it for interactions!

### 5. Interact with the Local Contract

Use Hardhat tasks to interact with your deployed contract:

#### Get Contract Address
```bash
npx hardhat --network localhost task:address
```

#### Propose a Cultural Project
```bash
npx hardhat --network localhost task:propose \
  --name "Digital Art Installation" \
  --description "Interactive digital art experience" \
  --category "Digital Art"
```

#### Authorize Voters
```bash
npx hardhat --network localhost task:authorize-voter \
  --voter 0x70997970C51812dc3A010C7d01b50e0d17dc79C8
```

#### Start a Voting Round
```bash
npx hardhat --network localhost task:start-voting \
  --projects 1,2,3
```

#### Submit a Vote
```bash
npx hardhat --network localhost task:submit-vote \
  --project 1 \
  --score 8
```

#### Get Project Information
```bash
npx hardhat --network localhost task:get-project --id 1
```

#### Get Current Round Info
```bash
npx hardhat --network localhost task:get-round-info
```

## Sepolia Testnet Deployment

### 1. Get Test ETH

Before deploying to Sepolia, you need test ETH:

1. Visit a Sepolia faucet:
   - [Alchemy Sepolia Faucet](https://sepoliafaucet.com/)
   - [Infura Sepolia Faucet](https://www.infura.io/faucet/sepolia)

2. Request test ETH for your wallet address

3. Verify your balance:
   ```bash
   npx hardhat --network sepolia accounts
   ```

### 2. Deploy to Sepolia

```bash
npm run deploy:sepolia
```

This will:
- Deploy the CulturalVoting contract to Sepolia
- Display the deployment transaction hash
- Show the deployed contract address

Expected output:
```
deploying "CulturalVoting" (tx: 0x...)
CulturalVoting contract: 0xYourContractAddressHere
```

**Important**: Save this contract address!

### 3. Verify Contract on Etherscan

After deployment, verify your contract's source code:

```bash
npx hardhat verify --network sepolia <CONTRACT_ADDRESS>
```

Replace `<CONTRACT_ADDRESS>` with your deployed contract address.

After verification, your contract will be viewable on Sepolia Etherscan with verified source code.

### 4. Interact with Sepolia Contract

All the same tasks work on Sepolia - just use `--network sepolia`:

```bash
# Propose a project
npx hardhat --network sepolia task:propose \
  --name "Music Festival" \
  --description "Annual community music event" \
  --category "Music Performance"

# Authorize a voter
npx hardhat --network sepolia task:authorize-voter \
  --voter 0xYourVoterAddress

# Start voting
npx hardhat --network sepolia task:start-voting \
  --projects 1,2

# Submit a vote
npx hardhat --network sepolia task:submit-vote \
  --project 1 \
  --score 9

# Get project info
npx hardhat --network sepolia task:get-project --id 1

# Get round info
npx hardhat --network sepolia task:get-round-info
```

## Contract Interaction

### Using Hardhat Console

For more advanced interactions, use the Hardhat console:

**Local Network:**
```bash
npx hardhat console --network localhost
```

**Sepolia Network:**
```bash
npx hardhat console --network sepolia
```

Inside the console:
```javascript
// Get the contract instance
const CulturalVoting = await ethers.getContractFactory("CulturalVoting");
const contract = await CulturalVoting.attach("YOUR_CONTRACT_ADDRESS");

// Get current round
const currentRound = await contract.currentVotingRound();
console.log("Current round:", currentRound.toString());

// Get admin
const admin = await contract.admin();
console.log("Admin:", admin);

// Get total projects
const totalProjects = await contract.totalProjects();
console.log("Total projects:", totalProjects.toString());
```

### Using ethers.js in Your Application

```javascript
import { ethers } from "ethers";
import CulturalVotingABI from "./artifacts/contracts/CulturalVoting.sol/CulturalVoting.json";

const provider = new ethers.JsonRpcProvider("https://sepolia.infura.io/v3/YOUR_API_KEY");
const wallet = new ethers.Wallet("YOUR_PRIVATE_KEY", provider);

const contractAddress = "YOUR_DEPLOYED_CONTRACT_ADDRESS";
const contract = new ethers.Contract(contractAddress, CulturalVotingABI.abi, wallet);

// Propose a project
const tx = await contract.proposeProject(
  "My Project",
  "Description",
  "Category"
);
await tx.wait();
console.log("Project proposed!");
```

## Troubleshooting

### Common Issues

#### 1. "Error: Cannot find module '@fhevm/solidity'"

**Solution**: Run `npm install` to install all dependencies.

#### 2. "Error: Invalid mnemonic"

**Solution**: Ensure you've set a valid 12-word mnemonic phrase:
```bash
npx hardhat vars set MNEMONIC
```

#### 3. "Error: Insufficient funds"

**Solution**:
- For local network: Restart the local node (`npm run chain`)
- For Sepolia: Get more test ETH from a faucet

#### 4. Compilation Errors

**Solution**: Clean and recompile:
```bash
npm run clean
npm run compile
```

#### 5. "Error: Network 'sepolia' not found"

**Solution**: Verify you've set your Infura API key:
```bash
npx hardhat vars set INFURA_API_KEY
```

#### 6. Tests Failing

**Solution**:
- Ensure you're running on the mock network (tests won't run on Sepolia)
- Clean build artifacts: `npm run clean`
- Reinstall dependencies: `rm -rf node_modules && npm install`

### Getting Help

If you encounter issues not covered here:

1. Check the [FHEVM Documentation](https://docs.zama.ai/fhevm)
2. Review the [Hardhat Documentation](https://hardhat.org/docs)
3. Open an issue on the project repository
4. Join the [Zama Discord](https://discord.com/invite/zama) for community support

## Security Notes

### Best Practices

1. **Never commit sensitive data**
   - Don't commit `.env` files
   - Don't commit private keys or mnemonics
   - Use Hardhat vars for sensitive configuration

2. **Use separate wallets**
   - Use different wallets for testnet and mainnet
   - Don't reuse production mnemonics for testing

3. **Verify deployments**
   - Always verify contract addresses after deployment
   - Double-check transaction parameters before submitting

4. **Test thoroughly**
   - Run full test suite before deploying
   - Test on Sepolia before any mainnet deployment

## Next Steps

After successful deployment:

1. **Set up the frontend** - Connect your web interface to the deployed contract
2. **Configure admin settings** - Authorize initial voters
3. **Propose test projects** - Create sample projects for testing
4. **Run a test voting round** - Verify the complete workflow
5. **Monitor transactions** - Use Etherscan to track all contract interactions

## Resources

- [FHEVM Documentation](https://docs.zama.ai/fhevm)
- [Hardhat Documentation](https://hardhat.org/docs)
- [Sepolia Etherscan](https://sepolia.etherscan.io/)
- [Zama Community Forum](https://www.zama.ai/community)

---

**Built with FHEVM by Zama - Enabling privacy-preserving smart contracts through Fully Homomorphic Encryption**
