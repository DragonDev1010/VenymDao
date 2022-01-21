// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import './Factory.sol';
import './Interface/IFactory.sol';
contract CreateTokenProposal {
    IFactory factory;
    constructor (address factory_) {
        factory = IFactory(factory_);
    }
    struct Token {
        string tokenName;
        string tokenSymbol;
        uint256 tokenTotal;
        address creator;
        uint256 created;
    }
    Token[] tokenList;
    mapping(uint256 => bool) public tokenCreated;
    mapping(uint256 => mapping(address => bool)) public voters;
    mapping(uint256 => uint256) public voteUp;
    mapping(uint256 => uint256) public voteDown;
    address[] public createdTokenAddrList;
    event CreatedProposal(string name_, string symbol_, uint256 total_, address creator_, uint256 created_);
    function createProp(string memory name_, string memory symbol_, uint256 total_) public returns(uint256 prop_id){
        Token memory newToken = Token(name_, symbol_, total_, msg.sender, block.timestamp);
        tokenList.push(newToken);
        prop_id = tokenList.length;
        emit CreatedProposal(name_, symbol_, total_, msg.sender, block.timestamp);
    }
    function vote(uint256 prop_id, bool voting) public returns(bool) {
        require(msg.sender != tokenList[prop_id].creator, 'Proposal creator can not vote');
        require(voters[prop_id][msg.sender] == false, 'Nobody can vote again');
        voters[prop_id][msg.sender] = true;
        if(voting) {
            voteUp[prop_id]++;
        } else {
            voteDown[prop_id]++;
        }
        return true;
    }
    function execute(uint256 prop_id) public returns(address createdTokenAddr) {
        require(voteUp[prop_id] > voteDown[prop_id], "VoteUp has to be greater than 50% of the total voters.");
        require(tokenCreated[prop_id] != true, 'The proposal has already executed');
        uint256 duration = (block.timestamp - tokenList[prop_id].created) / 60 / 60 / 24;
        // require( duration > 7, 'The duration of proposal is 7 days');
        createdTokenAddr = factory.createToken(tokenList[prop_id].tokenName, tokenList[prop_id].tokenSymbol, tokenList[prop_id].tokenTotal);
        createdTokenAddrList.push(createdTokenAddr);
        tokenCreated[prop_id] = true;
    }
}