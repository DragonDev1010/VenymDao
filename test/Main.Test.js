require('chai')
    .use(require('chai-as-promised'))
    .should()

const {assert} = require('chai')

const VNMToken = artifacts.require('./GovernanceToken/VNMToken.sol')

// $VNM Owner : accounts[0]
// Fee Wallet : accounts[9]
contract('Main Test', (accounts) => {
    let vnm, res
    let feeWallet
    before(async() => {
        console.log(accounts)
        vnm = await VNMToken.deployed()
    })
    it('Set Fee Wallet Address', async() => {
        res = await vnm.setFeeWallet(accounts[9])
        feeWallet = await vnm.FeeWalletAddr.call()
        assert.equal(feeWallet, accounts[9], 'VNMToken.setFeeWallet: correct')
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