// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

// import {OwnableUpgradeable} from './library/OwnableUpgradeable.sol';

/////////////////////////////////////////////////////// Initializeable contract is different

import {IERC20} from './library/IERC20.sol';

import {IERC20Metadata} from './library/IERC20Metadata.sol';

import {SafeMath} from './library/SafeMath.sol';

import {Address} from './library/Address.sol';

import {SafeERC20} from './library/SafeERC20.sol';

import {EnumerableSet} from './library/EnumerableSet.sol';

import {ReEntrancyGuard} from './library/ReEntrancyGuard.sol';


import {AddressUpgradeable} from './library/AddressUpgradeable.sol';

abstract contract Initializable {

    /**
     * @dev Indicates that the contract has been initialized.
     */
    bool private _initialized;

    /**
     * @dev Indicates that the contract is in the process of being initialized.
     */
    bool private _initializing;

    /**
     * @dev Modifier to protect an initializer function from being invoked twice.
     */
    modifier initializer() {
        require(_initializing || _isConstructor() || !_initialized, "Initializable: contract is already initialized");

        bool isTopLevelCall = !_initializing;
        if (isTopLevelCall) {
            _initializing = true;
            _initialized = true;
        }

        _;

        if (isTopLevelCall) {
            _initializing = false;
        }
    }

    /// @dev Returns true if and only if the function is running in the constructor
    function _isConstructor() private view returns (bool) {
        return !AddressUpgradeable.isContract(address(this));
    }
}

abstract contract ContextUpgradeable is Initializable {
    function __Context_init() internal initializer {
        __Context_init_unchained();
    }

    function __Context_init_unchained() internal initializer {}

    function _msgSender() internal view virtual returns (address payable) {
        return payable(msg.sender);
    }

    function _msgData() internal view virtual returns (bytes memory) {
        this; // silence state mutability warning without generating bytecode - see https://github.com/ethereum/solidity/issues/2691
        return msg.data;
    }

    uint256[50] private __gap;
}

abstract contract OwnableUpgradeable is Initializable, ContextUpgradeable {
    address private _owner;

    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    /**
     * @dev Initializes the contract setting the deployer as the initial owner.
     */
    function __Ownable_init() internal initializer {
        __Context_init_unchained();
        __Ownable_init_unchained();
    }

    function __Ownable_init_unchained() internal initializer {
        address msgSender = _msgSender();
        _owner = msgSender;
        emit OwnershipTransferred(address(0), msgSender);
    }

    /**
     * @dev Returns the address of the current owner.
     */
    function owner() public view virtual returns (address) {
        return _owner;
    }

    /**
     * @dev Throws if called by any account other than the owner.
     */
    modifier onlyOwner() {
        require(owner() == _msgSender(), "Ownable: caller is not the owner");
        _;
    }

    /**
     * @dev Leaves the contract without owner. It will not be possible to call
     * `onlyOwner` functions anymore. Can only be called by the current owner.
     *
     * NOTE: Renouncing ownership will leave the contract without an owner,
     * thereby removing any functionality that is only available to the owner.
     */
    function renounceOwnership() public virtual onlyOwner {
        emit OwnershipTransferred(_owner, address(0));
        _owner = address(0);
    }

    /**
     * @dev Transfers ownership of the contract to a new account (`newOwner`).
     * Can only be called by the current owner.
     */
    function transferOwnership(address newOwner) public virtual onlyOwner {
        require(newOwner != address(0), "Ownable: new owner is the zero address");
        emit OwnershipTransferred(_owner, newOwner);
        _owner = newOwner;
    }
    uint256[49] private __gap;
}


//for v3
import {Math} from './library/Math.sol';

import {INonfungiblePositionManager} from './library/INonfungiblePositionManager.sol';

import {IERC721Receiver} from './library/IERC721Receiver.sol';


interface IModuleFactory {
    function recordContribution(address user, address module) external;
}

interface IModule {
    function initialize(
        // uint8 _routerVersion,
        address _tokenAddr,
        address _creator,
        uint256 _emission, //100_0000 is 100%
        string memory _moduleDetails,
        address moduleManager
    ) external;

