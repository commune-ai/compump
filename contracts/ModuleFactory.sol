// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import {OwnableUpgradeable} from './library/OwnableUpgradeable.sol';

import {IERC20Upgradeable} from './library/IERC20Upgradeable.sol';

import {SafeMath} from './library/SafeMath.sol';

import {SafeERC20Upgradeable} from './library/SafeERC20Upgradeable.sol';

import {Clones} from './library/Clones.sol';

interface IModule {
    function initialize(
        address _v3Router,
        address _tokenAddr,
        address _compToken,
        address _creator,
        uint256 _emission, 
        string memory _poolDetails,
        address moduleManager
    ) external;
}

interface IMemeToken {
    function initialize(
        // uint8 _routerVersion,
        address _module,
        address _creator,
        string memory name,
        string memory symbol
    ) external;
}

interface IModuleManager {
    function registerModule(
        address module,
        address token,
        address owner
    ) external;

    function addModuleFactory(address factory) external;

    // function payAmaPartner(
    //     address[] memory _partnerAddress,
    //     address _poolAddress
    // ) external payable;

    function moduleForToken(address token) external view returns (address);

    function isModuleGenerated(address module) external view returns (bool);
}


contract ModuleFactory is OwnableUpgradeable {
    using SafeMath for uint256;
    using SafeERC20Upgradeable for IERC20Upgradeable;
    address public moduleManager;
    using Clones for address;
    uint256 private constant MAX = ~uint256(0);

    address public v3Router;
    address public compToken;
    address public memeTemplate;
    address public moduleTemplate;
    function initialize(
        address _v3Router,
        address _compToken,
        address _moduleManager,
        address _memeTemplate,
        address _moduleTemplate
    ) external initializer {
        __Ownable_init();
        v3Router = _v3Router;
        compToken = _compToken;
        moduleManager = _moduleManager;
        memeTemplate = _memeTemplate;
        moduleTemplate = _moduleTemplate;
    }

    receive() external payable {}

    event moduleCreated(
        address indexed creator,
        address indexed module,
        address indexed token
    );


    function initializeModuleClone(
        // uint8 _routerVersion,
        address _module,
        address _tokenAddr, 
        address _creator, 
        uint256 _emission, //100_0000 is 100%
        uint256 compTokenAmt,
        string memory _poolDetails
    ) internal {
        IERC20Upgradeable(compToken).transfer(_module, compTokenAmt);

        IModule(_module).initialize(
            // _routerVersion,
            v3Router,
            _tokenAddr,
            compToken,
            _creator,
            _emission,
            _poolDetails,
            moduleManager
        );
        
    }
    function createComPump(
        address _tokenAddr,
        uint256 _emission, // stake reward percent 100_0000 is 100%
        uint256 compTokenAmt, // send comptoken to make liquidity pool
        string memory _moduleDetails,
        string[2] memory tokenInfo //[0] = name, [1] = symbol
    ) external payable {
        address _creator = msg.sender;
        // IERC20Upgradeable(compToken).safeApprove(address(this), compTokenAmt);
        IERC20Upgradeable(compToken).transferFrom(_creator, address(this), compTokenAmt);
        require(
            _emission >= 0,
            "Emission should be greater than zero"
        );
        require(memeTemplate != address(0), "Meme Token address is not set!!");
        
        bytes32 salt = keccak256(
            abi.encodePacked(_moduleDetails, block.timestamp)
        );
        address _module = Clones.cloneDeterministic(moduleTemplate, salt);
         salt = keccak256(
            abi.encodePacked(tokenInfo[0], block.timestamp)
        );
        _tokenAddr = Clones.cloneDeterministic(memeTemplate, salt); //token address
        IMemeToken(_tokenAddr).initialize(
            _module,
            _creator,
            tokenInfo[0],
            tokenInfo[1]
        );

        initializeModuleClone(
            _module,
            _tokenAddr,
            _creator,
            _emission,
            compTokenAmt,
            _moduleDetails
        );
        
        IModuleManager(moduleManager).addModuleFactory(_module);
        IModuleManager(moduleManager).registerModule(
            _module,
            _tokenAddr,
            _creator
        );
        emit moduleCreated(_creator, _module, _tokenAddr);
    }

    function setV3Router(address _address) public onlyOwner {
        require(_address != address(0), "Invalid Address found");
        v3Router = _address;
    }

    function setCompToken(address _address) public onlyOwner {
        require(_address != address(0), "Invalid Address found");
        compToken = _address;
    }

    function setModuleManager(address _address) public onlyOwner {
        require(_address != address(0), "Invalid Address found");
        moduleManager = _address;
    }
    

    function setMemeTemplate(address _memeTemplate) public onlyOwner {
        require(_memeTemplate != address(0), "Token address must be set!!");
        memeTemplate = _memeTemplate;
    }

    function setModuleTemplate(address _moduleTemplate) public onlyOwner {
        require(_moduleTemplate != address(0), "Module address must be set!");
        moduleTemplate = _moduleTemplate;
    }
}
