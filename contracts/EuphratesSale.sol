pragma solidity >=0.4.2 <0.9.0;
import 'Euphrates';

contract EuphratesSale {
    address admin;
    Euphrates public tokenContract;
    uint256 public tokenPrice;
    uint256 public tokenSold;

    event Sell(
        address _buyer, 
        uint256 _amount
    );

    constructor(Euphrates _tokenContract, uint256 _tokenPrice) public {
        //Assign an Admin
        admin = msg.sender;
        //Token contract
        tokenContract = _tokenContract;
        //Set the Token Price
        tokenPrice = _tokenPrice;
    }    

    //Multiply

    function multiply(uint x, uint y) internal pure returns(uint z) {

        require (y == 0 || (z = x * y)/y == x);

    }

    //Buy tokens
    function buyTokens(uint256 _numberOfTokens) public payable {
        //Value is equal to token Price

        require(msg.value == multiply(_numberOfTokens , tokenPrice));

        //Require that contract has the enough toekns

        require(tokenContract.balanceOf(this) >= _numberOfTokens);

        //Require that a transfer is successful
        require(tokenContract.transfer(msg.sender, _numberOfTokens));
        //Keep track of tokenSold
        tokenSold += _numberOfTokens;
        //Trigger sell event
        Sell(msg.sender, _numberOfTokens); 
    }

    //End token sale 

    function endSale() public {
        //only Admin can end the sale
        require(msg.sender == admin);       
        // Transfer remaining tokens back to admin
        require(tokenContract.transfer(admin, tokenContract.balanceOf(this))); 
        admin.transfer(address(this).balance);

    }

}