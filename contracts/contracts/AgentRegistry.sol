// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title AgentRegistry
 * @notice Registry for AI agents with ENS verification and reputation staking
 */
contract AgentRegistry is Ownable, ReentrancyGuard {
    struct Agent {
        uint256 agentId;
        address agentAddress;
        string ensName;
        string specialization;
        uint256 stake; // Reputation stake amount
        uint256 reputation; // Reputation score
        uint256 slashCount;
        bool active;
        uint256 registeredAt;
        uint256 lastActivity;
    }

    struct ReputationMetric {
        uint256 completedIntents;
        uint256 totalEarnings;
        uint256 slashedAmount;
        uint256 avgRating;
    }

    IERC20 public reputationToken; // ERC20 token for staking
    uint256 public minStake;
    uint256 public slashPercentage; // % of stake to slash on misbehavior

    mapping(uint256 => Agent) public agents;
    mapping(address => uint256) public addressToAgentId;
    mapping(uint256 => ReputationMetric) public agentMetrics;
    mapping(address => bool) public ensVerified;

    uint256 public nextAgentId;

    // Events
    event AgentRegistered(
        uint256 indexed agentId,
        address indexed agentAddress,
        string ensName,
        uint256 stake
    );
    event StakeIncreased(
        uint256 indexed agentId,
        uint256 amount,
        uint256 newTotal
    );
    event AgentSlashed(
        uint256 indexed agentId,
        uint256 amount,
        string reason
    );
    event AgentDeactivated(uint256 indexed agentId);
    event ReputationUpdated(uint256 indexed agentId, uint256 newReputation);

    constructor(
        address _reputationToken,
        uint256 _minStake,
        address _owner
    ) Ownable(_owner) {
        reputationToken = IERC20(_reputationToken);
        minStake = _minStake;
        slashPercentage = 10; // 10% default slash
    }

    /**
     * @notice Register a new agent
     * @param _ensName ENS name for the agent
     * @param _specialization Agent specialization
     * @param _stakeAmount Initial stake amount
     */
    function registerAgent(
        string calldata _ensName,
        string calldata _specialization,
        uint256 _stakeAmount
    ) external nonReentrant returns (uint256) {
        require(
            addressToAgentId[msg.sender] == 0,
            "Agent already registered"
        );
        require(_stakeAmount >= minStake, "Stake below minimum");
        require(bytes(_ensName).length > 0, "Empty ENS name");

        // Transfer stake tokens
        require(
            reputationToken.transferFrom(msg.sender, address(this), _stakeAmount),
            "Transfer failed"
        );

        uint256 agentId = nextAgentId++;
        agents[agentId] = Agent({
            agentId: agentId,
            agentAddress: msg.sender,
            ensName: _ensName,
            specialization: _specialization,
            stake: _stakeAmount,
            reputation: 1000, // Initial reputation
            slashCount: 0,
            active: true,
            registeredAt: block.timestamp,
            lastActivity: block.timestamp
        });

        addressToAgentId[msg.sender] = agentId;

        emit AgentRegistered(agentId, msg.sender, _ensName, _stakeAmount);
        return agentId;
    }

    /**
     * @notice Increase stake
     */
    function increaseStake(
        uint256 _agentId,
        uint256 _amount
    ) external nonReentrant {
        Agent storage agent = agents[_agentId];
        require(agent.agentAddress == msg.sender, "Not agent owner");
        require(agent.active, "Agent inactive");

        require(
            reputationToken.transferFrom(msg.sender, address(this), _amount),
            "Transfer failed"
        );

        agent.stake += _amount;
        emit StakeIncreased(_agentId, _amount, agent.stake);
    }

    /**
     * @notice Withdraw stake (with cooldown period)
     */
    function withdrawStake(
        uint256 _agentId,
        uint256 _amount
    ) external nonReentrant {
        Agent storage agent = agents[_agentId];
        require(agent.agentAddress == msg.sender, "Not agent owner");
        require(agent.active, "Agent inactive");
        require(_amount <= agent.stake - minStake, "Would go below min stake");

        agent.stake -= _amount;
        require(reputationToken.transfer(msg.sender, _amount), "Transfer failed");
    }

    /**
     * @notice Slash agent for misbehavior
     * @dev Can be called by IntentManager or dispute resolution contract
     */
    function slashAgent(
        uint256 _agentId,
        string calldata _reason
    ) external onlyOwner {
        Agent storage agent = agents[_agentId];
        require(agent.active, "Agent inactive");

        uint256 slashAmount = (agent.stake * slashPercentage) / 100;
        agent.stake -= slashAmount;
        agent.slashCount++;
        agent.reputation = agent.reputation > 100
            ? agent.reputation - 100
            : 0;

        // Transfer slashed funds to treasury (or burn)
        reputationToken.transfer(owner(), slashAmount);

        // Deactivate if reputation too low or stake below minimum
        if (agent.reputation < 200 || agent.stake < minStake) {
            agent.active = false;
            emit AgentDeactivated(_agentId);
        }

        emit AgentSlashed(_agentId, slashAmount, _reason);
        emit ReputationUpdated(_agentId, agent.reputation);
    }

    /**
     * @notice Update agent reputation (positive)
     */
    function updateReputation(
        uint256 _agentId,
        uint256 _reputationDelta
    ) external onlyOwner {
        Agent storage agent = agents[_agentId];
        agent.reputation += _reputationDelta;
        agent.lastActivity = block.timestamp;

        if (agent.reputation > 10000) {
            agent.reputation = 10000; // Cap at 10000
        }

        agentMetrics[_agentId].completedIntents++;
        emit ReputationUpdated(_agentId, agent.reputation);
    }

    /**
     * @notice Verify ENS name (external oracle or manual verification)
     */
    function verifyENS(
        address _agentAddress,
        bool _verified
    ) external onlyOwner {
        ensVerified[_agentAddress] = _verified;
    }

    // View functions
    function getAgent(
        uint256 _agentId
    ) external view returns (Agent memory) {
        return agents[_agentId];
    }

    function getAgentMetrics(
        uint256 _agentId
    ) external view returns (ReputationMetric memory) {
        return agentMetrics[_agentId];
    }

    function isAgentActive(uint256 _agentId) external view returns (bool) {
        return agents[_agentId].active;
    }
}

