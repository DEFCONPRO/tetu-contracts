import {ethers} from "hardhat";
import {DeployerUtils} from "../../DeployerUtils";
import {BalSender, BalSender__factory} from "../../../../typechain";
import {RunHelper} from "../../../utils/tools/RunHelper";

// from 3333 - 0xff2FD65228774Ad878dACe3D93f67DCE4e8Cb3f9

async function main() {
  const signer = (await ethers.getSigners())[0];
  const core = await DeployerUtils.getCoreAddresses();

  const data = (await DeployerUtils.deployTetuProxyControlled(signer, "BalSender"));
  const ctr = BalSender__factory.connect(data[0].address, signer);
  await RunHelper.runAndWait(() => ctr.initialize(core.controller));

  await DeployerUtils.wait(5);
  await DeployerUtils.verify(data[1].address);
  await DeployerUtils.verifyWithArgs(data[0].address, [data[1].address]);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
