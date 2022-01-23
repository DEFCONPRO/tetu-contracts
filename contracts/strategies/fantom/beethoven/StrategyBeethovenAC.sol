// SPDX-License-Identifier: ISC
/**
* By using this software, you understand, acknowledge and accept that Tetu
* and/or the underlying software are provided “as is” and “as available”
* basis and without warranties or representations of any kind either expressed
* or implied. Any use of this open source software released under the ISC
* Internet Systems Consortium license is done at your own risk to the fullest
* extent permissible pursuant to applicable law any and all liability as well
* as all warranties, including any fitness for a particular purpose with respect
* to Tetu and/or the underlying software and the use thereof are disclaimed.
*/
pragma solidity 0.8.4;


import "../../../third_party/uniswap/IUniswapV2Pair.sol";
import "../../../base/strategies/beethoven/BeethovenACBase.sol";

contract StrategyBeethovenAC is BeethovenACBase {

  // MASTER_CHEF
  address private constant _MASTER_CHEF = address(0x8166994d9ebBe5829EC86Bd81258149B87faCfd3);
  address private constant _BEETHOVEN_VAULT = address(0x20dd72Ed959b6147912C2e529F0a0C651c33c9ce);
  IStrategy.Platform private constant _PLATFORM = IStrategy.Platform.BEETHOVEN;

  // rewards
  address private constant BEETS = address(0xF24Bcf4d1e507740041C9cFd2DddB29585aDCe1e);
  address[] private poolRewards = [BEETS];

  constructor(
    address _controller,
    address _vault,
    address _underlying,
    uint256 _poolId, //29
    address _depositToken,
    bytes32 _beethovenPoolId,
    bytes32 _rewardToDepositPoolId

  ) BeethovenACBase(
    _controller,
    _vault,
    _underlying,
    poolRewards,
    _MASTER_CHEF,
    _poolId,
    _BEETHOVEN_VAULT,
    _depositToken,
    _beethovenPoolId,
    _rewardToDepositPoolId
  ) {
    require(_underlying != address(0), "zero underlying");
    //    require(_token0 != address(0), "zero token0");
    //    require(_token1 != address(0), "zero token1");
    //    require(_token0 != _token1, "same tokens");
    //    address token0 = IUniswapV2Pair(_underlying).token0();
    //    address token1 = IUniswapV2Pair(_underlying).token1();
    //    require(_token0 == token0 || _token0 == token1, "wrong token0");
    //    require(_token1 == token0 || _token1 == token1, "wrong token1");
  }


  function platform() external override pure returns (IStrategy.Platform) {
    return _PLATFORM;
  }
}
