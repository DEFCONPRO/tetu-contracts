import chai from "chai";
import chaiAsPromised from "chai-as-promised";
import {config as dotEnvConfig} from "dotenv";
import {DeployInfo} from "../../DeployInfo";
import {DeployerUtils} from "../../../../scripts/deploy/DeployerUtils";
import {SignerWithAddress} from "@nomiclabs/hardhat-ethers/signers";
import {StrategyTestUtils} from "../../StrategyTestUtils";
import {CoreContractsWrapper} from "../../../CoreContractsWrapper";
import {ForwarderV2, IStrategy, SmartVault} from "../../../../typechain";
import {ToolsContractsWrapper} from "../../../ToolsContractsWrapper";
import {universalStrategyTest} from "../../UniversalStrategyTest";
import {MaticAddresses} from "../../../../scripts/addresses/MaticAddresses";
import {SpecificStrategyTest} from "../../SpecificStrategyTest";
import {MultiAaveMaiBalTest} from "./MultiAMBDoHardWork";
import {utils} from "ethers";
import {MABTargetPercentageTest} from "./MABTargetPercentageTest";
import {MabRebalanceTest} from "./MabRebalanceTest";
import {SalvageFromPipelineTest} from "./SalvageFromPipelineTest";
import {PumpInOnHardWorkTest} from "./PumpInOnHardWorkTest";
import {WithdrawAndClaimTest} from "./WithdrawAndClaimTest";
import {EmergencyWithdrawFromPoolTest} from "./EmergencyWithdrawFromPoolTest";
import {CoverageCallsTest} from "./CoverageCallsTest";

dotEnvConfig();
// tslint:disable-next-line:no-var-requires
const argv = require('yargs/yargs')()
  .env('TETU')
  .options({
    disableStrategyTests: {
      type: "boolean",
      default: false,
    },
    onlyOneAMBStrategyTest: {
      type: "number",
      default: -1,
    },
    deployCoreContracts: {
      type: "boolean",
      default: false,
    },
    hardhatChainId: {
      type: "number",
      default: 137
    },
  }).argv;

const {expect} = chai;
chai.use(chaiAsPromised);

describe('Universal AMB tests', async () => {

  if (argv.disableStrategyTests || argv.hardhatChainId !== 137) {
    return;
  }

  const infos: {
    underlying: string,
    underlyingName: string,
    camToken: string,
  }[] = [
    {
      underlying: MaticAddresses.AAVE_TOKEN,
      underlyingName: 'AAVE',
      camToken: MaticAddresses.CAMAAVE_TOKEN,
    }
  ]

  const deployInfo: DeployInfo = new DeployInfo();
  before(async function () {
    await StrategyTestUtils.deployCoreAndInit(deployInfo, argv.deployCoreContracts);
  });

  infos.forEach((info, i) => {

    if (argv.onlyOneAMBStrategyTest !== -1 && i !== argv.onlyOneAMBStrategyTest) {
      return;
    }
    console.log('Start test strategy', i, info.underlyingName);
    // **********************************************
    // ************** CONFIG*************************
    // **********************************************
    const strategyContractName = 'StrategyAaveMaiBal';
    const underlying = info.underlying;
    // add custom liquidation path if necessary
    const forwarderConfigurator = async (forwarder: ForwarderV2) => {
      await forwarder.addLargestLps(
        [MaticAddresses.BAL_TOKEN],
        ['0xc67136e235785727a0d3B5Cfd08325327b81d373']
      );
    };
    // only for strategies where we expect PPFS fluctuations
    const ppfsDecreaseAllowed = true;
    // only for strategies where we expect PPFS fluctuations
    const balanceTolerance = 0.021;
    const finalBalanceTolerance = balanceTolerance * 4;
    const deposit = 100_000;
    // at least 3
    const loops = 9;
    // number of blocks or timestamp value
    const loopValue = 3000;
    // use 'true' if farmable platform values depends on blocks, instead you can use timestamp
    const advanceBlocks = true;
    const specificTests: SpecificStrategyTest[] = [
      new MABTargetPercentageTest(),
      new MabRebalanceTest(),
      new SalvageFromPipelineTest(),
      new PumpInOnHardWorkTest(),
      new WithdrawAndClaimTest(),
      new EmergencyWithdrawFromPoolTest(),
      new CoverageCallsTest(),
    ];
    const AIRDROP_REWARDS_AMOUNT = utils.parseUnits('100');
    const BAL_PIPE_INDEX = 4;
    // **********************************************

    const deployer = (signer: SignerWithAddress) => {
      const core = deployInfo.core as CoreContractsWrapper;
      return StrategyTestUtils.deploy(
        signer,
        core,
        info.underlyingName,
        vaultAddress => {
          const strategyArgs = [
            core.controller.address,
            vaultAddress,
            underlying
          ];
          return DeployerUtils.deployContract(
            signer,
            strategyContractName,
            ...strategyArgs
          ) as Promise<IStrategy>;
        },
        underlying
      );
    };
    const hwInitiator = (
      _signer: SignerWithAddress,
      _user: SignerWithAddress,
      _core: CoreContractsWrapper,
      _tools: ToolsContractsWrapper,
      _underlying: string,
      _vault: SmartVault,
      _strategy: IStrategy,
      _balanceTolerance: number
    ) => {
      return new MultiAaveMaiBalTest(
        _signer,
        _user,
        _core,
        _tools,
        _underlying,
        _vault,
        _strategy,
        _balanceTolerance,
        finalBalanceTolerance,
        info.camToken,
        _signer,
        MaticAddresses.BAL_TOKEN,
        AIRDROP_REWARDS_AMOUNT,
        BAL_PIPE_INDEX,
      );
    };

    universalStrategyTest(
      'AMBTest_' + info.underlyingName,
      deployInfo,
      deployer,
      hwInitiator,
      forwarderConfigurator,
      ppfsDecreaseAllowed,
      balanceTolerance,
      deposit,
      loops,
      loopValue,
      advanceBlocks,
      specificTests,
    );
  });
});
