// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

interface IFactory {
    function createToken(
        string memory name_,
        string memory symbol_,
        uint256 total_
    ) external returns(address token);
}