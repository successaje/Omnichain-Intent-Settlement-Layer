// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {OApp, MessagingFee, MessagingReceipt, Origin} from "@layerzerolabs/lz-evm-oapp-v2/contracts/oapp/OApp.sol";
import {OFT} from "@layerzerolabs/lz-evm-oapp-v2/contracts/oft/OFT.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {AggregatorV3Interface} from "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";

/**
 * @title ExecutionProxy
 * @notice Proxy for executing cross-chain intents with LayerZero OFT extension
 * @dev Extends OFT to enable atomic settlement of omnichain swaps
 */
contract ExecutionProxy is OApp, ReentrancyGuard {
    struct CrossChainSwap {
        uint256 intentId;
        address user;
        address srcToken;
        address dstToken;
        uint256 srcAmount;
        uint256 minDstAmount;
        uint32 dstEid;
        bool executed;
        bytes executionProof;
    }

    mapping(uint256 => CrossChainSwap) public swaps;
    mapping(address => AggregatorV3Interface) public priceFeeds; // Token to price feed

    uint256 public nextSwapId;
    address public intentManager;

    event SwapInitiated(
        uint256 indexed swapId,
        uint256 indexed intentId,
        address indexed user,
        address srcToken,
        address dstToken,
        uint256 srcAmount,
        uint32 dstEid
    );
    event SwapExecuted(
        uint256 indexed swapId,
        uint256 dstAmount,
        bytes executionProof
    );
    event PriceFeedUpdated(address indexed token, address indexed feed);

    constructor(
        address _token,
        address _endpoint,
        address _owner,
        address _intentManager
    ) OApp(_endpoint, _owner) Ownable(_owner) {
        intentManager = _intentManager;
    }

    /**
     * @notice Initiate cross-chain swap with atomic settlement
     * @dev Extends OFT functionality to batch multiple transfers
     */
    function initiateSwap(
        uint256 _intentId,
        address _srcToken,
        address _dstToken,
        uint256 _srcAmount,
        uint256 _minDstAmount,
        uint32 _dstEid,
        bytes calldata _options
    ) external payable nonReentrant returns (uint256, MessagingReceipt memory) {
        require(_srcAmount > 0, "Invalid amount");

        // Transfer source tokens (or use native)
        if (_srcToken == address(0)) {
            require(msg.value >= _srcAmount, "Insufficient native");
        } else {
            IERC20(_srcToken).transferFrom(msg.sender, address(this), _srcAmount);
        }

        // Get price feed for slippage check
        uint256 expectedDstAmount = _getExpectedAmount(
            _srcToken,
            _dstToken,
            _srcAmount
        );
        require(
            expectedDstAmount >= _minDstAmount,
            "Slippage too high"
        );

        uint256 swapId = nextSwapId++;
        swaps[swapId] = CrossChainSwap({
            intentId: _intentId,
            user: msg.sender,
            srcToken: _srcToken,
            dstToken: _dstToken,
            srcAmount: _srcAmount,
            minDstAmount: _minDstAmount,
            dstEid: _dstEid,
            executed: false,
            executionProof: ""
        });

        // Build cross-chain message
        bytes memory message = abi.encode(
            swapId,
            _intentId,
            msg.sender,
            _srcToken,
            _dstToken,
            _srcAmount,
            _minDstAmount
        );

        MessagingFee memory fee = _quote(_dstEid, message, _options, false);
        require(msg.value >= fee.nativeFee, "Insufficient fee");

        MessagingReceipt memory receipt = _lzSend(
            _dstEid,
            message,
            _options,
            fee,
            payable(msg.sender)
        );

        emit SwapInitiated(
            swapId,
            _intentId,
            msg.sender,
            _srcToken,
            _dstToken,
            _srcAmount,
            _dstEid
        );

        return (swapId, receipt);
    }

    /**
     * @notice Batch execute multiple intents atomically
     * @dev New extension - aggregates multiple OFT transfers
     */
    function batchExecuteIntent(
        uint256[] calldata _intentIds,
        address[] calldata _tokens,
        uint256[] calldata _amounts,
        uint32 _dstEid,
        bytes calldata _options
    ) external payable nonReentrant returns (MessagingReceipt memory) {
        require(
            _intentIds.length == _tokens.length &&
            _tokens.length == _amounts.length,
            "Mismatched arrays"
        );

        bytes memory message = abi.encode(_intentIds, _tokens, _amounts);

        MessagingFee memory fee = _quote(_dstEid, message, _options, false);
        require(msg.value >= fee.nativeFee, "Insufficient fee");

        MessagingReceipt memory receipt = _lzSend(
            _dstEid,
            message,
            _options,
            fee,
            payable(msg.sender)
        );

        return receipt;
    }

    /**
     * @notice Handle received cross-chain swap
     */
    function _lzReceive(
        Origin calldata _origin,
        bytes32 /*_guid*/,
        bytes calldata _message,
        address /*_executor*/,
        bytes calldata /*_extraData*/
    ) internal override {
        (
            uint256 swapId,
            uint256 intentId,
            address user,
            address srcToken,
            address dstToken,
            uint256 srcAmount,
            uint256 minDstAmount
        ) = abi.decode(_message, (uint256, uint256, address, address, address, uint256, uint256));

        // Execute swap on destination chain
        // In production, this would integrate with DEX aggregators
        uint256 dstAmount = _executeSwap(
            srcToken,
            dstToken,
            srcAmount,
            minDstAmount
        );

        swaps[swapId].executed = true;
        swaps[swapId].executionProof = abi.encode(
            _origin.srcEid,
            dstAmount,
            block.timestamp
        );

        // Transfer tokens to user
        if (dstToken == address(0)) {
            payable(user).transfer(dstAmount);
        } else {
            IERC20(dstToken).transfer(user, dstAmount);
        }

        emit SwapExecuted(swapId, dstAmount, swaps[swapId].executionProof);
    }

    /**
     * @notice Set Chainlink price feed for token
     */
    function setPriceFeed(
        address _token,
        address _feed
    ) external onlyOwner {
        priceFeeds[_token] = AggregatorV3Interface(_feed);
        emit PriceFeedUpdated(_token, _feed);
    }

    /**
     * @notice Get expected amount using Chainlink price feed
     */
    function _getExpectedAmount(
        address _srcToken,
        address _dstToken,
        uint256 _srcAmount
    ) internal view returns (uint256) {
        AggregatorV3Interface srcFeed = priceFeeds[_srcToken];
        AggregatorV3Interface dstFeed = priceFeeds[_dstToken];

        if (address(srcFeed) == address(0) || address(dstFeed) == address(0)) {
            return 0; // No price feed
        }

        (, int256 srcPrice, , , ) = srcFeed.latestRoundData();
        (, int256 dstPrice, , , ) = dstFeed.latestRoundData();

        require(srcPrice > 0 && dstPrice > 0, "Invalid price");

        // Calculate expected amount with 18 decimals
        return (uint256(srcPrice) * _srcAmount * 1e18) / (uint256(dstPrice) * 1e18);
    }

    /**
     * @notice Execute swap (simplified - would integrate with DEX)
     */
    function _executeSwap(
        address _srcToken,
        address _dstToken,
        uint256 _srcAmount,
        uint256 _minDstAmount
    ) internal returns (uint256) {
        // Simplified swap - in production would use DEX aggregator
        uint256 dstAmount = _getExpectedAmount(_srcToken, _dstToken, _srcAmount);
        require(dstAmount >= _minDstAmount, "Slippage exceeded");
        return dstAmount;
    }
}