    function emergencyWithdrawToken( address payaddress ,address tokenAddress, uint256 tokens ) external;
    function getModuleInfo() external view returns (address, string memory, string memory, string memory, address[] memory, address[] memory, uint256, address, address, uint256);

}




interface IUniswapV3Pair {
    function factory() external view returns (address);

    /// @notice The first of the two tokens of the pool, sorted by address
    /// @return The token contract address
    function token0() external view returns (address);

    /// @notice The second of the two tokens of the pool, sorted by address
    /// @return The token contract address
    function token1() external view returns (address);

    /// @notice The pool's fee in hundredths of a bip, i.e. 1e-6
    /// @return The fee
    function fee() external view returns (uint24);
    function tickSpacing() external view returns (int24);
}

contract Module is OwnableUpgradeable, ReEntrancyGuard, IERC721Receiver {
    using SafeMath for uint256;
    using SafeERC20 for IERC20;
    using Address for address payable;
    using EnumerableSet for EnumerableSet.AddressSet;

    mapping(bytes32 => uint256) public stakesOf;
    mapping(bytes32 => uint256) public lastUpdateTimeOf;
    mapping(bytes32 => uint256) public rewards;

    uint256 public totalStaked;
    uint256 public compTotalStaked;
    uint256 private constant MAX = ~uint256(0);
    address public v3Router;

    address public v3Pair;
    uint256 public tokenId;
    address public factory;
    
    uint256 public emission;
    
    
    // address public currency;
    address public token;
    address public compToken;
    // uint256 public rate;
    // uint256 public minContribution;
    // uint256 public maxContribution;
    // uint256 public softCap;
    // uint256 public hardCap;

    // uint256 public liquidityListingRate;

    string public moduleDetails;

    // bool public completedKyc;

    EnumerableSet.AddressSet private holders;
    EnumerableSet.AddressSet private compHolders;
   

    event ModuleUpdated(uint256 timestamp);

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
        address _v3Router,
        address _tokenAddr, 
        address _compToken,
        address _creator,
        uint256 _emission, //100_0000 is 100%
        string memory _moduleDetails,
        address moduleManager
    ) external initializer {
        require(_tokenAddr != address(0), "Invalid Token address");
        OwnableUpgradeable.__Ownable_init();
        transferOwnership(_creator);

        v3Router = _v3Router;
        factory = moduleManager;
        emission = _emission;

        token = _tokenAddr;
        compToken= _compToken;
        // IERC20(token).safeApprove(address(this), MAX);
        moduleDetails = _moduleDetails;
        
        //crete pool on uniswap V3
        uint24 fee = 2500; // As base Sepolia using pancakeV3Factory for createPool on PoolInitializer.sol, need to change to 3000 for ethereum
        address token0;
        address token1;
        uint256 amount0ToAdd;
        uint256 amount1ToAdd;
        int24 tickSpacing;
        if(compToken> token){
            token0 = token;
            token1 = compToken;
            amount0ToAdd = IERC20(token).balanceOf(address(this))/2; //only send 50% of module token to v3 pool;
            amount1ToAdd = IERC20(compToken).balanceOf(address(this)); //send all comp token received while creating;
        }else {
            token0 = compToken;
            token1 = token;
            amount0ToAdd = IERC20(compToken).balanceOf(address(this)); //send all comp token received while creating;
            amount1ToAdd = IERC20(token).balanceOf(address(this))/2; //only send 50% of module token to v3 pool;
        }
        require(amount0ToAdd > 0, "amount0ToAdd must be greater than zero");
        require(amount1ToAdd > 0, "amount1ToAdd must be greater than zero");
        IERC20(token0).safeApprove(v3Router, amount0ToAdd);
        IERC20(token1).safeApprove(v3Router, amount1ToAdd);
        {
            v3Pair = INonfungiblePositionManager(v3Router).createAndInitializePoolIfNecessary(
                token0,
                token1,
                fee,
                uint160(Math.sqrt(Math.mulDiv(amount1ToAdd, 2**192, amount0ToAdd)))
            );
            tickSpacing = IUniswapV3Pair(v3Pair).tickSpacing();
        }
        
        INonfungiblePositionManager.MintParams memory params = INonfungiblePositionManager.MintParams({
                token0: token0,
                token1: token1,
                fee: fee,
                tickLower: (-887272/tickSpacing)*tickSpacing,
                tickUpper: (887272/tickSpacing)*tickSpacing,
                amount0Desired: amount0ToAdd,
                amount1Desired: amount1ToAdd,
                amount0Min: 0,
                amount1Min: 0,
                recipient: address(this),
                deadline: block.timestamp
            });
        
        (
            uint256 _tokenId,
            uint128 _liquidity,
            uint256 amount0,
            uint256 amount1
        ) = INonfungiblePositionManager(v3Router).mint(params);

        tokenId = _tokenId;
    }

    // Function to create a composite key
    function _getCompositeKey(address staker, address stakeToken) internal pure returns (bytes32) {
        return keccak256(abi.encodePacked(staker, stakeToken));
    }

    function getDecimal() public view returns(uint8){
        uint8 decimals = IERC20Metadata(token).decimals();
        return decimals;
    }

    modifier updateReward(address account, address stakeToken) {
        // rewardPerTokenStored = rewardPerToken();
        // lastUpdateTimeOf[account] = block.timestamp;
        require(stakeToken == token ||stakeToken == compToken, "Should stake module token or COMP");
        if (account != address(0)) {
            bytes32 key = _getCompositeKey(account, stakeToken);
            rewards[key] = earned(account, stakeToken);
            lastUpdateTimeOf[key] = block.timestamp;
        }
        _;
    }

    function earned(address account, address stakeToken) public view returns (uint256) {
        bytes32 key = _getCompositeKey(account, stakeToken);
        return stakesOf[key] *(block.timestamp - lastUpdateTimeOf[key]) * emission / 10000 / 86400  + rewards[key];
    }

    function stake(
        uint256 _amount, address stakeToken
    ) external updateReward(msg.sender, stakeToken) {
        require(msg.sender != owner(), "creator can't stake token");
        require(stakeToken == token || stakeToken == compToken, "Should stake module token or COMP");
        if(stakeToken == token){
            if(!holders.contains(msg.sender)){
                holders.add(msg.sender);
            }
        }else if(stakeToken == compToken) {
            if(!compHolders.contains(msg.sender)){
                compHolders.add(msg.sender);
            }
        }
        bytes32 key = _getCompositeKey(msg.sender, stakeToken);
        IERC20(stakeToken).safeTransferFrom(msg.sender, address(this), _amount);
        uint256 userTotalStaked = stakesOf[key].add(_amount);
        if (stakesOf[key] == 0) {
            IModuleFactory(factory).recordContribution(msg.sender, address(this));
        }
        stakesOf[key] = userTotalStaked;
        if(stakeToken == token){
            totalStaked = totalStaked.add(_amount);
            
        }else if(stakeToken == compToken) {
            compTotalStaked = compTotalStaked.add(_amount);
        }
        emit Staked(msg.sender, _amount, block.timestamp);
    }

    function unStake(
        uint256 _amount, address stakeToken
    ) external updateReward(msg.sender, stakeToken) {
        require(msg.sender != owner(), "creator can't stake token");
        require(stakeToken == token || stakeToken == compToken, "Should unstake module token or COMP");
        bytes32 key = _getCompositeKey(msg.sender, stakeToken);
        require(stakesOf[key]> _amount, "Unstaking amount exceed staked amount");
        uint256 userTotalStaked = stakesOf[key].sub(_amount);
        if(userTotalStaked == 0){
            if(stakeToken == token){
                holders.remove(msg.sender);

            }else if(stakeToken == compToken){
                compHolders.remove(msg.sender);
            }
        }
        stakesOf[key]= userTotalStaked;
        if(stakeToken == token){
            totalStaked = totalStaked.sub(_amount);
        }else if(stakeToken == compToken){
            compTotalStaked = compTotalStaked.sub(_amount);
        }
        IERC20(stakeToken).transfer( msg.sender, _amount);
        emit UnStaked(msg.sender, _amount, block.timestamp);
    }

    function claimReward(address stakeToken) external updateReward(msg.sender, stakeToken){
        require(stakeToken == token||stakeToken == compToken, "Should claim module token or COMP");
        bytes32 key = _getCompositeKey(msg.sender, stakeToken);
        uint256 rewardAmt = rewards[key];
        rewards[key] = 0;
        IERC20(stakeToken).transfer(msg.sender, rewardAmt);
    }
    function distributeRewards() external onlyOwner {
        bytes32 key;
        uint256 accEarned;
        for(uint256 i = 0; i< holders.length(); i++){
            accEarned = earned(holders.at(i), token);
            key = _getCompositeKey(msg.sender, token);
            rewards[key]= 0;
            lastUpdateTimeOf[key]= block.timestamp;
            if(accEarned> 0){
                IERC20(token).transfer(holders.at(i), accEarned);
            }
        }
        for(uint256 i = 0; i< compHolders.length(); i++){
            accEarned = earned(compHolders.at(i), compToken);
            key = _getCompositeKey(msg.sender, compToken);
            rewards[key]= 0;
            lastUpdateTimeOf[key]= block.timestamp;
            if(accEarned> 0){
                IERC20(compToken).transfer(compHolders.at(i), accEarned);
            }
        }
    }
    function getUserStaked(
        address user
    ) external view returns(uint256, uint256){
        bytes32 key = _getCompositeKey(user, token);
        uint256 userTokenStaked = stakesOf[key];
        key = _getCompositeKey(user, compToken);
        uint256 userCompStaked = stakesOf[key];
        return (userTokenStaked, userCompStaked);
    }
    function getHolders() public view returns (address[] memory, address[] memory) {
        address[] memory _holders = new address[](holders.length());
        for(uint256 i = 0; i < holders.length(); i++){
            _holders[i] = holders.at(i);
        }
        address[] memory _compHolders = new address[](compHolders.length());
        for(uint256 i = 0; i < compHolders.length(); i++){
            _compHolders[i] = compHolders.at(i);
        }
        return (_holders, _compHolders);
    }

    
    function getModuleInfo() external view returns (address, string memory, string memory, string memory, address[] memory, address[] memory, uint256, address, address, uint256){
        address[] memory _holders = new address[](holders.length());
        address[] memory _compHolders = new address[](compHolders.length());
        (_holders, _compHolders) = getHolders();

        return (token, IERC20Metadata(token).name(), IERC20Metadata(token).symbol(), moduleDetails, _holders, _compHolders, emission, owner(), v3Pair, tokenId);
    }

    // to get token price related with compump on v3 pool using tokenId
    function getPositionInfo() external view returns(
        address token0,
        address token1,
        uint24 fee,
        uint128 liquidity,
        uint128 tokensOwed0,
        uint128 tokensOwed1
    ) {
       (
            ,
            ,
            token0,
            token1,
            fee,
            ,
            ,
            liquidity,
            ,
            ,
            tokensOwed0,
            tokensOwed1
        ) = INonfungiblePositionManager(v3Router).positions(tokenId);
    }
    function emergencyWithdrawToken( address payaddress ,address tokenAddress, uint256 tokens ) external onlyOwner 
    {
       IERC20(tokenAddress).transfer(payaddress, tokens);
    }

    function updateEmission(uint256 newEmission) external onlyOwner{
        emission= newEmission;
    }
    function updateModuleDetails(string memory details_) external onlyOwner {
        moduleDetails = details_;
        emit ModuleUpdated(block.timestamp);
    }

    function updateEmissionModuleDetails(uint256 newEmission, string memory details_) external onlyOwner {
        emission = newEmission;
        moduleDetails = details_;
        emit ModuleUpdated(block.timestamp);
    }
    function onERC721Received(
        address,
        address,
        uint256,
        bytes memory
    ) public virtual override returns (bytes4) {
        return this.onERC721Received.selector;
    }
}