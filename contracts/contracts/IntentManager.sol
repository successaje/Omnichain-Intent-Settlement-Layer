// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {OApp, MessagingFee, MessagingReceipt, Origin} from "@layerzerolabs/lz-evm-oapp-v2/contracts/oapp/OApp.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title IntentManager
 * @notice Core contract for managing user intents with LayerZero cross-chain messaging
 * @dev Extends OApp to add intent-anchored atomic settlement functionality
 */
contract IntentManager is OApp, ReentrancyGuard {
    enum IntentStatus {
        Open,
        Bidding,
        Executing,
        Completed,
        Disputed,
        Cancelled
    }

    struct Intent {
        uint256 intentId;
        address user;
        string intentSpec; // Natural language + structured JSON
        uint256 amount; // Escrowed amount
        address token; // Token address (address(0) for native)
        IntentStatus status;
        uint256 deadline;
        uint256 selectedAgentId;
        bytes32 filecoinCid; // CID of stored intent metadata
        uint256 createdAt;
        uint256 executedAt;
    }

    struct AgentProposal {
        uint256 proposalId;
        uint256 intentId;
        uint256 agentId;
        string strategy; // JSON strategy
        uint256 expectedCost;
        uint256 expectedAPY;
        uint256 timeline; // In seconds
        bytes signature;
        bytes32 proofCid; // Filecoin CID of agent proof
        bool selected;
        uint256 submittedAt;
    }

    // State variables
    mapping(uint256 => Intent) public intents;
    mapping(uint256 => AgentProposal[]) public intentProposals;
    mapping(uint256 => uint256) public intentProposalCount;
    mapping(address => uint256[]) public userIntents;

    uint256 public nextIntentId;
    uint256 public constant MIN_DEADLINE = 1 hours;
    uint256 public constant MAX_DEADLINE = 30 days;

    // Events
    event IntentCreated(
        uint256 indexed intentId,
        address indexed user,
        string intentSpec,
        uint256 amount,
        bytes32 filecoinCid
    );
    event ProposalSubmitted(
        uint256 indexed intentId,
        uint256 indexed proposalId,
        uint256 indexed agentId,
        bytes32 proofCid
    );
    event AgentSelected(
        uint256 indexed intentId,
        uint256 indexed agentId,
        uint256 indexed proposalId
    );
    event IntentExecuted(uint256 indexed intentId, bytes executionPayload);
    event CrossChainMessageSent(
        uint256 indexed intentId,
        uint32 dstEid,
        bytes32 messageId
    );
    event CrossChainMessageReceived(
        uint256 indexed intentId,
        uint32 srcEid,
        bytes payload
    );

    constructor(
        address _endpoint,
        address _owner
    ) OApp(_endpoint, _owner) Ownable(_owner) {}

    /**
     * @notice Create a new intent
     * @param _intentSpec Natural language + structured JSON specification
     * @param _filecoinCid CID of intent metadata stored on Filecoin
     * @param _deadline Deadline for intent execution
     */
    function createIntent(
        string calldata _intentSpec,
        bytes32 _filecoinCid,
        uint256 _deadline,
        address _token,
        uint256 _amount
    ) external payable nonReentrant returns (uint256) {
        require(
            _deadline >= block.timestamp + MIN_DEADLINE,
            "Deadline too soon"
        );
        require(
            _deadline <= block.timestamp + MAX_DEADLINE,
            "Deadline too far"
        );
        require(bytes(_intentSpec).length > 0, "Empty intent spec");

        uint256 intentId = nextIntentId++;
        uint256 depositAmount = _token == address(0) ? msg.value : _amount;

        require(depositAmount > 0, "Must deposit funds");

        if (_token != address(0) && _amount > 0) {
            // Transfer ERC20 tokens (requires approval)
            // Implementation would use IERC20(_token).transferFrom(msg.sender, address(this), _amount)
        }

        intents[intentId] = Intent({
            intentId: intentId,
            user: msg.sender,
            intentSpec: _intentSpec,
            amount: depositAmount,
            token: _token,
            status: IntentStatus.Open,
            deadline: _deadline,
            selectedAgentId: 0,
            filecoinCid: _filecoinCid,
            createdAt: block.timestamp,
            executedAt: 0
        });

        userIntents[msg.sender].push(intentId);

        emit IntentCreated(intentId, msg.sender, _intentSpec, depositAmount, _filecoinCid);
        return intentId;
    }

    /**
     * @notice Start bidding phase for an intent
     */
    function startBidding(uint256 _intentId) external {
        Intent storage intent = intents[_intentId];
        require(intent.status == IntentStatus.Open, "Intent not open");
        require(msg.sender == intent.user, "Not intent owner");
        intent.status = IntentStatus.Bidding;
    }

    /**
     * @notice Submit agent proposal
     * @param _intentId The intent ID
     * @param _agentId The agent ID (from AgentRegistry)
     * @param _strategy JSON strategy proposal
     * @param _expectedCost Expected execution cost
     * @param _expectedAPY Expected APY if applicable
     * @param _timeline Execution timeline in seconds
     * @param _signature Agent signature
     * @param _proofCid Filecoin CID of agent proof
     */
    function submitProposal(
        uint256 _intentId,
        uint256 _agentId,
        string calldata _strategy,
        uint256 _expectedCost,
        uint256 _expectedAPY,
        uint256 _timeline,
        bytes calldata _signature,
        bytes32 _proofCid
    ) external returns (uint256) {
        Intent storage intent = intents[_intentId];
        require(
            intent.status == IntentStatus.Bidding,
            "Intent not in bidding"
        );
        require(block.timestamp < intent.deadline, "Deadline passed");

        uint256 proposalId = intentProposalCount[_intentId]++;
        intentProposals[_intentId].push(
            AgentProposal({
                proposalId: proposalId,
                intentId: _intentId,
                agentId: _agentId,
                strategy: _strategy,
                expectedCost: _expectedCost,
                expectedAPY: _expectedAPY,
                timeline: _timeline,
                signature: _signature,
                proofCid: _proofCid,
                selected: false,
                submittedAt: block.timestamp
            })
        );

        emit ProposalSubmitted(_intentId, proposalId, _agentId, _proofCid);
        return proposalId;
    }

    /**
     * @notice Select winning agent proposal
     */
    function selectAgent(
        uint256 _intentId,
        uint256 _proposalId
    ) external {
        Intent storage intent = intents[_intentId];
        require(msg.sender == intent.user, "Not intent owner");
        require(
            intent.status == IntentStatus.Bidding,
            "Intent not in bidding"
        );
        require(
            _proposalId < intentProposals[_intentId].length,
            "Invalid proposal"
        );

        AgentProposal storage proposal = intentProposals[_intentId][_proposalId];
        require(!proposal.selected, "Proposal already selected");

        intent.selectedAgentId = proposal.agentId;
        intent.status = IntentStatus.Executing;
        proposal.selected = true;

        emit AgentSelected(_intentId, proposal.agentId, _proposalId);
    }

    /**
     * @notice Execute intent (can be called by agent or user after approval)
     * @param _intentId The intent ID
     * @param _executionPayload Execution data
     */
    function executeIntent(
        uint256 _intentId,
        bytes calldata _executionPayload
    ) external nonReentrant {
        Intent storage intent = intents[_intentId];
        require(
            intent.status == IntentStatus.Executing,
            "Intent not executing"
        );
        require(block.timestamp < intent.deadline, "Deadline passed");

        intent.status = IntentStatus.Completed;
        intent.executedAt = block.timestamp;

        // Release escrowed funds (simplified - would integrate with PaymentEscrow)
        // Transfer logic here

        emit IntentExecuted(_intentId, _executionPayload);
    }

    /**
     * @notice Send cross-chain message for intent execution
     * @dev Extends OApp functionality with intent-anchored messaging
     */
    function sendCrossChainExecution(
        uint256 _intentId,
        uint32 _dstEid,
        bytes calldata _payload,
        bytes calldata _options
    ) external payable returns (MessagingReceipt memory receipt) {
        Intent storage intent = intents[_intentId];
        require(
            intent.status == IntentStatus.Executing,
            "Intent not executing"
        );

        // Build message with intent context
        bytes memory message = abi.encode(_intentId, _payload);

        MessagingFee memory fee = _quote(_dstEid, message, _options, false);
        require(msg.value >= fee.nativeFee, "Insufficient fee");

        receipt = _lzSend(
            _dstEid,
            message,
            _options,
            fee,
            payable(msg.sender)
        );

        emit CrossChainMessageSent(_intentId, _dstEid, receipt.guid);
        return receipt;
    }

    /**
     * @notice Handle received cross-chain message
     * @dev Extends OApp _lzReceive with intent verification
     */
    function _lzReceive(
        Origin calldata _origin,
        bytes32 /*_guid*/,
        bytes calldata _message,
        address /*_executor*/,
        bytes calldata /*_extraData*/
    ) internal override {
        (uint256 intentId, bytes memory payload) = abi.decode(
            _message,
            (uint256, bytes)
        );

        // Verify intent exists and is in executing state
        Intent storage intent = intents[intentId];
        require(intent.intentId == intentId, "Intent not found");
        require(
            intent.status == IntentStatus.Executing,
            "Intent not executing"
        );

        // Process cross-chain execution
        // This would integrate with ExecutionProxy for actual settlement

        emit CrossChainMessageReceived(intentId, _origin.srcEid, payload);
    }

    /**
     * @notice Quote messaging fee
     */
    function quoteCrossChainFee(
        uint32 _dstEid,
        bytes calldata _message,
        bytes calldata _options,
        bool _payInLzToken
    ) external view returns (MessagingFee memory fee) {
        return _quote(_dstEid, _message, _options, _payInLzToken);
    }

    // View functions
    function getIntent(uint256 _intentId) external view returns (Intent memory) {
        return intents[_intentId];
    }

    function getIntentProposals(
        uint256 _intentId
    ) external view returns (AgentProposal[] memory) {
        return intentProposals[_intentId];
    }

    function getUserIntents(
        address _user
    ) external view returns (uint256[] memory) {
        return userIntents[_user];
    }
}

