// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import './CreateToken.sol';

contract Factory {
    event TokenCreated(string name, string symbol, uint256 total, address newToken);
    function createToken(
        string memory name_,
        string memory symbol_,
        uint256 total_
    ) external returns(address token) {
        bytes memory bytecode = type(CreateToken).creationCode;
        bytes32 salt = keccak256(abi.encodePacked(name_, symbol_, total_));
        assembly {
            token := create2(0, add(bytecode, 32), mload(bytecode), salt)
        }
        emit TokenCreated(name_, symbol_, total_, token);
    }
}