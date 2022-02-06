require('chai')
    .use(require('chai-as-promised'))
    .should()

const {assert} = require('chai')

const VNMToken = artifacts.require('./GovernanceToken/VNMToken.sol')
const Dao = artifacts.require('./Dao.sol')

const CreateTokenProposal = artifacts.require('./CreateToken/CreateTokenProposal.sol')

// $VNM Owner : accounts[0]
// Fee Wallet : daoAddr
contract('Main Test', (accounts) => {
    let vnm, dao, createToken, res
    let feeWallet, daoAddr, createTokenAddr
    let voteFee
    let approveAmount, denyAmount
    let approveList, denyList
    before(async() => {
        vnm = await VNMToken.deployed()
        dao = await Dao.deployed()
        createToken = await CreateTokenProposal.deployed()
        daoAddr = Dao.address
        createTokenAddr = CreateTokenProposal.address
    })
    it('Set Fee Wallet Address', async() => {
        res = await vnm.setFeeWallet(daoAddr)
        feeWallet = await vnm.FeeWalletAddr.call()
        assert.equal(feeWallet, daoAddr, 'VNMToken.setFeeWallet: correct')
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
    it('Create Token Proposal', async() => {
        res = await createToken.createProp('Test Token One', 'One', web3.utils.toWei('10000000', 'ether'))
        assert.equal(res.logs[0].args.propId.toString(), 0, 'Emitted event log eventID is equal to zero')
        res = await createToken.propList.call(0)
        assert.equal(res.creator, accounts[0], 'Creator of CreateTokenProposal is accounts[0')
    })
    it('Vote Create Token Proposal', async() => {
        await vnm.approve(createToken.address, voteFee, {from: accounts[1]})
        await createToken.vote(0, true, {from: accounts[1]})
        
        res = await vnm.balanceOf(accounts[1])
        assert.equal(res, web3.utils.toWei('7890', 'Gwei'))

        res = await vnm.balanceOf(feeWallet)
        assert.equal(res, web3.utils.toWei('130', 'Gwei'))

        await vnm.approve(createToken.address, voteFee, {from: accounts[2]})
        await createToken.vote(0, false, {from: accounts[2]})
        
        res = await vnm.balanceOf(accounts[2])
        assert.equal(res, web3.utils.toWei('1970', 'Gwei'))

        res = await vnm.balanceOf(feeWallet)
        assert.equal(res, web3.utils.toWei('140', 'Gwei'))

        await vnm.transfer(accounts[3], web3.utils.toWei('10000', 'Gwei'))
        res = await vnm.balanceOf(accounts[3])
        assert.equal(res, web3.utils.toWei('9900', 'Gwei'))

        res = await vnm.balanceOf(feeWallet)
        assert.equal(res, web3.utils.toWei('240', 'Gwei'))

        await vnm.approve(createToken.address, voteFee, {from: accounts[3]})
        await createToken.vote(0, true, {from: accounts[3]})
        
        res = await vnm.balanceOf(accounts[0])
        assert.equal(res, web3.utils.toWei('99980000', 'Gwei'))
        res = await vnm.balanceOf(accounts[1])
        assert.equal(res, web3.utils.toWei('7890', 'Gwei'))
        res = await vnm.balanceOf(accounts[2])
        assert.equal(res, web3.utils.toWei('1970', 'Gwei'))
        res = await vnm.balanceOf(accounts[3])
        assert.equal(res, web3.utils.toWei('9890', 'Gwei'))
        res = await vnm.balanceOf(feeWallet)
        assert.equal(res, web3.utils.toWei('250', 'Gwei'))
        res = await vnm.balanceOf(daoAddr)
        assert.equal(res, web3.utils.toWei('250', 'Gwei'))
    })
    it('Show voters list', async() => {
        res = await createToken.showVotersList(0)
        approveAmount = res[0]
        denyAmount = res[2]
        assert.equal(approveAmount, 2, 'Approve Voter amount is 1')
        assert.equal(res[1][0], accounts[1], 'Approve Voter Address list is accounts[1]')
        assert.equal(denyAmount, 1, 'Deny Voter amount is 1')
        assert.equal(res[3][0], accounts[2], 'Deny Voter Address list is accounts[2]')
    })
    it('Execute proposal', async() => {
        let totalVoteFee = voteFee * (parseInt(approveAmount) + parseInt(denyAmount))

        await dao.approve(createTokenAddr, totalVoteFee)
        res = await vnm.allowance(daoAddr, createTokenAddr)
        assert.equal(res, totalVoteFee, 'DAO wallet approves total fee balance $VNM to createTokenProposal wallet.')
        await createToken.execute(0)

        res = await createToken.propExecuted.call(0)
        assert.equal(res, true, 'After executing proposal, it is set as executed.')

        res = await vnm.balanceOf(accounts[1])
        assert.equal(res, web3.utils.toWei('7904.7015', 'Gwei'))
        res = await vnm.balanceOf(accounts[3])
        assert.equal(res, web3.utils.toWei('9904.7015', 'Gwei'))

        res = await createToken.createdTokenAddrList.call(0)
        console.log(res)
    })
})