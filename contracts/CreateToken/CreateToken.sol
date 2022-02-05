// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
contract CreateToken is ERC20 {
    constructor(string memory name_, string memory symbol_, uint256 total_) ERC20(name_, symbol_){
        _mint(msg.sender, total_);
    }
}
