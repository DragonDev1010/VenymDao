const Migrations = artifacts.require("Migrations");
const CreateToken = artifacts.require("CreateToken");
const Factory = artifacts.require("Factory")
module.exports = function (deployer) {
  	deployer.deploy(Migrations);
	deployer.deploy(CreateToken, "test", "TTT", 100000)
	deployer.deploy(Factory)
};
