require('chai')
    .use(require('chai-as-promised'))
    .should()

const {assert} = require('chai')

const BurnToken = artifacts.require('./BurnToken/BurnToken.sol')
const CreateToken = artifacts.require('./CreateToken/CreateTokenProposal.sol')
const Factory = artifacts.require('./CreateToken/Factory.sol')

contract('Burn Token Contract', (accounts) => {
    let burnToken, createToken, factory, res
    before(async() => {
        burnToken = await BurnToken.deployed()
        createToken = await CreateToken.deployed()
        factory = await Factory.deployed()
    })
    it('Create Token Proposal', async() => {
        await createToken.createProp("Test One", "One", web3.utils.toWei('50', 'kether'))
        await createToken.createProp("Test Two", "Two", web3.utils.toWei('50', 'kether'))
    })
    it('Create Token Voting', async() => {
        await createToken.vote(0, true, {from: accounts[1]})
        await createToken.vote(0, true, {from: accounts[2]})
        await createToken.vote(0, true, {from: accounts[3]})

        await createToken.vote(1, true, {from: accounts[1]})
        await createToken.vote(1, true, {from: accounts[2]})
        await createToken.vote(1, true, {from: accounts[3]})
    })
    it('Create Token Execute', async() => {
        await createToken.execute(0)
        await createToken.execute(1)
    })
    it('create Burn Token Proposal', async() => {
        let token0, token1
        token0 = await createToken.createdTokenAddrList.call(0)
        token1 = await createToken.createdTokenAddrList.call(1)
        console.log(
            'token 0: ', token0,
            'token 1: ', token1
        )
        await burnToken.createProp(token0, web3.utils.toWei('10', 'ether'))
    })
    it('vote Burn Token Proposal', async() => {
        await burnToken.vote(0, true, {from: accounts[1]})
        await burnToken.vote(0, true, {from: accounts[2]})
        await burnToken.vote(0, true, {from: accounts[3]})
    })
    it('execute Burn Token Proposal', async() => {
        await burnToken.execute(0)
    })
})