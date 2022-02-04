const Dao = artifacts.require('Dao')
const VNMToken = artifacts.require('VNMToken')
module.exports = async function (deployer) {
	await deployer.deploy(Dao)
	await deployer.deploy(VNMToken, "VenymDAO", "VNM")
};
