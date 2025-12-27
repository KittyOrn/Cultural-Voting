# Privacy-Protected Cultural Voting Platform

A decentralized voting system built with Fully Homomorphic Encryption (FHE) technology for confidential cultural project evaluation and selection.

## 🎯 Core Concept

This platform leverages **Fully Homomorphic Encryption (FHE)** to enable privacy-preserving voting on cultural projects. Voters can submit encrypted scores without revealing individual preferences, ensuring complete confidentiality while maintaining verifiable and transparent results.

### Key Features

- **Privacy-First Voting**: All votes are encrypted using FHE technology, protecting voter preferences
- **Confidential Score Aggregation**: Vote tallying occurs on encrypted data without decryption
- **Cultural Project Evaluation**: Specialized system for assessing artistic and cultural initiatives
- **Transparent Results**: Final outcomes are verifiable while maintaining individual privacy
- **Decentralized Governance**: Smart contract-based administration with on-chain verification

## 🔐 FHE Smart Contract

The platform utilizes Fully Homomorphic Encryption within smart contracts to enable:

- **Encrypted Vote Submission**: Scores (1-10) are encrypted before being submitted on-chain
- **Homomorphic Computation**: Vote aggregation performed directly on encrypted values
- **Zero-Knowledge Verification**: Results validated without exposing individual votes
- **Threshold Decryption**: Final results revealed only after voting period ends

### Contract Address

```
0xd88E2D38Bceb34781f403b233E0f1a5a5E3A1022
```

Deployed on Sepolia Testnet

## 🎨 Use Cases

### Cultural Project Selection

Perfect for:
- **Arts Funding**: Community selection of cultural projects for grants
- **Festival Programming**: Private voting on performance submissions
- **Exhibition Curation**: Confidential evaluation of artwork proposals
- **Literary Awards**: Anonymous judging for writing competitions
- **Community Cultural Initiatives**: Democratic selection with privacy guarantees

## 🌐 Live Demo

**Website**: [https://cultural-voting.vercel.app/](https://cultural-voting.vercel.app/)

**GitHub Repository**: [https://github.com/KittyOrn/CulturalVoting](https://github.com/KittyOrn/CulturalVoting)

## 📹 Demonstration

### Video Walkthrough

* Full demonstration video showing the complete voting workflow*

### On-Chain Transaction Evidence

All voting activities are permanently recorded on the blockchain:

**Sample Transactions:**

*View all transactions on [Sepolia Etherscan](https://sepolia.etherscan.io/address/0xd88E2D38Bceb34781f403b233E0f1a5a5E3A1022)*

## 🏗️ Architecture

### Smart Contract Components

**CulturalVoting.sol**
- Project proposal management
- Voter authorization system
- Encrypted vote storage
- FHE-based vote aggregation
- Results revelation mechanism

### Voting Workflow

1. **Project Submission Phase**
   - Cultural organizations propose projects
   - Projects include name, description, and category
   - All proposals stored on-chain

2. **Voter Authorization Phase**
   - Platform admin authorizes eligible voters
   - Ensures controlled and fair participation
   - Prevents Sybil attacks

3. **Voting Round Initiation**
   - Admin selects projects for current round
   - Voting period begins
   - All authorized voters can participate

4. **Private Vote Submission**
   - Voters assign scores (1-10) to projects
   - Scores encrypted using FHE before submission
   - No one can see individual votes

5. **Encrypted Aggregation**
   - Smart contract performs homomorphic addition
   - Aggregation happens on encrypted data
   - Privacy maintained throughout process

6. **Results Revelation**
   - Voting period concludes
   - Final aggregated results decrypted
   - Winner announced with total scores

## 🔒 Privacy Guarantees

### What's Protected

✅ Individual voter scores remain confidential
✅ No one can correlate votes to voter addresses
✅ Vote aggregation occurs without revealing components
✅ Coercion-resistant: voters can't prove their vote

### What's Transparent

✅ Total number of votes per project
✅ Final winning project and aggregate score
✅ All transaction hashes and timestamps
✅ Voter authorization status

## 🎭 Cultural Project Categories

The platform supports various cultural domains:

- **Traditional Culture**: Heritage preservation, traditional arts
- **Modern Art**: Contemporary installations, digital exhibitions
- **Music Performance**: Concerts, festivals, live performances
- **Literature**: Poetry, fiction, creative writing
- **Digital Art**: NFT projects, generative art, multimedia
- **Community Culture**: Grassroots initiatives, neighborhood projects

## 💡 Technical Highlights

### FHE Implementation

- **Encryption Scheme**: Leverages fhEVM for Ethereum compatibility
- **Computation on Encrypted Data**: Enables private vote tallying
- **Gas Optimization**: Efficient encrypted operations
- **Security Guarantees**: Cryptographically secure privacy

### Smart Contract Features

- **Access Control**: Role-based permissions (Admin, Voter, Proposer)
- **Round Management**: Multiple voting rounds supported
- **State Tracking**: Comprehensive voting status monitoring
- **Event Emission**: Complete audit trail via events

### Frontend Integration

- **Web3 Connectivity**: MetaMask integration
- **Real-time Updates**: Live voting status and results
- **Responsive Design**: Mobile-friendly interface
- **User-Friendly UX**: Intuitive voting workflow

## 📊 Platform Statistics

Track key metrics:
- Total projects proposed
- Active voting rounds
- Authorized voter count
- Historical results and winners
- On-chain transaction volume

## 🌟 Benefits

### For Cultural Organizations

- **Fair Evaluation**: Democratic and unbiased selection
- **Increased Participation**: Privacy encourages honest feedback
- **Transparency**: Verifiable results build trust
- **Efficiency**: Automated tallying saves time

### For Voters

- **Privacy Protection**: Vote without fear of retaliation
- **Influence**: Direct impact on cultural funding
- **Confidence**: Cryptographic guarantees of fairness
- **Accessibility**: Easy-to-use web interface

### For Communities

- **Democratic Culture**: Community-driven cultural development
- **Diverse Voices**: Inclusive participation mechanisms
- **Accountability**: On-chain records ensure integrity
- **Innovation**: Cutting-edge technology for social good

## 🔧 Technology Stack

- **Smart Contracts**: Solidity with FHE primitives
- **Encryption**: Fully Homomorphic Encryption (fhEVM)
- **Blockchain**: Ethereum (Sepolia Testnet)
- **Frontend**: HTML5, CSS3, JavaScript
- **Web3 Library**: ethers.js v6
- **Hosting**: Vercel

## 🤝 Contributing

We welcome contributions to improve the platform! Areas of interest:

- Enhanced FHE implementations
- UI/UX improvements
- Additional cultural categories
- Multi-language support
- Accessibility features

## 📄 License

MIT License

## 🔗 Resources

- **Live Application**: https://cultural-voting.vercel.app/
- **Source Code**: https://github.com/KittyOrn/CulturalVoting
- **Contract Address**: `0xd88E2D38Bceb34781f403b233E0f1a5a5E3A1022`
- **Blockchain Explorer**: [View on Sepolia Etherscan](https://sepolia.etherscan.io/address/0xd88E2D38Bceb34781f403b233E0f1a5a5E3A1022)

## 📞 Support

For questions, issues, or collaboration opportunities:

- Open an issue on GitHub
- Check existing documentation
- Review transaction history on Etherscan

---

**Privacy-Protected Cultural Voting Platform** - Empowering communities to make democratic cultural decisions with complete privacy guarantees through Fully Homomorphic Encryption technology.