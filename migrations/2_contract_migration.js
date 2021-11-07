const Euphrates = artifacts.require("Euphrates");

module.exports = function (deployer) {
  deployer.deploy(Euphrates, 10000000);
};
