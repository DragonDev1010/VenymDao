// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import './Factory.sol';
import './Interface/IFactory.sol';
contract CreateTokenProposal {
    IFactory factory;
    constructor (address factory_) {
        factory = IFactory(factory_);
    }
    struct NewTokenProposal {
        string tokenName;
        string tokenSymbol;
        uint256 tokenTotal;
        address creator;
        uint256 created;
    }
    NewTokenProposal[] public propList;
    mapping(uint256 => bool) public propExecuted; // propExecuted[propId] = true/false
    mapping(uint256 => mapping(address => bool)) public voters; // voters[propId][msg.sender] = true/false
    mapping(uint256 => uint256) private approveAmount; // approveAmount[propId] = 100
    mapping(uint256 => uint256) private denyAmount; // denyAmount[propId] = 100

    mapping(uint256 => address[]) private approveList; // approveList[propId] = [0x0, 0x1, 0x2]
    mapping(uint256 => address[]) private denyList; // denyList[propId] = [0x3, 0x4, 0x5]
    address[] public createdTokenAddrList;

    event CreatedProposal(uint256 propId, string name_, string symbol_, uint256 total_, address creator_, uint256 created_);

    function createProp(string memory name_, string memory symbol_, uint256 total_) public{
        NewTokenProposal memory newToken = NewTokenProposal(name_, symbol_, total_, msg.sender, block.timestamp);
        propList.push(newToken);
        uint256 prop_id = propList.length;
        emit CreatedProposal(prop_id, name_, symbol_, total_, msg.sender, block.timestamp);
    }
    function vote(uint256 prop_id, bool voting) public returns(bool) {
        require(msg.sender != propList[prop_id].creator, 'Proposal creator can not vote');
        require(voters[prop_id][msg.sender] == false, 'Nobody can vote again');
        voters[prop_id][msg.sender] = true;
        if(voting) {
            approveAmount[prop_id]++;
            approveList[prop_id].push(msg.sender);
        } else {
            denyAmount[prop_id]++;
            denyList[prop_id].push(msg.sender);
        }
        return true;
    }
    function execute(uint256 prop_id) public returns(address createdTokenAddr) {
        require(propExecuted[prop_id] != true, 'The proposal has already executed');
        uint256 duration = (block.timestamp - propList[prop_id].created) / 60 / 60 / 24;
        // require( duration > 7, 'The duration of proposal is 7 days');
        if(approveAmount[prop_id] > denyAmount[prop_id]) {
            createdTokenAddr = factory.createToken(propList[prop_id].tokenName, propList[prop_id].tokenSymbol, propList[prop_id].tokenTotal);
            createdTokenAddrList.push(createdTokenAddr);

        } else {

        }
            propExecuted[prop_id] = true;
    }
}