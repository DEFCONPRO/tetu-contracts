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

pragma solidity 0.7.6;

import "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./Controllable.sol";
import "../interface/IFundKeeper.sol";

/// currently it is just upgradable contract that holds money for further implementations
contract FundKeeper is Initializable, Controllable, IFundKeeper {
  using SafeERC20 for IERC20;

  event Salvage(address token, uint256 amount);

  function initialize(address _controller) public initializer {
    Controllable.initializeControllable(_controller);
  }

  function salvage(address _token, uint256 amount) public onlyControllerOrGovernance {
    uint256 tokenBalance = IERC20(_token).balanceOf(address(this));
    require(tokenBalance >= amount, "not enough balance");
    IERC20(_token).safeTransfer(msg.sender, amount);
    emit Salvage(_token, amount);
  }

}