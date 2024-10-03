// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;
pragma experimental ABIEncoderV2;

import {IERC20Upgradeable} from './library/IERC20Upgradeable.sol';

import {OwnableUpgradeable} from './library/OwnableUpgradeable.sol';

import {SafeMath} from './library/SafeMath.sol';

import {EnumerableSet} from './library/EnumerableSet.sol';

import {SafeERC20Upgradeable} from './library/SafeERC20Upgradeable.sol';



interface IModuleManager {

    function removeModuleForToken(address token, address module) external;

    function recordContribution(address user, address module) external;

    function isModuleGenerated(address module) external view returns (bool);


    function registerModule(
        address module,
        address token,
        address owner
    ) external;

    function moduleForToken(address token) external view returns (address);
    event ContributionUpdated(uint256 totalParticipations);
    event ModuleForTokenRemoved(address indexed token, address module);
}

interface IModule {
    function getModuleInfo()
        external
        view
        returns (
            address, string memory, string memory, string memory, address[] memory, address[] memory, uint256, address, address, uint256
        );
}

contract ModuleManager is OwnableUpgradeable, IModuleManager {
    using EnumerableSet for EnumerableSet.AddressSet;
    using SafeMath for uint256;
    using SafeERC20Upgradeable for IERC20Upgradeable;

    struct CumulativeLockInfo {
        address moduleAddress;
        address token;
        string tokenName;
        string tokenSymbol;
        string moduleDetails;
        address[] holders;
        address[] compHolders;
        uint256 emission;
        address creator;
        address v3Pair;
        uint256 tokenId;
    }
    EnumerableSet.AddressSet private moduleFactories;
    EnumerableSet.AddressSet private _modules;
    
    mapping(address => EnumerableSet.AddressSet) private _modulesOf;
    mapping(address => EnumerableSet.AddressSet) private _contributedModulesOf;
    mapping(address => address) private _moduleForToken;

    mapping(address => uint256) public totalValueLocked;
    mapping(address => uint256) public totalLiquidityRaised;
    uint256 public totalParticipants;

    event sender(address sender);

    receive() external payable {}

    function initialize(
    ) external initializer {
        __Ownable_init();
    }

    modifier onlyAllowedFactory() {
        emit sender(msg.sender);
        require(
            moduleFactories.contains(msg.sender),
            "Not a whitelisted factory"
        );
        _;
    }



    function addModuleFactory(address factory) public onlyAllowedFactory {
        moduleFactories.add(factory);
    }

    function addAdminModuleFactory(address factory) public onlyOwner {
        moduleFactories.add(factory);
    }

    function addModuleFactories(address[] memory factories) external onlyOwner {
        for (uint256 i = 0; i < factories.length; i++) {
            addModuleFactory(factories[i]);
        }
    }

    function removeModuleFactory(address factory) external onlyOwner {
        moduleFactories.remove(factory);
    }

    function isModuleGenerated(address module) public view override returns (bool) {
        return _modules.contains(module);
    }

    function moduleForToken(
        address token
    ) external view override returns (address) {
        return _moduleForToken[token];
    }

    function registerModule(
        address module,
        address token,
        address owner
    ) external override onlyAllowedFactory {
        _modules.add(module);
        _modulesOf[owner].add(module);
        _moduleForToken[token] = module;
    }

    function recordContribution(
        address user,
        address module
    ) external override onlyAllowedFactory {
        if(!_contributedModulesOf[user].contains(module)){
            totalParticipants = totalParticipants.add(1);
            _contributedModulesOf[user].add(module);
            emit ContributionUpdated(totalParticipants);
        }
        
    }

    function removeModuleForToken(
        address token,
        address module
    ) external override onlyAllowedFactory {
        _moduleForToken[token] = address(0);
        emit ModuleForTokenRemoved(token, module);
    }
    function emergencyRemoveModuleForToken(address token, address module) public onlyOwner{
        _moduleForToken[token] = address(0);
        _modules.remove(module);
        emit ModuleForTokenRemoved(token, module);
    }

    function getModulesOf(address owner) public view returns (address[] memory) {
        uint256 length = _modulesOf[owner].length();
        address[] memory allModules = new address[](length);
        for (uint256 i = 0; i < length; i++) {
            allModules[i] = _modulesOf[owner].at(i);
        }
        return allModules;
    }

    function getAllModules() public view returns (address[] memory) {
        uint256 length = _modules.length();
        address[] memory allModules = new address[](length);
        for (uint256 i = 0; i < length; i++) {
            allModules[i] = _modules.at(i);
        }
        return allModules;
    }
    function removeModuleAt(uint256 index) public onlyOwner  {
        address moduleAddress = _modules.at(index);
        _modules.remove(moduleAddress);
    }


    function getTotalNumberOfContributedModules(
        address user
    ) public view returns (uint256) {
        return _contributedModulesOf[user].length();
    }

    function getAllContributedModules(
        address user
    ) public view returns (address[] memory) {
        uint256 length = _contributedModulesOf[user].length();
        address[] memory allModules = new address[](length);
        for (uint256 i = 0; i < length; i++) {
            allModules[i] = _contributedModulesOf[user].at(i);
        }
        return allModules;
    }

    function getContributedModuleAtIndex(
        address user,
        uint256 index
    ) public view returns (address) {
        return _contributedModulesOf[user].at(index);
    }

    function getTotalNumberOfModules(
    ) public view returns (uint256) {
        return _modules.length();
    }

    function getModuleAt(
        uint256 index
    ) public view returns (address) {
        return _modules.at(index);
    }


    function getCumulativeModuleInfo(
        uint256 start,
        uint256 end
    ) external view returns (CumulativeLockInfo[] memory) {
        if (end >= _modules.length()) {
            end = _modules.length() - 1;
        }
        uint256 length = end - start + 1;
        CumulativeLockInfo[] memory lockInfo = new CumulativeLockInfo[](length);
        uint256 currentIndex = 0;

        for (uint256 i = start; i <= end; i++) {
            (
                address token, 
                string memory tokenName, 
                string memory tokenSymbol, 
                string memory moduleDetails, 
                address[] memory holders, 
                address[] memory compHolders, 
                uint256 emission,
                address creator,
                address v3Pair,
                uint256 tokenId
            ) = IModule(_modules.at(i)).getModuleInfo();
            lockInfo[currentIndex] = CumulativeLockInfo(
                _modules.at(i),
                token,
                tokenName,
                tokenSymbol,
                moduleDetails,
                holders,
                compHolders,
                emission,
                creator,
                v3Pair,
                tokenId
            );
            currentIndex++;
        }
        return lockInfo;
    }

    function getUserContributedModuleInfo(
        address userAddress,
        uint256 start,
        uint256 end
    ) external view returns (CumulativeLockInfo[] memory) {
        if (end >= _contributedModulesOf[userAddress].length()) {
            end = _contributedModulesOf[userAddress].length() - 1;
        }
        uint256 length = end - start + 1;
        CumulativeLockInfo[] memory lockInfo = new CumulativeLockInfo[](length);
        uint256 currentIndex = 0;
        address user = userAddress;
        EnumerableSet.AddressSet storage moduleAddrs = _contributedModulesOf[user];
        for (uint256 i = start; i <= end; i++) {
            (
                address token, 
                string memory tokenName, 
                string memory tokenSymbol, 
                string memory moduleDetails, 
                address[] memory holders, 
                address[] memory compHolders, 
                uint256 emission,
                address creator,
                address v3Pair,
                uint256 tokenId
            ) = IModule(moduleAddrs.at(i)).getModuleInfo();
            lockInfo[currentIndex] = CumulativeLockInfo(
                moduleAddrs.at(i),
                token,
                tokenName,
                tokenSymbol,
                moduleDetails,
                holders,
                compHolders,
                emission,
                creator,
                v3Pair,
                tokenId
            );
            currentIndex++;
        }
        return lockInfo;
    }

    function transferAnyERC20Token(
        address payaddress,
        address tokenAddress,
        uint256 tokens
    ) public onlyOwner {
        IERC20Upgradeable(tokenAddress).transfer(payaddress, tokens);
    }
}
