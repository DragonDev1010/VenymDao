// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import '../Dao.sol';
import '@openzeppelin/contracts/utils/math/SafeMath.sol';
import '@openzeppelin/contracts/token/ERC20/IERC20.sol';

contract WithdrawTokenProposal {
    Dao daoContract;
    IERC20 tokenContract;
    IERC20 vnmToken;
    address public daoAddress;

    struct TokenWithdrawProposal {
        address tokenAddr;
        uint256 tokenAmount;
        address creator;
        uint256 created;
    }

    TokenWithdrawProposal[] public propList;
    mapping(uint256 => bool) public propExecuted; // propExecuted[propId] = true/false
    mapping(uint256 => mapping(address => bool)) public voters; // voters[propId][msg.sender] = true/false
    mapping(uint256 => uint256) private approveAmount; // approveAmount[propId] = 100
    mapping(uint256 => uint256) private denyAmount; // denyAmount[propId] = 100

    mapping(uint256 => address[]) private approveList; // approveList[propId] = [0x0, 0x1, 0x2]
    mapping(uint256 => address[]) private denyList; // denyList[propId] = [0x3, 0x4, 0x5]

    event CreatedProposal(uint256 propId, address tokenAddr, uint256 amount_, address creator, uint256 created);

    constructor(address vnmTokenAddr, address daoAddr_) {
        daoContract = Dao(daoAddr_);
        daoAddress = daoAddr_;
        vnmToken = IERC20(vnmTokenAddr);
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