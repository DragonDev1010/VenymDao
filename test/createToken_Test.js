require('chai')
    .use(require('chai-as-promised'))
    .should()

const {assert} = require('chai')

const Factory = artifacts.require('./CreateToken/Factory.sol')
const CreateTokenProposal = artifacts.require('./CreateToken/CreateTokenProposal.sol')

contract('create token contract', (accounts) => {
    let factory, createTokenProposal
    let res
    before(async() => {
        factory = await Factory.deployed()
        createTokenProposal = await CreateTokenProposal.deployed()
    })
    it('Test Factory contract', async() => {
        res = await factory.createToken("fac one", "facone", 10000)
        console.log(res.logs[0].args)
    })
    it('Test CreateTokenProposal contract', async() => {
        console.log(createTokenProposal.address)
        res = await createTokenProposal.createProp("a", "abc", 100, {from: accounts[0]})
        // console.log(res.logs[0].args)
        // console.log('accounts one: ', accounts[0])

        await createTokenProposal.vote(0, true, {from: accounts[5]})
        await createTokenProposal.vote(0, true, {from: accounts[1]})
        await createTokenProposal.vote(0, true, {from: accounts[2]})
        await createTokenProposal.vote(0, false, {from: accounts[3]})
        await createTokenProposal.vote(0, false, {from: accounts[4]})

        // res = await createTokenProposal.voteUp(0)
        // console.log(res.toString())
        
        // res = await createTokenProposal.voteDown(0)
        // console.log(res.toString())

        res = await createTokenProposal.execute(0)
        // console.log(res.logs[0].args[0])
        // res = await createTokenProposal.createdTokenAddrList(0)
        // console.log('newly created token address: ', res)
    })
})