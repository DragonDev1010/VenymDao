// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import '@openzeppelin/contracts/access/Ownable.sol';
import '@openzeppelin/contracts/token/ERC20/IERC20.sol';
contract Dao is Ownable{
    uint256 public voteFee;
    IERC20 governanceToken;
    constructor(address govAddr) {
        governanceToken = IERC20(govAddr);
    }
    function setVoteFee(uint256 fee_) public onlyOwner{
        voteFee = fee_;
    }
    function approve(address spender, uint256 amount) public {
        governanceToken.approve(spender, amount);
    }
}