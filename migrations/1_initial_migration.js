const Dao = artifacts.require('Dao')
const VNMToken = artifacts.require('VNMToken')

const Factory = artifacts.require("Factory")
const CreateTokenProposal = artifacts.require("CreateTokenProposal")

module.exports = async function (deployer) {
	await deployer.deploy(VNMToken, "VenymDAO", "VNM")
	await deployer.deploy(Dao, VNMToken.address)

	await deployer.deploy(Factory)
	await deployer.deploy(CreateTokenProposal, Factory.address, VNMToken.address, Dao.address)
};
