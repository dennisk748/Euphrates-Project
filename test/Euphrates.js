var Euphrates = artifacts.require("Euphrates");

contract("Euphrates" , function(accounts){
    var tokenInstance;
    it('initializes the correct values for the token', function(){
        return Euphrates.deployed().then(function(instance){
            tokenInstance = instance;
            return tokenInstance.name();
        }).then(function(name){
            assert.equal(name, "Euphrate's", 'sets the name of the token');
            return tokenInstance.symbol();
        }).then(function(symbol){
            assert.equal(symbol,"EUPHY'S",'set the tokens symbol');
            return tokenInstance.standard();
        }).then(function(standard){
            assert.equal(standard,"Euphrate's v1.0", 'to set the standard of the token');
        });        
    })

    it('sets the total number of tokens upon deployment and gives them to admin', function(){
        return Euphrates.deployed().then(function(instance){
            tokenInstance  = instance;
            return tokenInstance.totalSupply();
        }).then(function(totalSupply){
            assert.equal(totalSupply.toNumber(),10000000,'sets the total supply to 10,000,000');
            return tokenInstance.balanceOf(accounts[0]);
        }).then(function(adminBalance){
            assert.equal(adminBalance.toNumber(), 10000000,'ensures the admin has the total number of tokens');
        });
    });

    it('transfer tokens from one account to another', function(){
        return Euphrates.deployed().then(function(instance){
            tokenInstance = instance;
            return tokenInstance.transfer.call(accounts[1], 9999999999);
        }).then(assert.fail).catch(function(error){
            assert(error.message.indexOf('revert') >= 0 , 'error message must contain revert');
            return tokenInstance.transfer.call(accounts[1],2500000, {from: accounts[0]});
        }).then(function(success){
            assert.equal(success, true, 'returned value of the transfer process to be true');
            return tokenInstance.transfer(accounts[1],2500000,{ from: accounts[0]});
        }).then(function(receipt){
            assert.equal(receipt.logs.length, 1, 'triggers one event');
            assert.equal(receipt.logs[0].event, 'Transfer', 'should be the Transfer event');
            assert.equal(receipt.logs[0].args._from, accounts[0], 'logs the account the tokens are transfered from');
            assert.equal(receipt.logs[0].args._to, accounts[1], 'logs the account the tokens are transfered to');
            assert.equal(receipt.logs[0].args._value, '2500000', 'amount of tokens transfered');
            return tokenInstance.balanceOf(accounts[1]);
        }).then(function(balance){
            assert.equal(balance,'2500000', 'adding to the receiving account');
            return tokenInstance.balanceOf(accounts[0]);
        }).then(function(balance){
            assert.equal(balance,'7500000','deducts from the sending account');
        });
    });

    it('approves tokens for delegated transfer', function(){
        return Euphrates.deployed().then(function(instance){
            tokenInstance = instance;
            return tokenInstance.approve.call(accounts[1], 2000);
        }).then(function(success){
            assert.equal(success, true, 'it returns true');
            return tokenInstance.approve(accounts[1],2000, {from : accounts[0]});
        }).then(function(receipt){
            assert.equal(receipt.logs.length, 1, 'triggers one event');
            assert.equal(receipt.logs[0].event, 'Approval', 'should be the Approval event');
            assert.equal(receipt.logs[0].args._owner, accounts[0], 'logs the account the tokens are authorized from');
            assert.equal(receipt.logs[0].args._spender, accounts[1], 'logs the account the tokens are authorized to');
            assert.equal(receipt.logs[0].args._value, '2000', 'amount of tokens transfered');
            return tokenInstance.allowance(accounts[0], accounts[1]);
        }).then(function(allowance){
            assert.equal(allowance.toNumber(),2000,'stores the allowance for delegated transfer');
        });
    });

    it('transfer tokens from an approved account', function(){
        return Euphrates.deployed().then(function(instance){
            tokenInstance = instance;
            fromAccount = accounts[2];
            toAccount = accounts[3];
            spendingAccount = accounts[4];
            //Transfer some tokens to fromAccount
            return tokenInstance.transfer(fromAccount,100, {from: accounts[0] });
        }).then(function(receipt){
            //Approve spendingAccount to spend 10 tokens from fromAccount
            return tokenInstance.approve(spendingAccount,10, {from: fromAccount});
        }).then(function(receipt){
            //try transfering something than the senders balance
            return tokenInstance.transferFrom(fromAccount, toAccount, 9999, {from: spendingAccount});
        }).then(assert.fail).catch(function(error){
            assert(error.message.indexOf('revert') >= 0, 'cannot transfer value larger than balance');
            //try transfering something than the approved amount
            return tokenInstance.transferFrom(fromAccount, toAccount, 20, {from : spendingAccount});
        }).then(assert.fail).catch(function(error){
            assert(error.message.indexOf('revert') >= 0, 'cannot transfer value larger than approved amount');
            return tokenInstance.transferFrom(fromAccount, toAccount, 10, {from:spendingAccount});
        }).then(function(receipt){
            assert.equal(receipt.logs.length, 1, 'triggers one event');
            assert.equal(receipt.logs[0].event, 'Transfer', 'should be the Transfer event');
            assert.equal(receipt.logs[0].args._from, fromAccount, 'logs the account the tokens are transfered from');
            assert.equal(receipt.logs[0].args._to, toAccount, 'logs the account the tokens are transfered to');
            assert.equal(receipt.logs[0].args._value, '10', 'amount of tokens transfered');
            return tokenInstance.balanceOf(fromAccount);
        }).then(function(balance){
            assert.equal(balance.toNumber(), 90, 'deducts the amount from the sending account');
            return tokenInstance.balanceOf(toAccount);
        }).then(function(balance){
            assert.equal(balance.toNumber(), 10, 'adds the amount from the receiving account');
            return tokenInstance.allowance(fromAccount, spendingAccount);
        }).then(function(allowance){
            assert.equal(allowance, 0, 'deducts the amount from the allowance')
        });
    });        
});
