// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import '@openzeppelin/contracts/access/Ownable.sol';
contract Dao is Ownable{
    uint256 public voteFee;
    function setVoteFee(uint256 fee_) public {
        voteFee = fee_;
    }
}