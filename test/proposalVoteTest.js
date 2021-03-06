var DacToken = artifacts.require("./DacToken.sol");
var AlwaysTransfer = artifacts.require("./AlwaysTransfer.sol");
var DacHub = artifacts.require("./DacHub.sol");
var ProposalVote = artifacts.require("./ProposalVote.sol");

var mineBlock = require('./miner.js').mineBlock;

contract('ProposalVote', function(accounts) {    

    // Validate getting and setting values
    it("should track voting yes", () => {       
        let proposalContract = null;
        let alwaysTransferContract = null;
        let hubContract = null;
        let tokenContract = null;

        let startBlock = web3.eth.blockNumber;
        let endBlock = startBlock + 10;

        // Start by deploying the token
        return AlwaysTransfer.new()
        .then((alwaysTransfer) => {
            alwaysTransferContract = alwaysTransfer;

            return DacHub.deployed();
        }).then((instance) => {
            hubContract = instance;

            return hubContract.updatePlatformContract('DAC_TRANSFER_REGULATOR', alwaysTransferContract.address, {from: accounts[0]});        
        }).then((result) => {
            return DacToken.deployed();
        }).then((instance) => {
            // Save off the token contract instance
            tokenContract = instance;            

            // Create the new proposal that will end voting in 100 blocks and requires at least 50 votes
            return ProposalVote.new(tokenContract.address, endBlock, 50);
        }).then((instance) => {
            // Save off the vending machine contract
            proposalContract = instance;

            // vote yes with all the tokens in account 0
            return proposalContract.CastVote(true);
        }).then((result) => {

            // Make the block increment
            return mineBlock(endBlock + 1);
        }).then((blockNum) => {
            return proposalContract.GetOutcome.call()                    
        }).then((result) => {
            assert.equal(result.valueOf(), true, "Vote should be true");
        }) 
    })
})