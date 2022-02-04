// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import '@openzeppelin/contracts/token/ERC20/IERC20.sol';
contract BurnToken {
    address burnAddr = 0x000000000000000000000000000000000000dEaD;
    struct BurnProposal {
        address token_;
        uint256 amount_;
        address creator;
        uint256 created;
    }
    BurnProposal[] public propList;
    mapping(uint256 => bool) propExecuted;
    mapping(address => bool) voters;
    mapping(uint256 => uint256) voteUp;
    mapping(uint256 => uint256) voteDown;

    event CreatedProposal (address token, uint256 amount, address creator, address created);

    function createProp(address token, uint256 amount) public returns(uint256 prop_id) {
        require(token != address(0), 'Token address can not be zero');
        uint256 bal = IERC20(token).balanceOf(0x453B8D46D3D41d3B3DdC09B20AE53aa1B6aB186E);
        require(amount < bal, 'Burning token amount must be less than balance of token.');
        BurnProposal memory newProp = BurnProposal(token, amount, msg.sender, block.timestamp);
        propList.push(newProp);
        prop_id = propList.length;
    }
    function vote(uint256 prop_id, bool voting) public returns(bool) {
        require(msg.sender != propList[prop_id].creator, 'Proposal creator can not vote');
        require(voters[msg.sender] == false, 'Nobody can vote again');
        voters[msg.sender] = true;
        if(voting) {
            voteUp[prop_id]++;
        } else {
            voteDown[prop_id]++;
        }
        return true;
    }
    function execute(uint256 prop_id) public returns (bool) {
        require(voteUp[prop_id] > voteDown[prop_id], "VoteUp has to be greater than 50% of the total voters.");
        require(propExecuted[prop_id] != true, 'The proposal has already executed');
        uint256 duration = (block.timestamp - propList[prop_id].created) / 60 / 60 / 24;
        // require( duration > 7, 'The duration of proposal is 7 days');
        address tokenAddr = propList[prop_id].token_;
        IERC20(tokenAddr).transfer(burnAddr, propList[prop_id].amount_);
        propExecuted[prop_id] = true;
        return true;
    }
}