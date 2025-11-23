/**
 * Ollama Integration for Llama 3.2
 * 
 * Connects to local Ollama instance running llama3.2:latest
 */

const OLLAMA_API_URL = process.env.NEXT_PUBLIC_OLLAMA_URL || "http://localhost:11434";

export interface IntentParseResult {
  objective: string;
  constraints: string[];
  riskProfile: "Low" | "Medium" | "High";
  chainsAllowed: string[];
  assetsAllowed: string[];
  amount?: string;
  deadline?: number;
  slippageTolerance?: number;
}

/**
 * Parse natural language intent using Llama 3.2
 */
export async function parseIntentWithLlama(
  intentText: string
): Promise<IntentParseResult> {
  const prompt = `You are an expert at parsing DeFi intents. Parse the following user intent and return a JSON object with the following structure:
{
  "objective": "clear description of what the user wants",
  "constraints": ["constraint1", "constraint2"],
  "riskProfile": "Low" | "Medium" | "High",
  "chainsAllowed": ["Ethereum", "Arbitrum", "Base", etc.],
  "assetsAllowed": ["USDC", "USDT", "ETH", etc.],
  "amount": "amount in tokens (if specified)",
  "deadline": hours until deadline (if specified),
  "slippageTolerance": percentage (if specified)
}

User Intent: "${intentText}"

Return ONLY valid JSON, no other text.`;

  try {
    const response = await fetch(`${OLLAMA_API_URL}/api/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama3.2:latest",
        prompt: prompt,
        stream: false,
        format: "json",
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Parse the response
    let parsed: IntentParseResult;
    
    if (typeof data.response === "string") {
      // Try to extract JSON from response
      const jsonMatch = data.response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found in response");
      }
    } else {
      parsed = data.response;
    }

    // Validate and set defaults
    return {
      objective: parsed.objective || intentText,
      constraints: parsed.constraints || [],
      riskProfile: parsed.riskProfile || "Medium",
      chainsAllowed: parsed.chainsAllowed || ["Ethereum"],
      assetsAllowed: parsed.assetsAllowed || [],
      amount: parsed.amount,
      deadline: parsed.deadline,
      slippageTolerance: parsed.slippageTolerance,
    };
  } catch (error) {
    console.error("Error parsing intent with Llama:", error);
    
    // Fallback to basic parsing
    return {
      objective: intentText,
      constraints: [],
      riskProfile: "Medium",
      chainsAllowed: ["Ethereum"],
      assetsAllowed: [],
    };
  }
}

/**
 * Generate agent strategy using Llama 3.2
 */
export async function generateStrategyWithLlama(
  intent: IntentParseResult,
  availableChains: string[],
  availableAssets: string[]
): Promise<string> {
  const prompt = `You are a DeFi strategy expert. Generate a detailed execution strategy for the following intent:

Objective: ${intent.objective}
Constraints: ${intent.constraints.join(", ")}
Risk Profile: ${intent.riskProfile}
Available Chains: ${availableChains.join(", ")}
Available Assets: ${availableAssets.join(", ")}

Provide a step-by-step strategy in JSON format:
{
  "steps": [
    {
      "chain": "chain name",
      "action": "action description",
      "expectedOutcome": "expected result"
    }
  ],
  "expectedAPY": percentage,
  "estimatedGas": "gas estimate",
  "timeline": hours
}

Return ONLY valid JSON.`;

  try {
    const response = await fetch(`${OLLAMA_API_URL}/api/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama3.2:latest",
        prompt: prompt,
        stream: false,
        format: "json",
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.statusText}`);
    }

    const data = await response.json();
    
    if (typeof data.response === "string") {
      const jsonMatch = data.response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.stringify(JSON.parse(jsonMatch[0]), null, 2);
      }
      return data.response;
    }
    
    return JSON.stringify(data.response, null, 2);
  } catch (error) {
    console.error("Error generating strategy with Llama:", error);
    return JSON.stringify({
      steps: [],
      expectedAPY: 0,
      estimatedGas: "Unknown",
      timeline: 24,
    });
  }
}

/**
 * Check if Ollama is available
 */
export async function checkOllamaConnection(): Promise<boolean> {
  try {
    const response = await fetch(`${OLLAMA_API_URL}/api/tags`, {
      method: "GET",
    });
    return response.ok;
  } catch {
    return false;
  }
}

