import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  const deployedCulturalVoting = await deploy("CulturalVoting", {
    from: deployer,
    log: true,
  });

  console.log(`CulturalVoting contract: `, deployedCulturalVoting.address);
};
export default func;
func.id = "deploy_culturalvoting";
func.tags = ["CulturalVoting"];
