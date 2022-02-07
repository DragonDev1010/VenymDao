require('chai')
    .use(require('chai-as-promised'))
    .should()

const {assert} = require('chai')

const VNMToken = artifacts.require('./GovernanceToken/VNMToken.sol')
const Dao = artifacts.require('./Dao.sol')

const withdrawTokenProposal = artifacts.require('./Withdraw/WithdrawTokenProposal.sol')

// $VNM Owner : accounts[0]
// Fee Wallet : daoAddr
contract('Main Test', (accounts) => {
    let vnm, dao, proposal, res
    let feeWallet, daoAddr, proposalAddr, vnmAddr
    let voteFee
    let approveAmount, denyAmount
    let approveList, denyList
    before(async() => {
        vnm = await VNMToken.deployed()
        dao = await Dao.deployed()
        proposal = await withdrawTokenProposal.deployed()
        daoAddr = Dao.address
        proposalAddr = withdrawTokenProposal.address
        vnmAddr = vnm.address
    })
    it('Set Fee Wallet Address', async() => {
        res = await vnm.setFeeWallet(daoAddr)
        feeWallet = await vnm.FeeWalletAddr.call()
        assert.equal(feeWallet, daoAddr, 'VNMToken.setFeeWallet: correct')
    })
    it('Set proposal contract address in DAO contract', async() => {
        await dao.setProposalAddress(proposalAddr)
    })
    it('Transfer $VNM', async() => {
        await vnm.transfer(accounts[1], web3.utils.toWei('10000', 'Gwei'))
        res = await vnm.balanceOf(accounts[1])
        assert.equal(res, web3.utils.toWei('9900', 'Gwei'))

        res = await vnm.balanceOf(feeWallet)
        assert.equal(res, web3.utils.toWei('100', 'Gwei'))
    })
    it('TransferFrom $VNM', async() => {
        await vnm.approve(accounts[0], web3.utils.toWei('2000', 'Gwei'), {from: accounts[1]})
        await vnm.transferFrom(accounts[1], accounts[2], web3.utils.toWei('2000', 'Gwei'))

        res = await vnm.balanceOf(accounts[1])
        assert.equal(res, web3.utils.toWei('7900', 'Gwei'))

        res = await vnm.balanceOf(accounts[2])
        assert.equal(res, web3.utils.toWei('1980', 'Gwei'))

        res = await vnm.balanceOf(feeWallet)
        assert.equal(res, web3.utils.toWei('120', 'Gwei'))
    })
    it('Set voteFee at Dao.sol', async() => {
        await dao.setVoteFee(web3.utils.toWei('10', 'Gwei'))
        voteFee = await dao.voteFee.call()
        assert.equal(voteFee, web3.utils.toWei('10', 'Gwei'), 'VoteFee is correctly set as 10*10**9')
    })
    it('Create new Proposal', async() => {
        res = await proposal.createProp(vnmAddr, web3.utils.toWei('10', 'Gwei'))
        assert.equal(res.logs[0].args.propId.toString(), 0, 'Emitted event log eventID is equal to zero')
        res = await proposal.propList.call(0)
        assert.equal(res.creator, accounts[0], 'Creator of withdrawTokenProposal is accounts[0')

        res = await vnm.balanceOf(feeWallet)
        assert.equal(res, web3.utils.toWei('110.1', 'Gwei'))

        res = await vnm.balanceOf(proposalAddr)
        assert.equal(res, web3.utils.toWei('9.9', 'Gwei'))
    })
    it('Vote Token Withdraw Proposal', async() => {
        // await vnm.approve(proposal.address, voteFee, {from: accounts[1]})
        // await proposal.vote(0, true, {from: accounts[1]})
        
        // res = await vnm.balanceOf(accounts[1])
        // assert.equal(res, web3.utils.toWei('7890', 'Gwei'))

        // res = await vnm.balanceOf(feeWallet)
        // assert.equal(res, web3.utils.toWei('120.1', 'Gwei'))

        // await vnm.approve(proposal.address, voteFee, {from: accounts[2]})
        // await proposal.vote(0, false, {from: accounts[2]})
        
        // res = await vnm.balanceOf(accounts[2])
        // assert.equal(res, web3.utils.toWei('1970', 'Gwei'))

        // res = await vnm.balanceOf(feeWallet)
        // assert.equal(res, web3.utils.toWei('130.1', 'Gwei'))

        // await vnm.transfer(accounts[3], web3.utils.toWei('10000', 'Gwei'))
        // res = await vnm.balanceOf(accounts[3])
        // assert.equal(res, web3.utils.toWei('9900', 'Gwei'))

        // res = await vnm.balanceOf(feeWallet)
        // assert.equal(res, web3.utils.toWei('230.1', 'Gwei'))

        // await vnm.approve(proposal.address, voteFee, {from: accounts[3]})
        // await proposal.vote(0, true, {from: accounts[3]})
        
        // res = await vnm.balanceOf(accounts[0])
        // assert.equal(res, web3.utils.toWei('99980000', 'Gwei'))
        // res = await vnm.balanceOf(accounts[1])
        // assert.equal(res, web3.utils.toWei('7890', 'Gwei'))
        // res = await vnm.balanceOf(accounts[2])
        // assert.equal(res, web3.utils.toWei('1970', 'Gwei'))
        // res = await vnm.balanceOf(accounts[3])
        // assert.equal(res, web3.utils.toWei('9890', 'Gwei'))
        // res = await vnm.balanceOf(feeWallet)
        // assert.equal(res, web3.utils.toWei('240.1', 'Gwei'))
    })
    it('Show voters list', async() => {
        // res = await proposal.showVotersList(0)
        // approveAmount = res[0]
        // denyAmount = res[2]
        // assert.equal(approveAmount, 2, 'Approve Voter amount is 1')
        // assert.equal(res[1][0], accounts[1], 'Approve Voter Address list is accounts[1]')
        // assert.equal(denyAmount, 1, 'Deny Voter amount is 1')
        // assert.equal(res[3][0], accounts[2], 'Deny Voter Address list is accounts[2]')
    })
    it('Execute proposal', async() => {
        // await proposal.execute(0)

        // res = await proposal.propExecuted.call(0)
        // assert.equal(res, true, 'After executing proposal, it is set as executed.')

        // res = await vnm.balanceOf(accounts[1])
        // assert.equal(res, web3.utils.toWei('7904.7015', 'Gwei'))
        // res = await vnm.balanceOf(accounts[3])
        // assert.equal(res, web3.utils.toWei('9904.7015', 'Gwei'))

        // res = await vnm.totalSupply()
        // assert.equal(res, web3.utils.toWei('99999990.1', 'Gwei'), '$VNM total supply is decrease by burned amount')

        // res = await vnm.balanceOf(proposalAddr)
        // assert.equal(res, 0, 'From burn proposal contract, burn amount is burned')
    })
})