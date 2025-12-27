import { task } from "hardhat/config";
import type { TaskArguments } from "hardhat/types";

/**
 * Tutorial: Deploy and Interact Locally (--network localhost)
 * ===========================================================
 *
 * 1. From a separate terminal window:
 *
 *   npx hardhat node
 *
 * 2. Deploy the CulturalVoting contract
 *
 *   npx hardhat --network localhost deploy
 *
 * 3. Interact with the CulturalVoting contract
 *
 *   npx hardhat --network localhost task:propose --name "My Project" --description "Project description" --category "Art"
 *   npx hardhat --network localhost task:authorize-voter --address 0x...
 *   npx hardhat --network localhost task:start-voting --projects 1,2,3
 *   npx hardhat --network localhost task:submit-vote --project 1 --score 8
 *
 *
 * Tutorial: Deploy and Interact on Sepolia (--network sepolia)
 * ===========================================================
 *
 * 1. Deploy the CulturalVoting contract
 *
 *   npx hardhat --network sepolia deploy
 *
 * 2. Interact with the CulturalVoting contract
 *
 *   npx hardhat --network sepolia task:propose --name "My Project" --description "Project description" --category "Art"
 *   npx hardhat --network sepolia task:authorize-voter --address 0x...
 *   npx hardhat --network sepolia task:start-voting --projects 1,2,3
 *   npx hardhat --network sepolia task:submit-vote --project 1 --score 8
 *
 */

/**
 * Example:
 *   - npx hardhat --network localhost task:address
 *   - npx hardhat --network sepolia task:address
 */
task("task:address", "Prints the CulturalVoting contract address").setAction(
  async function (_taskArguments: TaskArguments, hre) {
    const { deployments } = hre;

    const culturalVoting = await deployments.get("CulturalVoting");

    console.log("CulturalVoting address is " + culturalVoting.address);
  },
);

/**
 * Example:
 *   - npx hardhat --network localhost task:propose --name "Digital Art" --description "Interactive installation" --category "Art"
 *   - npx hardhat --network sepolia task:propose --name "Music Festival" --description "Annual event" --category "Music"
 */
task("task:propose", "Proposes a new cultural project")
  .addOptionalParam("address", "Optionally specify the CulturalVoting contract address")
  .addParam("name", "The project name")
  .addParam("description", "The project description")
  .addParam("category", "The project category")
  .setAction(async function (taskArguments: TaskArguments, hre) {
    const { ethers, deployments } = hre;

    const CulturalVotingDeployment = taskArguments.address
      ? { address: taskArguments.address }
      : await deployments.get("CulturalVoting");
    console.log(`CulturalVoting: ${CulturalVotingDeployment.address}`);

    const signers = await ethers.getSigners();

    const culturalVotingContract = await ethers.getContractAt(
      "CulturalVoting",
      CulturalVotingDeployment.address,
    );

    const tx = await culturalVotingContract
      .connect(signers[0])
      .proposeProject(
        taskArguments.name,
        taskArguments.description,
        taskArguments.category,
      );
    console.log(`Wait for tx:${tx.hash}...`);

    const receipt = await tx.wait();
    console.log(`tx:${tx.hash} status=${receipt?.status}`);

    const totalProjects = await culturalVotingContract.totalProjects();
    console.log(`Project proposed successfully! Total projects: ${totalProjects}`);
  });

/**
 * Example:
 *   - npx hardhat --network localhost task:authorize-voter --voter 0x...
 *   - npx hardhat --network sepolia task:authorize-voter --voter 0x...
 */
task("task:authorize-voter", "Authorizes a voter")
  .addOptionalParam("address", "Optionally specify the CulturalVoting contract address")
  .addParam("voter", "The voter address to authorize")
  .setAction(async function (taskArguments: TaskArguments, hre) {
    const { ethers, deployments } = hre;

    const CulturalVotingDeployment = taskArguments.address
      ? { address: taskArguments.address }
      : await deployments.get("CulturalVoting");
    console.log(`CulturalVoting: ${CulturalVotingDeployment.address}`);

    const signers = await ethers.getSigners();

    const culturalVotingContract = await ethers.getContractAt(
      "CulturalVoting",
      CulturalVotingDeployment.address,
    );

    const tx = await culturalVotingContract
      .connect(signers[0])
      .authorizeVoter(taskArguments.voter);
    console.log(`Wait for tx:${tx.hash}...`);

    const receipt = await tx.wait();
    console.log(`tx:${tx.hash} status=${receipt?.status}`);

    console.log(`Voter ${taskArguments.voter} authorized successfully!`);
  });

/**
 * Example:
 *   - npx hardhat --network localhost task:start-voting --projects 1,2,3
 *   - npx hardhat --network sepolia task:start-voting --projects 1,2
 */
