const Euphrates = artifacts.require("Euphrates");
const EuphratesSale = artifacts.require("EuphratesSale");

module.exports = function (deployer) {
  deployer.deploy(Euphrates, 10000000).then(function(){
    // Token price is 0.001 Ether
    var tokenPrice = 1000000000000000; // in wei
    return deployer.deploy(EuphratesSale, Euphrates.address, tokenPrice);
  });
};
