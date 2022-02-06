// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import '../Dao.sol';
import '../GovernanceToken/IVNMToken.sol';
import '@openzeppelin/contracts/utils/math/SafeMath.sol';

contract BurnTokenProposal {
    using SafeMath for uint256;
    IVNMToken vnmToken;
    Dao daoContract;
    address constant burnAddr = 0x000000000000000000000000000000000000dEaD;
    struct TokenBurnProposal {
        uint256 amount;
        address creator;
        uint256 created;
    }
    TokenBurnProposal[] public propList;
    mapping(uint256 => bool) public propExecuted; // propExecuted[propId] = true/false
    mapping(uint256 => mapping(address => bool)) public voters; // voters[propId][msg.sender] = true/false
    mapping(uint256 => uint256) private approveAmount; // approveAmount[propId] = 100
    mapping(uint256 => uint256) private denyAmount; // denyAmount[propId] = 100

    mapping(uint256 => address[]) private approveList; // approveList[propId] = [0x0, 0x1, 0x2]
    mapping(uint256 => address[]) private denyList; // denyList[propId] = [0x3, 0x4, 0x5]

    event CreatedProposal (uint256 propId, uint256 burnAmount, address creator, uint256 created);

    constructor(address vnmTokenAddr, address daoAddr) {
        daoContract = Dao(daoAddr);
        vnmToken = IVNMToken(vnmTokenAddr);
    }
    function createProp(uint256 burnAmount) public {
        require(burnAmount > 0, 'Create TokenBurn Proposal: Burn token amount has to be greater than zero.');
        require(vnmToken.balanceOf(address(daoContract)) >= burnAmount, 'BurnToken.createProp: DAO contract has $VNM less than burn amount.');
        TokenBurnProposal memory newProp = TokenBurnProposal(burnAmount, msg.sender, block.timestamp);
        propList.push(newProp);
        uint256 propId = propList.length - 1;
        daoContract.approve(address(this), burnAmount);
        vnmToken.transferFrom(address(daoContract), address(this), burnAmount);
        emit CreatedProposal(propId, burnAmount, msg.sender, block.timestamp);
    }

    function vote(uint256 prop_id, bool voting) public {
        require(prop_id < propList.length, 'Proposal Id is greater than Porposal list size. The asking Proposal Id seems not to exist.');
        require(propExecuted[prop_id] == false, 'The asking proposal has already executed. The voting period was ended.');
        require(msg.sender != propList[prop_id].creator, 'Proposal creator can not vote');
        require(voters[prop_id][msg.sender] == false, 'Nobody can vote again');
        require(vnmToken.allowance(msg.sender, address(this)) == daoContract.voteFee(), 'Voter has not allow voting fee.');
        vnmToken.transferFrom(msg.sender, address(daoContract), daoContract.voteFee());
        voters[prop_id][msg.sender] = true;
        if(voting) {
            approveAmount[prop_id]++;
            approveList[prop_id].push(msg.sender);
        } else {
            denyAmount[prop_id]++;
            denyList[prop_id].push(msg.sender);
        }
    }
    function execute(uint256 prop_id) public {
        require(prop_id < propList.length, 'Proposal Id is greater than Porposal list size. The asking Proposal Id seems not to exist.');
        require(propExecuted[prop_id] != true, 'The proposal has already executed');
        uint256 duration = (block.timestamp - propList[prop_id].created) / 60 / 60 / 24;
        // require( duration > 7, 'The duration of proposal is 7 days');
        daoContract.approve(address(this), (daoContract.voteFee().mul(approveAmount[prop_id].add(denyAmount[prop_id])).mul(99).div(100)));
        if(approveAmount[prop_id] > denyAmount[prop_id]) {
            vnmToken.burn(address(this), propList[prop_id].amount.mul(99).div(100));            
            uint256 prize = (daoContract.voteFee().mul(approveAmount[prop_id].add(denyAmount[prop_id])).mul(99).div(100)).div(approveAmount[prop_id]);
            for (uint i = 0 ; i < approveAmount[prop_id] ; i++) {
                vnmToken.transferFrom(address(daoContract), approveList[prop_id][i], prize);
            }
        } else {
            vnmToken.transfer(address(daoContract), propList[prop_id].amount.mul(99).div(100));
            uint256 prize = (daoContract.voteFee().mul(approveAmount[prop_id].add(denyAmount[prop_id])).mul(99).div(100)).div(denyAmount[prop_id]);
            for (uint i = 0 ; i < denyAmount[prop_id] ; i++) {
                vnmToken.transferFrom(address(daoContract), denyList[prop_id][i], prize);
            }
        }
        propExecuted[prop_id] = true;
    }
    function showVotersList(uint256 prop_id) public view returns(uint256, address [] memory, uint256, address[] memory){
        require(prop_id < propList.length, 'Proposal Id is greater than Porposal list size. The asking Proposal Id seems not to exist.');
        // require(propExecuted[prop_id] == true, 'In progress proposals can not show voters list.');
        return(
            approveAmount[prop_id],
            approveList[prop_id],
            denyAmount[prop_id],
            denyList[prop_id]
        );
    }
}