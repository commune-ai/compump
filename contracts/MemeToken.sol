// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Initializable} from './library/Initializable.sol';

import {ERC20Upgradeable} from './library/ERC20Upgradeable.sol';

import {OwnableUpgradeable} from './library/OwnableUpgradeable.sol';

contract MemeToken is Initializable, ERC20Upgradeable, OwnableUpgradeable {
    // /// @custom:oz-upgrades-unsafe-allow constructor
    // constructor() {
    //     _disableInitializers();
    // }

    function initialize(address _module, address _creator, string memory name_,
        string memory symbol_) initializer public {
        __ERC20_init(name_, symbol_);

        _mint(_module, 400_000_000 * 10 ** decimals());
        _mint(_creator, 600_000_000 * 10 ** decimals());
    }

    // function mint(address to, uint256 amount) public onlyOwner {
    //     _mint(to, amount);
    // }
}