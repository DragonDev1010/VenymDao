require('chai')
    .use(require('chai-as-promised'))
    .should()

const {assert} = require('chai')

const VNMToken = artifacts.require('./GovernanceToken/VNMToken.sol')
const Dao = artifacts.require('./Dao.sol')

// $VNM Owner : accounts[0]
// Fee Wallet : daoAddr
contract('Main Test', (accounts) => {
    let vnm, dao, res
    let feeWallet, daoAddr
    before(async() => {
        vnm = await VNMToken.deployed()
        dao = await Dao.deployed()
        daoAddr = Dao.address
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
})