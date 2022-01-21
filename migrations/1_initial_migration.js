const CreateToken = artifacts.require("CreateToken");
const Factory = artifacts.require("Factory")
const CreateTokenProposal = artifacts.require("CreateTokenProposal")

const BurnToken = artifacts.require('BurnToken')

module.exports = async function (deployer) {
	await deployer.deploy(CreateToken, "test", "TTT", 100000)
	await deployer.deploy(Factory)
	await deployer.deploy(CreateTokenProposal, Factory.address)

	await deployer.deploy(BurnToken)
};
