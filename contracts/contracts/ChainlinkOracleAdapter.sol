// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {AggregatorV3Interface} from "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title ChainlinkOracleAdapter
 * @notice Adapter for Chainlink price feeds for on-chain price checks
 */
contract ChainlinkOracleAdapter is Ownable {
    mapping(address => AggregatorV3Interface) public priceFeeds;
    mapping(address => uint256) public staleThreshold; // Max staleness in seconds

    event PriceFeedAdded(address indexed token, address indexed feed);
    event PriceUpdated(address indexed token, int256 price, uint256 timestamp);

    constructor(address _owner) Ownable(_owner) {}

    /**
     * @notice Add Chainlink price feed for token
     */
    function addPriceFeed(
        address _token,
        address _feed,
        uint256 _staleThreshold
    ) external onlyOwner {
        priceFeeds[_token] = AggregatorV3Interface(_feed);
        staleThreshold[_token] = _staleThreshold;
        emit PriceFeedAdded(_token, _feed);
    }

    /**
     * @notice Get latest price for token
     */
    function getLatestPrice(address _token) external view returns (int256, uint256) {
        AggregatorV3Interface feed = priceFeeds[_token];
        require(address(feed) != address(0), "No price feed");

        (
            uint80 roundId,
            int256 price,
            uint256 startedAt,
            uint256 updatedAt,
            uint80 answeredInRound
        ) = feed.latestRoundData();

        require(updatedAt > 0, "Round not complete");
        require(
            block.timestamp - updatedAt <= staleThreshold[_token],
            "Price data stale"
        );
        require(answeredInRound >= roundId, "Stale round");

        return (price, updatedAt);
    }

    /**
     * @notice Get price with validation
     */
    function getValidatedPrice(
        address _token
    ) external view returns (int256 price, uint256 timestamp) {
        (price, timestamp) = this.getLatestPrice(_token);
        require(price > 0, "Invalid price");
        return (price, timestamp);
    }

    /**
     * @notice Compare two token prices
     */
    function comparePrices(
        address _tokenA,
        address _tokenB
    ) external view returns (uint256 ratio) {
        (int256 priceA, ) = this.getLatestPrice(_tokenA);
        (int256 priceB, ) = this.getLatestPrice(_tokenB);

        require(priceA > 0 && priceB > 0, "Invalid prices");

        // Calculate ratio with 18 decimals
        ratio = (uint256(priceA) * 1e18) / uint256(priceB);
        return ratio;
    }
}

