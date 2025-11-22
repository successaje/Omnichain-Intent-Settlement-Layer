// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title PaymentEscrow
 * @notice Escrow contract for holding funds during intent execution
 */
contract PaymentEscrow is ReentrancyGuard {
    struct Escrow {
        uint256 escrowId;
        address depositor;
        address beneficiary;
        address token; // address(0) for native
        uint256 amount;
        bool released;
        uint256 createdAt;
        uint256 releasedAt;
    }

    mapping(uint256 => Escrow) public escrows;
    uint256 public nextEscrowId;

    event EscrowCreated(
        uint256 indexed escrowId,
        address indexed depositor,
        address indexed beneficiary,
        address token,
        uint256 amount
    );
    event EscrowReleased(uint256 indexed escrowId, address indexed beneficiary);

    /**
     * @notice Create escrow for native tokens
     */
    function createEscrow(
        address _beneficiary
    ) external payable nonReentrant returns (uint256) {
        require(msg.value > 0, "Must send native tokens");
        require(_beneficiary != address(0), "Invalid beneficiary");

        uint256 escrowId = nextEscrowId++;
        escrows[escrowId] = Escrow({
            escrowId: escrowId,
            depositor: msg.sender,
            beneficiary: _beneficiary,
            token: address(0),
            amount: msg.value,
            released: false,
            createdAt: block.timestamp,
            releasedAt: 0
        });

        emit EscrowCreated(
            escrowId,
            msg.sender,
            _beneficiary,
            address(0),
            msg.value
        );
        return escrowId;
    }

    /**
     * @notice Create escrow for ERC20 tokens
     */
    function createEscrowERC20(
        address _token,
        address _beneficiary,
        uint256 _amount
    ) external nonReentrant returns (uint256) {
        require(_amount > 0, "Must send tokens");
        require(_beneficiary != address(0), "Invalid beneficiary");

        IERC20 token = IERC20(_token);
        require(
            token.transferFrom(msg.sender, address(this), _amount),
            "Transfer failed"
        );

        uint256 escrowId = nextEscrowId++;
        escrows[escrowId] = Escrow({
            escrowId: escrowId,
            depositor: msg.sender,
            beneficiary: _beneficiary,
            token: _token,
            amount: _amount,
            released: false,
            createdAt: block.timestamp,
            releasedAt: 0
        });

        emit EscrowCreated(escrowId, msg.sender, _beneficiary, _token, _amount);
        return escrowId;
    }

    /**
     * @notice Release escrowed funds
     */
    function releaseEscrow(uint256 _escrowId) external nonReentrant {
        Escrow storage escrow = escrows[_escrowId];
        require(msg.sender == escrow.beneficiary, "Not beneficiary");
        require(!escrow.released, "Already released");

        escrow.released = true;
        escrow.releasedAt = block.timestamp;

        if (escrow.token == address(0)) {
            (bool success, ) = escrow.beneficiary.call{value: escrow.amount}("");
            require(success, "Transfer failed");
        } else {
            IERC20 token = IERC20(escrow.token);
            require(
                token.transfer(escrow.beneficiary, escrow.amount),
                "Transfer failed"
            );
        }

        emit EscrowReleased(_escrowId, escrow.beneficiary);
    }
}

