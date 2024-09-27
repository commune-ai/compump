// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;


import {OwnableUpgradeable} from './library/OwnableUpgradeable.sol';

import {IERC20} from './library/IERC20.sol';
import {IERC20Metadata} from './library/IERC20Metadata.sol';

import {SafeERC20} from './library/SafeERC20.sol';

import {EnumerableSet} from './library/EnumerableSet.sol';

import {ReEntrancyGuard} from './library/ReEntrancyGuard.sol';

import {SafeMath} from './library/SafeERC20.sol';

import {Address} from './library/Address.sol';

contract CompStake is OwnableUpgradeable , ReEntrancyGuard {
    using SafeMath for uint256;
    using SafeERC20 for IERC20;
    using Address for address payable;
    using EnumerableSet for EnumerableSet.AddressSet;
    mapping(address => uint256) public stakesOf;
    mapping(address => uint256) public lastUpdateTimeOf;
    mapping(address => uint256) public rewards;

    uint256 public totalStaked;
    uint256 private constant MAX = ~uint256(0);
    uint256 public emission;
    
    
    // address public currency;
    address public token;
    // uint256 public rate;
    // uint256 public minContribution;
    // uint256 public maxContribution;
    // uint256 public softCap;
    // uint256 public hardCap;

    // uint256 public liquidityListingRate;

    // bool public completedKyc;

    EnumerableSet.AddressSet private holders;
   

    event Staked(
        address indexed user,
        uint256 amount,
        uint256 timestamp
    );

    event UnStaked(
        address indexed user,
        uint256 amount,
        uint256 timestamp
    );

    receive() external payable {
        // if (msg.value > 0) contribute(0);
    }

    function initialize(
        // uint8 _routerVersion,
        address _tokenAddr, 
        address _creator,
        uint256 _emission //100_0000 is 100%
    ) external initializer {
        require(_tokenAddr != address(0), "Invalid Token address");
        OwnableUpgradeable.__Ownable_init();
        transferOwnership(_creator);
        emission = _emission;

        token = _tokenAddr;
        IERC20(token).safeApprove(address(this), MAX);
    }
    function getDecimal() public view returns(uint8){
        uint8 decimals = IERC20Metadata(token).decimals();
        return decimals;
    }

    modifier updateReward(address account) {
        // rewardPerTokenStored = rewardPerToken();
        // lastUpdateTimeOf[account] = block.timestamp;
        if (account != address(0)) {
            rewards[account] = earned(account);
            lastUpdateTimeOf[account] = block.timestamp;
        }
        _;
    }

    function earned(address account) public view returns (uint256) {
        return stakesOf[account] *(block.timestamp - lastUpdateTimeOf[account]) * emission / 10000 / 86400  + rewards[account];
    }

    function stake(
        uint256 _amount
    ) external updateReward(msg.sender) {
        require(msg.sender != owner(), "creator can't stake token");
        if(!holders.contains(msg.sender)){
            holders.add(msg.sender);

        }
        IERC20(token).safeTransferFrom(msg.sender, address(this), _amount);
        uint256 userTotalStaked = stakesOf[msg.sender].add(_amount);
        stakesOf[msg.sender] = userTotalStaked;
        totalStaked = totalStaked.add(_amount);
        emit Staked(msg.sender, _amount, block.timestamp);
    }

    function unStake(
        uint256 _amount
    ) external updateReward(msg.sender) {
        require(msg.sender != owner(), "creator can't stake token");
        uint256 userTotalStaked = stakesOf[msg.sender].add(_amount);
        require(userTotalStaked > _amount, "You don't have enough staked");
        if(userTotalStaked == 0){
            holders.remove(msg.sender);
        }
        stakesOf[msg.sender].sub(_amount);
        totalStaked = totalStaked.sub(userTotalStaked);
        emit UnStaked(msg.sender, _amount, block.timestamp);
    }

    function claimReward() external updateReward(msg.sender){
        uint256 rewardAmt = rewards[msg.sender];
        rewards[msg.sender] = 0;
        IERC20(token).transfer(msg.sender, rewardAmt);
    }
    function distributeRewards() external onlyOwner {
        for(uint256 i = 0; i< holders.length(); i++){
            uint256 accEarned = earned(holders.at(i));
            rewards[holders.at(i)]= 0;
            lastUpdateTimeOf[holders.at(i)]= block.timestamp;
            if(accEarned> 0){
                IERC20(token).transfer(holders.at(i), accEarned);
            }
        }
    }
    function getUserStaked(
        address user
    ) external view returns(uint256){
        uint256 userTotalStaked = stakesOf[user];
        return userTotalStaked;
    }
    function getHolders() external view returns (uint256, address[] memory) {
        address[] memory _holders = new address[](holders.length());
        for(uint256 i = 0; i < holders.length(); i++){
            _holders[i] = holders.at(i);
        }
        return (holders.length(), _holders);
    }

    function emergencyWithdrawToken( address payaddress ,address tokenAddress, uint256 tokens ) external onlyOwner 
    {
       IERC20(tokenAddress).transfer(payaddress, tokens);
    }

    function updateEmission(uint256 newEmission) external onlyOwner{
        emission= newEmission;
    }
}