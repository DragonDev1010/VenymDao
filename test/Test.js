require('chai')
    .use(require('chai-as-promised'))
    .should()

const {assert} = require('chai')

const CreateToken = artifacts.require('./CreateToken/CreateToken.sol')
const Factory = artifacts.require('./CreateToken/Factory.sol')

contract('create token contract', (accounts) => {
    let createToken, factory
    let res
    before(async() => {
        createToken = await CreateToken.deployed()
        factory = await Factory.deployed()
    })
    it('', async() => {
        res = await createToken.name()
        assert.equal(res, "test", 'correct name')
        res = await createToken.symbol()
        assert.equal(res, "TTT", 'correct symbol')
        res = await createToken.totalSupply()
        console.log(res.toString())
    })
    it('Test Factory contract', async() => {
        res = await factory.createToken("fac one", "facone", 10000)
        console.log(res.logs[0].args)
    })
})