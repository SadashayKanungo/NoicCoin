pragma solidity ^0.5.16;
import "./noiccoin.sol";

contract NoicSale{
    address payable admin;
    NoicCoin public tokenContract;
    uint256 public tokenPrice;
    uint256 public tokensSold;

    constructor(NoicCoin _tokenContract, uint256 _tokenPrice) public {
        admin = msg.sender;
        tokenContract = _tokenContract;
        tokenPrice = _tokenPrice;
    }

    event Sale(
        address buyer,
        uint256 amount
    );
    function multiply(uint256 x, uint256 y) internal pure returns(uint256 z){
        require(y==0 || (z=x*y)/y==x);
    }
    function buyTokens(uint256 _numberOfTokens) public payable {
        require(msg.value == (multiply(_numberOfTokens, tokenPrice)));
        require(tokenContract.balanceOf(address(this)) >= _numberOfTokens);
        require(tokenContract.transfer(msg.sender, _numberOfTokens));
        tokensSold += _numberOfTokens;
        emit Sale(msg.sender, _numberOfTokens);
    }

    function endSale() public {
        require(msg.sender == admin);
        require(tokenContract.transfer(admin, tokenContract.balanceOf(address(this))));
        selfdestruct(admin);
    }
}