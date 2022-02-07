const Dao = artifacts.require('Dao')
const VNMToken = artifacts.require('VNMToken')

const Factory = artifacts.require("Factory")
const CreateTokenProposal = artifacts.require("CreateTokenProposal")
const BurnTokenProposal = artifacts.require("BurnTokenProposal")
const WithdrawTokenProposal = artifacts.require("WithdrawTokenProposal")

module.exports = async function (deployer) {
	await deployer.deploy(VNMToken, "VenymDAO", "VNM")
	await deployer.deploy(Dao, VNMToken.address)

	await deployer.deploy(Factory)
	await deployer.deploy(CreateTokenProposal, Factory.address, VNMToken.address, Dao.address)
	await deployer.deploy(BurnTokenProposal, VNMToken.address, Dao.address)
	await deployer.deploy(WithdrawTokenProposal, VNMToken.address, Dao.address)
};
