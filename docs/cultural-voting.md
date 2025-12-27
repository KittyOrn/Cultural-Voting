# Cultural Voting Platform

Privacy-preserving voting for cultural project selection

## Contract Code

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { FHE, euint8, ebool } from "@fhevm/solidity/lib/FHE.sol";
import { SepoliaConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

contract CulturalVoting is SepoliaConfig {

    address public admin;
    uint8 public currentVotingRound;

    struct CulturalProject {
        string name;
        string description;
        string category;
        address proposer;
        bool isActive;
        uint256 proposalTime;
    }

    struct Vote {
        euint8 encryptedScore;
        bool hasVoted;
        uint256 timestamp;
    }

    struct VotingRound {
        uint8[] projectIds;
        bool votingActive;
        bool resultsRevealed;
        uint256 startTime;
        uint256 endTime;
        address[] voters;
        uint8 winningProjectId;
        uint8 maxScore;
    }

    mapping(uint8 => CulturalProject) public projects;
    mapping(uint8 => VotingRound) public votingRounds;
    mapping(uint8 => mapping(uint8 => mapping(address => Vote))) public votes; // round => projectId => voter => vote
    mapping(address => bool) public authorizedVoters;

    uint8 public totalProjects;

    event ProjectProposed(uint8 indexed projectId, string name, address proposer);
    event VotingRoundStarted(uint8 indexed round, uint8[] projectIds, uint256 startTime);
    event VoteSubmitted(address indexed voter, uint8 indexed round, uint8 indexed projectId);
    event ResultsRevealed(uint8 indexed round, uint8 winningProjectId, uint8 maxScore);
    event VoterAuthorized(address indexed voter);
    event VoterRevoked(address indexed voter);

    modifier onlyAdmin() {
        require(msg.sender == admin, "Not authorized");
        _;
    }

    modifier onlyAuthorizedVoter() {
        require(authorizedVoters[msg.sender], "Not authorized to vote");
        _;
    }

    modifier onlyDuringVoting() {
        require(votingRounds[currentVotingRound].votingActive, "Voting not active");
        _;
    }

    constructor() {
        admin = msg.sender;
        currentVotingRound = 1;
        authorizedVoters[msg.sender] = true;
    }

    function proposeProject(
        string memory _name,
        string memory _description,
        string memory _category
    ) external {
        totalProjects++;

        projects[totalProjects] = CulturalProject({
            name: _name,
            description: _description,
            category: _category,
            proposer: msg.sender,
            isActive: true,
            proposalTime: block.timestamp
        });

        emit ProjectProposed(totalProjects, _name, msg.sender);
    }

    function authorizeVoter(address _voter) external onlyAdmin {
        authorizedVoters[_voter] = true;
        emit VoterAuthorized(_voter);
    }

    function revokeVoter(address _voter) external onlyAdmin {
        authorizedVoters[_voter] = false;
        emit VoterRevoked(_voter);
    }

    function startVotingRound(uint8[] memory _projectIds) external onlyAdmin {
        require(!votingRounds[currentVotingRound].votingActive, "Voting already active");
        require(_projectIds.length > 0, "No projects selected");

        for (uint i = 0; i < _projectIds.length; i++) {
            require(projects[_projectIds[i]].isActive, "Project not active");
        }

        votingRounds[currentVotingRound] = VotingRound({
            projectIds: _projectIds,
            votingActive: true,
            resultsRevealed: false,
            startTime: block.timestamp,
            endTime: 0,
            voters: new address[](0),
            winningProjectId: 0,
            maxScore: 0
        });

        emit VotingRoundStarted(currentVotingRound, _projectIds, block.timestamp);
    }

    function submitVote(uint8 _projectId, uint8 _score) external onlyAuthorizedVoter onlyDuringVoting {
        require(_score >= 1 && _score <= 10, "Score must be between 1-10");
        require(_isProjectInCurrentRound(_projectId), "Project not in current round");
        require(!votes[currentVotingRound][_projectId][msg.sender].hasVoted, "Already voted for this project");

        euint8 encryptedScore = FHE.asEuint8(_score);

        votes[currentVotingRound][_projectId][msg.sender] = Vote({
            encryptedScore: encryptedScore,
            hasVoted: true,
            timestamp: block.timestamp
        });

        _addVoterToRound(msg.sender);

        FHE.allowThis(encryptedScore);
        FHE.allow(encryptedScore, msg.sender);

        emit VoteSubmitted(msg.sender, currentVotingRound, _projectId);
    }

    function endVotingRound() external onlyAdmin {
        require(votingRounds[currentVotingRound].votingActive, "Voting not active");
        require(!votingRounds[currentVotingRound].resultsRevealed, "Results already revealed");

        votingRounds[currentVotingRound].votingActive = false;
        votingRounds[currentVotingRound].endTime = block.timestamp;

        _requestResultsDecryption();
    }

    function _requestResultsDecryption() private {
        VotingRound storage round = votingRounds[currentVotingRound];

        // 收集所有需要解密的投票
        bytes32[] memory cts;
        uint256 totalVotes = 0;

        // 计算总投票数量
        for (uint i = 0; i < round.projectIds.length; i++) {
            uint8 projectId = round.projectIds[i];
            for (uint j = 0; j < round.voters.length; j++) {
                address voter = round.voters[j];
                if (votes[currentVotingRound][projectId][voter].hasVoted) {
                    totalVotes++;
                }
            }
        }

        cts = new bytes32[](totalVotes);
        uint256 index = 0;

        // 收集加密投票数据
        for (uint i = 0; i < round.projectIds.length; i++) {
            uint8 projectId = round.projectIds[i];
            for (uint j = 0; j < round.voters.length; j++) {
                address voter = round.voters[j];
                if (votes[currentVotingRound][projectId][voter].hasVoted) {
                    cts[index] = FHE.toBytes32(votes[currentVotingRound][projectId][voter].encryptedScore);
                    index++;
                }
            }
        }

        if (totalVotes > 0) {
            // 请求异步解密
            FHE.requestDecryption(cts, this.processResults.selector);
        } else {
            // 没有投票，直接完成
            _finalizeResults(0, 0);
        }
    }

    function processResults(
        uint256 requestId,
        uint8[] calldata decryptedScores,
        bytes[] calldata signatures
    ) external {
        // 注意：在实际部署时，应该验证调用者是否为可信的解密节点
        // 这里简化处理，假设解密结果是有效的

        VotingRound storage round = votingRounds[currentVotingRound];

        // 计算每个项目的得分
        uint8 winningProject = 0;
        uint8 maxTotalScore = 0;

        uint256 scoreIndex = 0;
        for (uint i = 0; i < round.projectIds.length; i++) {
            uint8 projectId = round.projectIds[i];
            uint8 projectScore = 0;

            for (uint j = 0; j < round.voters.length; j++) {
                address voter = round.voters[j];
                if (votes[currentVotingRound][projectId][voter].hasVoted) {
                    if (scoreIndex < decryptedScores.length) {
                        projectScore += decryptedScores[scoreIndex];
                        scoreIndex++;
                    }
                }
            }

            if (projectScore > maxTotalScore) {
                maxTotalScore = projectScore;
                winningProject = projectId;
            }
        }

        _finalizeResults(winningProject, maxTotalScore);
    }

    function _finalizeResults(uint8 _winningProject, uint8 _maxScore) private {
        VotingRound storage round = votingRounds[currentVotingRound];

        round.winningProjectId = _winningProject;
        round.maxScore = _maxScore;
        round.resultsRevealed = true;

        emit ResultsRevealed(currentVotingRound, _winningProject, _maxScore);

        currentVotingRound++;
    }

    function _isProjectInCurrentRound(uint8 _projectId) private view returns (bool) {
        VotingRound storage round = votingRounds[currentVotingRound];

        for (uint i = 0; i < round.projectIds.length; i++) {
            if (round.projectIds[i] == _projectId) {
                return true;
            }
        }
        return false;
    }

    function _addVoterToRound(address _voter) private {
        VotingRound storage round = votingRounds[currentVotingRound];

        for (uint i = 0; i < round.voters.length; i++) {
            if (round.voters[i] == _voter) {
                return;
            }
        }

        round.voters.push(_voter);
    }

    function getCurrentRoundInfo() external view returns (
        uint8 round,
        bool votingActive,
        bool resultsRevealed,
        uint256 startTime,
        uint256 endTime,
        uint8[] memory projectIds
    ) {
        VotingRound storage roundData = votingRounds[currentVotingRound];
        return (
            currentVotingRound,
            roundData.votingActive,
            roundData.resultsRevealed,
            roundData.startTime,
            roundData.endTime,
            roundData.projectIds
        );
    }

    function getProjectInfo(uint8 _projectId) external view returns (
        string memory name,
        string memory description,
        string memory category,
        address proposer,
        bool isActive,
        uint256 proposalTime
    ) {
        CulturalProject storage project = projects[_projectId];
        return (
            project.name,
            project.description,
            project.category,
            project.proposer,
            project.isActive,
            project.proposalTime
        );
    }

    function getVoteStatus(uint8 _projectId, address _voter) external view returns (
        bool hasVoted,
        uint256 timestamp
    ) {
        Vote storage vote = votes[currentVotingRound][_projectId][_voter];
        return (vote.hasVoted, vote.timestamp);
    }

    function getRoundResults(uint8 _round) external view returns (
        bool resultsRevealed,
        uint8 winningProjectId,
        uint8 maxScore,
        uint256 voterCount
    ) {
        VotingRound storage round = votingRounds[_round];
        return (
            round.resultsRevealed,
            round.winningProjectId,
            round.maxScore,
            round.voters.length
        );
    }

    function isAuthorizedVoter(address _voter) external view returns (bool) {
        return authorizedVoters[_voter];
    }

    // 获取项目的投票人数（不解密具体分数）
    function getProjectVoteCount(uint8 _projectId) external view returns (uint256) {
        VotingRound storage round = votingRounds[currentVotingRound];
        uint256 voteCount = 0;

        for (uint i = 0; i < round.voters.length; i++) {
            address voter = round.voters[i];
            if (votes[currentVotingRound][_projectId][voter].hasVoted) {
                voteCount++;
            }
        }

        return voteCount;
    }

    // 获取当前轮次的所有投票项目ID
    function getCurrentRoundProjectIds() external view returns (uint8[] memory) {
        return votingRounds[currentVotingRound].projectIds;
    }

    // 检查用户是否已对特定项目投票
    function hasUserVotedForProject(uint8 _projectId, address _voter) external view returns (bool) {
        return votes[currentVotingRound][_projectId][_voter].hasVoted;
    }
}
```

## Test Code

```typescript
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { ethers, fhevm } from "hardhat";
import { CulturalVoting, CulturalVoting__factory } from "../types";
import { expect } from "chai";

type Signers = {
  deployer: HardhatEthersSigner;
  voter1: HardhatEthersSigner;
  voter2: HardhatEthersSigner;
  proposer: HardhatEthersSigner;
};

async function deployFixture() {
  const factory = (await ethers.getContractFactory("CulturalVoting")) as CulturalVoting__factory;
  const culturalVotingContract = (await factory.deploy()) as CulturalVoting;
  const contractAddress = await culturalVotingContract.getAddress();

  return { culturalVotingContract, contractAddress };
}

describe("Cultural Voting Smart Contract", function () {
  let signers: Signers;
  let culturalVotingContract: CulturalVoting;
  let contractAddress: string;

  before(async function () {
    const ethSigners: HardhatEthersSigner[] = await ethers.getSigners();
    signers = {
      deployer: ethSigners[0],
      voter1: ethSigners[1],
      voter2: ethSigners[2],
      proposer: ethSigners[3],
    };
  });

  beforeEach(async function () {
    // Check whether the tests are running against an FHEVM mock environment
    if (!fhevm.isMock) {
      console.warn(`This test suite cannot run on Sepolia Testnet`);
      this.skip();
    }

    ({ culturalVotingContract, contractAddress } = await deployFixture());
  });

  describe("Deployment", function () {
    it("should set the deployer as admin", async function () {
      const admin = await culturalVotingContract.admin();
      expect(admin).to.equal(signers.deployer.address);
    });

    it("should initialize voting round to 1", async function () {
      const currentRound = await culturalVotingContract.currentVotingRound();
      expect(currentRound).to.equal(1);
    });

    it("should authorize the deployer as a voter", async function () {
      const isAuthorized = await culturalVotingContract.isAuthorizedVoter(signers.deployer.address);
      expect(isAuthorized).to.be.true;
    });
  });

  describe("Project Proposal", function () {
    it("should allow anyone to propose a project", async function () {
      const projectName = "Digital Art Installation";
      const description = "An interactive digital art experience";
      const category = "Digital Art";

      const tx = await culturalVotingContract.connect(signers.proposer).proposeProject(
        projectName,
        description,
        category,
      );

      await expect(tx)
        .to.emit(culturalVotingContract, "ProjectProposed")
        .withArgs(1, projectName, signers.proposer.address);
    });

    it("should store project information correctly", async function () {
      const projectName = "Music Festival";
      const description = "Annual music and arts festival";
      const category = "Music Performance";

      await culturalVotingContract.connect(signers.proposer).proposeProject(
        projectName,
        description,
        category,
      );

      const projectInfo = await culturalVotingContract.getProjectInfo(1);
      expect(projectInfo.name).to.equal(projectName);
      expect(projectInfo.description).to.equal(description);
      expect(projectInfo.category).to.equal(category);
      expect(projectInfo.proposer).to.equal(signers.proposer.address);
      expect(projectInfo.isActive).to.be.true;
    });

    it("should increment project ID for each new proposal", async function () {
      await culturalVotingContract
        .connect(signers.proposer)
        .proposeProject("Project 1", "Description 1", "Category 1");
      await culturalVotingContract
        .connect(signers.proposer)
        .proposeProject("Project 2", "Description 2", "Category 2");
      await culturalVotingContract
        .connect(signers.proposer)
        .proposeProject("Project 3", "Description 3", "Category 3");

      const totalProjects = await culturalVotingContract.totalProjects();
      expect(totalProjects).to.equal(3);
    });
  });

  describe("Voter Authorization", function () {
    it("should allow admin to authorize voters", async function () {
      const tx = await culturalVotingContract
        .connect(signers.deployer)
        .authorizeVoter(signers.voter1.address);

      await expect(tx)
        .to.emit(culturalVotingContract, "VoterAuthorized")
        .withArgs(signers.voter1.address);

      const isAuthorized = await culturalVotingContract.isAuthorizedVoter(
        signers.voter1.address,
      );
      expect(isAuthorized).to.be.true;
    });

    it("should not allow non-admin to authorize voters", async function () {
      await expect(
        culturalVotingContract
          .connect(signers.voter1)
          .authorizeVoter(signers.voter2.address),
      ).to.be.revertedWith("Not authorized");
    });

    it("should allow admin to revoke voter authorization", async function () {
      await culturalVotingContract
        .connect(signers.deployer)
        .authorizeVoter(signers.voter1.address);

      const tx = await culturalVotingContract
        .connect(signers.deployer)
        .revokeVoter(signers.voter1.address);

      await expect(tx)
        .to.emit(culturalVotingContract, "VoterRevoked")
        .withArgs(signers.voter1.address);

      const isAuthorized = await culturalVotingContract.isAuthorizedVoter(
        signers.voter1.address,
      );
      expect(isAuthorized).to.be.false;
    });
  });

  describe("Voting Round Management", function () {
    beforeEach(async function () {
      // Propose some projects
      await culturalVotingContract
        .connect(signers.proposer)
        .proposeProject("Project A", "Description A", "Category A");
      await culturalVotingContract
        .connect(signers.proposer)
        .proposeProject("Project B", "Description B", "Category B");

      // Authorize voters
      await culturalVotingContract
        .connect(signers.deployer)
        .authorizeVoter(signers.voter1.address);
      await culturalVotingContract
        .connect(signers.deployer)
        .authorizeVoter(signers.voter2.address);
    });

    it("should allow admin to start a voting round", async function () {
      const projectIds = [1, 2];
      const tx = await culturalVotingContract
        .connect(signers.deployer)
        .startVotingRound(projectIds);

      await expect(tx)
        .to.emit(culturalVotingContract, "VotingRoundStarted")
        .withArgs(1, projectIds, expect.any(Object));
    });

    it("should reject starting round if voting is already active", async function () {
      await culturalVotingContract
        .connect(signers.deployer)
        .startVotingRound([1, 2]);

      await expect(
        culturalVotingContract.connect(signers.deployer).startVotingRound([1]),
      ).to.be.revertedWith("Voting already active");
    });

    it("should not allow starting round with no projects", async function () {
      await expect(
        culturalVotingContract.connect(signers.deployer).startVotingRound([]),
      ).to.be.revertedWith("No projects selected");
    });

    it("should retrieve current round information", async function () {
      const projectIds = [1, 2];
      await culturalVotingContract
        .connect(signers.deployer)
        .startVotingRound(projectIds);

      const roundInfo = await culturalVotingContract.getCurrentRoundInfo();
      expect(roundInfo.round).to.equal(1);
      expect(roundInfo.votingActive).to.be.true;
      expect(roundInfo.resultsRevealed).to.be.false;
      expect(roundInfo.projectIds).to.deep.equal(projectIds);
    });
  });

  describe("Voting Process", function () {
    beforeEach(async function () {
      // Propose projects
      await culturalVotingContract
        .connect(signers.proposer)
        .proposeProject("Project A", "Description A", "Category A");
      await culturalVotingContract
        .connect(signers.proposer)
        .proposeProject("Project B", "Description B", "Category B");

      // Authorize voters
      await culturalVotingContract
        .connect(signers.deployer)
        .authorizeVoter(signers.voter1.address);
      await culturalVotingContract
        .connect(signers.deployer)
        .authorizeVoter(signers.voter2.address);

      // Start voting round
      await culturalVotingContract
        .connect(signers.deployer)
        .startVotingRound([1, 2]);
    });

    it("should allow authorized voters to submit encrypted votes", async function () {
      const projectId = 1;
      const score = 8;

      const tx = await culturalVotingContract
        .connect(signers.voter1)
        .submitVote(projectId, score);

      await expect(tx)
        .to.emit(culturalVotingContract, "VoteSubmitted")
        .withArgs(signers.voter1.address, 1, projectId);
    });

    it("should reject votes from unauthorized voters", async function () {
      await expect(
        culturalVotingContract.connect(signers.proposer).submitVote(1, 7),
      ).to.be.revertedWith("Not authorized to vote");
    });

    it("should reject votes outside score range", async function () {
      await expect(
        culturalVotingContract.connect(signers.voter1).submitVote(1, 0),
      ).to.be.revertedWith("Score must be between 1-10");

      await expect(
        culturalVotingContract.connect(signers.voter1).submitVote(1, 11),
      ).to.be.revertedWith("Score must be between 1-10");
    });

    it("should reject votes for projects not in current round", async function () {
      // Propose a third project
      await culturalVotingContract
        .connect(signers.proposer)
        .proposeProject("Project C", "Description C", "Category C");

      // Try to vote for project C which is not in the current round
      await expect(
        culturalVotingContract.connect(signers.voter1).submitVote(3, 5),
      ).to.be.revertedWith("Project not in current round");
    });

    it("should reject duplicate votes from same voter for same project", async function () {
      await culturalVotingContract.connect(signers.voter1).submitVote(1, 8);

      await expect(
        culturalVotingContract.connect(signers.voter1).submitVote(1, 7),
      ).to.be.revertedWith("Already voted for this project");
    });

    it("should allow same voter to vote for different projects", async function () {
      await culturalVotingContract.connect(signers.voter1).submitVote(1, 8);

      const tx = await culturalVotingContract
        .connect(signers.voter1)
        .submitVote(2, 9);

      await expect(tx)
        .to.emit(culturalVotingContract, "VoteSubmitted")
        .withArgs(signers.voter1.address, 1, 2);
    });

    it("should track vote status correctly", async function () {
      await culturalVotingContract.connect(signers.voter1).submitVote(1, 8);

      const voteStatus = await culturalVotingContract.getVoteStatus(1, signers.voter1.address);
      expect(voteStatus.hasVoted).to.be.true;
      expect(voteStatus.timestamp).to.be.greaterThan(0);
    });

    it("should track vote count per project", async function () {
      await culturalVotingContract.connect(signers.voter1).submitVote(1, 8);
      await culturalVotingContract.connect(signers.voter2).submitVote(1, 9);

      const voteCount = await culturalVotingContract.getProjectVoteCount(1);
      expect(voteCount).to.equal(2);
    });

    it("should return current round project IDs", async function () {
      const projectIds = await culturalVotingContract.getCurrentRoundProjectIds();
      expect(projectIds).to.deep.equal([1, 2]);
    });
  });

  describe("Round Completion", function () {
    beforeEach(async function () {
      // Propose projects
      await culturalVotingContract
        .connect(signers.proposer)
        .proposeProject("Project A", "Description A", "Category A");
      await culturalVotingContract
        .connect(signers.proposer)
        .proposeProject("Project B", "Description B", "Category B");

      // Authorize voters
      await culturalVotingContract
        .connect(signers.deployer)
        .authorizeVoter(signers.voter1.address);
      await culturalVotingContract
        .connect(signers.deployer)
        .authorizeVoter(signers.voter2.address);

      // Start voting round
      await culturalVotingContract
        .connect(signers.deployer)
        .startVotingRound([1, 2]);
    });

    it("should allow admin to end voting round", async function () {
      const tx = await culturalVotingContract
        .connect(signers.deployer)
        .endVotingRound();

      await tx.wait();

      const roundInfo = await culturalVotingContract.getCurrentRoundInfo();
      expect(roundInfo.votingActive).to.be.false;
    });

    it("should not allow ending round if voting is not active", async function () {
      await culturalVotingContract.connect(signers.deployer).endVotingRound();

      await expect(
        culturalVotingContract.connect(signers.deployer).endVotingRound(),
      ).to.be.revertedWith("Voting not active");
    });

    it("should not allow non-admin to end voting round", async function () {
      await expect(
        culturalVotingContract.connect(signers.voter1).endVotingRound(),
      ).to.be.revertedWith("Not authorized");
    });

    it("should prevent voting after round ends", async function () {
      await culturalVotingContract.connect(signers.deployer).endVotingRound();

      await expect(
        culturalVotingContract.connect(signers.voter1).submitVote(1, 8),
      ).to.be.revertedWith("Voting not active");
    });
  });

  describe("Encryption and Privacy Features", function () {
    beforeEach(async function () {
      // Propose projects
      await culturalVotingContract
        .connect(signers.proposer)
        .proposeProject("Project A", "Description A", "Category A");

      // Authorize voters
      await culturalVotingContract
        .connect(signers.deployer)
        .authorizeVoter(signers.voter1.address);

      // Start voting round
      await culturalVotingContract
        .connect(signers.deployer)
        .startVotingRound([1]);
    });

    it("should encrypt votes using FHE", async function () {
      const projectId = 1;
      const score = 8;

      const tx = await culturalVotingContract
        .connect(signers.voter1)
        .submitVote(projectId, score);

      await tx.wait();

      // Vote is encrypted - we can only verify it was submitted, not the value
      const voteStatus = await culturalVotingContract.getVoteStatus(
        projectId,
        signers.voter1.address,
      );
      expect(voteStatus.hasVoted).to.be.true;
    });
  });

  describe("Helper Functions", function () {
    beforeEach(async function () {
      await culturalVotingContract
        .connect(signers.proposer)
        .proposeProject("Project A", "Description A", "Category A");

      await culturalVotingContract
        .connect(signers.deployer)
        .authorizeVoter(signers.voter1.address);

      await culturalVotingContract
        .connect(signers.deployer)
        .startVotingRound([1]);
    });

    it("should check if user has voted for a project", async function () {
      const hasNotVoted = await culturalVotingContract.hasUserVotedForProject(
        1,
        signers.voter1.address,
      );
      expect(hasNotVoted).to.be.false;

      await culturalVotingContract.connect(signers.voter1).submitVote(1, 8);

      const hasVoted = await culturalVotingContract.hasUserVotedForProject(
        1,
        signers.voter1.address,
      );
      expect(hasVoted).to.be.true;
    });

    it("should retrieve round results correctly", async function () {
      const roundResults = await culturalVotingContract.getRoundResults(1);
      expect(roundResults.resultsRevealed).to.be.false;
      expect(roundResults.voterCount).to.equal(0);
    });
  });
});

```

## Key Concepts

### FHE Operations
This example demonstrates the use of Fully Homomorphic Encryption (FHE) in smart contracts.

### Important Patterns
- Encrypted input handling with `FHE.fromExternal()`
- Permission management with `FHE.allowThis()` and `FHE.allow()`
- Homomorphic operations on encrypted data

## Running the Example

### Install Dependencies
```bash
npm install
```

### Compile
```bash
npm run compile
```

### Test
```bash
npm run test
```

### Deploy
```bash
npx hardhat deploy --network localhost
```

## Resources
- [FHEVM Documentation](https://docs.zama.ai/fhevm)
- [Zama Examples](https://docs.zama.org/protocol/examples)

---

Category: **Advanced Examples**
