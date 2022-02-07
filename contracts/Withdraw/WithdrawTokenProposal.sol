// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import '../Dao.sol';
import '@openzeppelin/contracts/utils/math/SafeMath.sol';
import '@openzeppelin/contracts/token/ERC20/IERC20.sol';

contract WithdrawTokenProposal {
    Dao daoContract;
    IERC20 tokenContract;
    address public daoAddress;

    struct TokenWithdrawProposal {
        address tokenAddr;
        uint256 tokenAmount;
        address creator;
        uint256 created;
    }

    TokenWithdrawProposal[] public propList;

    event CreatedProposal(uint256 propId, address tokenAddr, uint256 amount_, address creator, uint256 created);

    constructor(address daoAddr_) {
        daoContract = Dao(daoAddr_);
        daoAddress = daoAddr_;
    }

    function createProp(address token_, uint256 amount_) public {
        require(token_ != address(0), 'WithdrawTokenProposal.createProp: Token contract address can not be zero.');
        require(amount_ > 0, 'WithdrawTokenProposal.createProp: Token amount must be greater than zero.');
        tokenContract = IERC20(token_);
        require(tokenContract.balanceOf(daoAddress) > amount_, 'WithdrawTokenProposal.createProp: DAO contract does not have enough amount of the token.');
        TokenWithdrawProposal memory newProp = TokenWithdrawProposal(token_, amount_, msg.sender, block.timestamp);
        propList.push(newProp);
        uint propId = propList.length - 1;
        daoContract.approve(address(this), amount_);
        tokenContract.transferFrom(address(daoContract), address(this), amount_);
        emit CreatedProposal(propId, token_, amount_, msg.sender, block.timestamp);
    }
}