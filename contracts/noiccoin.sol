// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.5.16;

contract NoicCoin{
    string public name = "NOIC COIN";
    string public symbol = "NOIC";
    string public standard = "NOIC COIN v1.0";

    uint256 public totalSupply;

    mapping(address => uint256) public balanceOf;
    
    constructor(uint256 _initialSupply) public{
        totalSupply = _initialSupply;
        // allocate initial supply to admin account
        balanceOf[msg.sender] = totalSupply;
    }

    //TRANSFERS
    event Transfer(
        address indexed _from,
        address indexed _to,
        uint256 _value
    );

    function transfer(address _to, uint256 _value) public returns (bool success){
        require(balanceOf[msg.sender] >= _value, "Transfer reverted, Insufficient balance");
        balanceOf[msg.sender] -= _value;
        balanceOf[_to] += _value;
        emit Transfer(msg.sender, _to, _value);
        return true;
    }

    //DELEGATED TRANSFERS
    mapping(address => mapping(address => uint256)) public allowance;


    event Approval(
        address indexed _owner,
        address indexed _spender,
        uint256 _value
    );

    function approve(address _spender, uint256 _value) public returns (bool success){
        allowance[msg.sender][_spender] += _value;
        
        emit Approval(msg.sender, _spender, _value);
        return true;
    }

    function transferFrom(address _from, address _to, uint256 _value) public returns (bool success){
        require(allowance[_from][msg.sender] >= _value, 'Transfer reverted, Insufficient allowance');

        require(balanceOf[_from] >= _value, "Transfer reverted, Insufficient balance");
        balanceOf[_from] -= _value;
        balanceOf[_to] += _value;
        emit Transfer(_from, _to, _value);

        allowance[_from][msg.sender] -= _value;

        return true;
    }
}