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
