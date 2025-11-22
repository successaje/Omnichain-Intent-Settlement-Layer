// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @notice Mock LayerZero Endpoint for testing
 */
contract MockEndpoint {
    function sendMessage(uint32 _dstEid, bytes calldata _message) external payable {
        // Mock implementation
    }
}

