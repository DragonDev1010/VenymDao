// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import '@openzeppelin/contracts/access/Ownable.sol';
import '@openzeppelin/contracts/token/ERC20/IERC20.sol';
contract Dao is Ownable{
    uint256 public voteFee;
    IERC20 governanceToken;
    address createTokenProposal;
    constructor(address govAddr) {
        governanceToken = IERC20(govAddr);
    }
    function setVoteFee(uint256 fee_) public onlyOwner{
        voteFee = fee_;
    }
    function setProposalAddress(address addr_) public onlyOwner{
        createTokenProposal = addr_;
    }
    function approve(address spender, uint256 amount) public {
        require(msg.sender == createTokenProposal, 'Only porposal contracts can approve DAO wallet.');
        governanceToken.approve(spender, amount);
    }
}