task("task:start-voting", "Starts a new voting round")
  .addOptionalParam("address", "Optionally specify the CulturalVoting contract address")
  .addParam("projects", "Comma-separated list of project IDs")
  .setAction(async function (taskArguments: TaskArguments, hre) {
    const { ethers, deployments } = hre;

    const projectIds = taskArguments.projects.split(",").map((id: string) => parseInt(id.trim()));

    const CulturalVotingDeployment = taskArguments.address
      ? { address: taskArguments.address }
      : await deployments.get("CulturalVoting");
    console.log(`CulturalVoting: ${CulturalVotingDeployment.address}`);

    const signers = await ethers.getSigners();

    const culturalVotingContract = await ethers.getContractAt(
      "CulturalVoting",
      CulturalVotingDeployment.address,
    );

    const tx = await culturalVotingContract.connect(signers[0]).startVotingRound(projectIds);
    console.log(`Wait for tx:${tx.hash}...`);

    const receipt = await tx.wait();
    console.log(`tx:${tx.hash} status=${receipt?.status}`);

    console.log(`Voting round started for projects: ${projectIds}`);
  });

/**
 * Example:
 *   - npx hardhat --network localhost task:submit-vote --project 1 --score 8
 *   - npx hardhat --network sepolia task:submit-vote --project 2 --score 9
 */
task("task:submit-vote", "Submits a vote for a project")
  .addOptionalParam("address", "Optionally specify the CulturalVoting contract address")
  .addParam("project", "The project ID to vote for")
  .addParam("score", "The score (1-10)")
  .setAction(async function (taskArguments: TaskArguments, hre) {
    const { ethers, deployments } = hre;

    const projectId = parseInt(taskArguments.project);
    const score = parseInt(taskArguments.score);

    if (!Number.isInteger(projectId)) {
      throw new Error(`Argument --project is not an integer`);
    }
    if (!Number.isInteger(score) || score < 1 || score > 10) {
      throw new Error(`Argument --score must be an integer between 1 and 10`);
    }

    const CulturalVotingDeployment = taskArguments.address
      ? { address: taskArguments.address }
      : await deployments.get("CulturalVoting");
    console.log(`CulturalVoting: ${CulturalVotingDeployment.address}`);

    const signers = await ethers.getSigners();

    const culturalVotingContract = await ethers.getContractAt(
      "CulturalVoting",
      CulturalVotingDeployment.address,
    );

    const tx = await culturalVotingContract.connect(signers[0]).submitVote(projectId, score);
    console.log(`Wait for tx:${tx.hash}...`);

    const receipt = await tx.wait();
    console.log(`tx:${tx.hash} status=${receipt?.status}`);

    console.log(`Vote submitted for project ${projectId} with score ${score}`);
  });

/**
 * Example:
 *   - npx hardhat --network localhost task:get-project --id 1
 *   - npx hardhat --network sepolia task:get-project --id 1
 */
task("task:get-project", "Gets project information")
  .addOptionalParam("address", "Optionally specify the CulturalVoting contract address")
  .addParam("id", "The project ID")
  .setAction(async function (taskArguments: TaskArguments, hre) {
    const { ethers, deployments } = hre;

    const projectId = parseInt(taskArguments.id);

    const CulturalVotingDeployment = taskArguments.address
      ? { address: taskArguments.address }
      : await deployments.get("CulturalVoting");
    console.log(`CulturalVoting: ${CulturalVotingDeployment.address}`);

    const culturalVotingContract = await ethers.getContractAt(
      "CulturalVoting",
      CulturalVotingDeployment.address,
    );

    const projectInfo = await culturalVotingContract.getProjectInfo(projectId);
    console.log("\nProject Information:");
    console.log("-------------------");
    console.log(`Name: ${projectInfo.name}`);
    console.log(`Description: ${projectInfo.description}`);
    console.log(`Category: ${projectInfo.category}`);
    console.log(`Proposer: ${projectInfo.proposer}`);
    console.log(`Active: ${projectInfo.isActive}`);
    console.log(`Proposal Time: ${new Date(Number(projectInfo.proposalTime) * 1000).toISOString()}`);
  });

/**
 * Example:
 *   - npx hardhat --network localhost task:get-round-info
 *   - npx hardhat --network sepolia task:get-round-info
 */
task("task:get-round-info", "Gets current voting round information")
  .addOptionalParam("address", "Optionally specify the CulturalVoting contract address")
  .setAction(async function (taskArguments: TaskArguments, hre) {
    const { ethers, deployments } = hre;

    const CulturalVotingDeployment = taskArguments.address
      ? { address: taskArguments.address }
      : await deployments.get("CulturalVoting");
    console.log(`CulturalVoting: ${CulturalVotingDeployment.address}`);

    const culturalVotingContract = await ethers.getContractAt(
      "CulturalVoting",
      CulturalVotingDeployment.address,
    );

    const roundInfo = await culturalVotingContract.getCurrentRoundInfo();
    console.log("\nCurrent Voting Round Information:");
    console.log("---------------------------------");
    console.log(`Round: ${roundInfo.round}`);
    console.log(`Voting Active: ${roundInfo.votingActive}`);
    console.log(`Results Revealed: ${roundInfo.resultsRevealed}`);
    console.log(`Start Time: ${new Date(Number(roundInfo.startTime) * 1000).toISOString()}`);
    if (Number(roundInfo.endTime) > 0) {
      console.log(`End Time: ${new Date(Number(roundInfo.endTime) * 1000).toISOString()}`);
    }
    console.log(`Project IDs: ${roundInfo.projectIds}`);
  });
