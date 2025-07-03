import { GoogleGenerativeAI } from '@google/generative-ai';
import { 
  SwayCodeGenerationRequest, 
  SwayCodeGenerationResponse,
  ErrorAnalysisRequest,
  ErrorAnalysisResponse
} from '../types';

export class AIService {
  private genai: GoogleGenerativeAI | null = null;
  private model: any = null;
  private functionDeclarations: any[] = [];
  private documentationSearchRequired = true;

  constructor(apiKey: string, private mcpService?: any) {
    if (apiKey) {
      this.genai = new GoogleGenerativeAI(apiKey);
      
      this.functionDeclarations = [
        {
          name: "searchDocumentation",
          description: "Search Fuel/Sway documentation for relevant information",
          parameters: {
            type: "object",
            properties: {
              query: {
                type: "string",
                description: "Search query for documentation"
              },
              maxResults: {
                type: "number",
                description: "Maximum number of results to return",
                default: 5
              }
            },
            required: ["query"]
          }
        },
        {
          name: "getRelevantDocumentation",
          description: "Get relevant documentation context for a specific topic or code",
          parameters: {
            type: "object",
            properties: {
              topic: {
                type: "string",
                description: "The topic or code to get relevant documentation for"
              }
            },
            required: ["topic"]
          }
        }
      ];

      this.model = this.genai.getGenerativeModel({ 
        model: "gemini-2.5-flash-preview-05-20",
        tools: [{ functionDeclarations: this.functionDeclarations }],
        toolConfig: {
          functionCallingConfig: {
            mode: "auto" as any
          }
        },
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 8192,
        }
      });
    }
  }

  private isAvailable(): boolean {
    return this.genai !== null && this.model !== null;
  }

  public setMCPService(mcpService: any): void {
    this.mcpService = mcpService;
  }


  async generateSwayCode(request: SwayCodeGenerationRequest): Promise<SwayCodeGenerationResponse> {
    if (!this.isAvailable()) {
      throw new Error('AI service not available. Please check your API key configuration.');
    }

    const systemPrompt = `You are an expert Sway smart contract developer. Generate secure, efficient Sway contracts.

MANDATORY: ALWAYS call 'searchDocumentation' BEFORE generating code.

SWAY SYNTAX ESSENTIALS:
- Contract: 'contract;'
- ABI: 'abi ContractName { ... }' 
- Storage: 'storage { field: Type = default_value, }' (trailing comma required)
- Implementation: 'impl AbiName for Contract { ... }'
- Storage access: '#[storage(read)]' or '#[storage(read, write)]' on both ABI and implementation 
- Payable: '#[payable]' on both ABI and implementation
- StorageMap: storage.map.get(key).try_read().unwrap_or(0)
- Validation: assert(condition) or require(condition, "message")
- Identity: Identity::Address(addr)
- No need to import AssetId - Included in prelude.


IMPORTS:
- use std::{asset::{mint_to, transfer}, call_frames::msg_asset_id, context::msg_amount, auth::msg_sender, block::timestamp, asset::transfer};
- use standards::{src3::SRC3, src5::SRC5, src20::SRC20};

FALLBACK: If documentation search fails, direct users to docs.fuel.network/docs/sway/`;

    const userPrompt = `Generate a Sway smart contract for: ${request.prompt}

STEPS:
1. Call 'searchDocumentation' with relevant keywords
2. Generate complete, working Sway contract code
3. Provide brief explanation

SEARCH KEYWORDS:
- Tokens: "SRC20", "token", "mint", "transfer"
- NFTs: "SRC3", "NFT" 
- Access control: "SRC5", "ownership"
- DeFi: "asset management", "swap"
- Basic: "contract", "storage", "functions"`
    try {
      const result = await this.model.generateContent({
        contents: [{
          role: "user",
          parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }]
        }]
      });

      const response = result.response;
      const functionCalls = response.functionCalls();
      
      if (functionCalls && functionCalls.length > 0) {

        const functionResponses = await Promise.all(
          functionCalls.map(async (call: any) => {
            return await this.handleFunctionCall(call);
          })
        );
        
        const followUpContents = [
          { role: "user", parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }] },
          { role: "model", parts: response.candidates[0].content.parts },
          { 
            role: "function", 
            parts: functionResponses.map((resp, index) => ({
              functionResponse: {
                name: functionCalls[index].name,
                response: resp
              }
            }))
          }
        ];
        
        const followUpResult = await this.model.generateContent({
          contents: followUpContents
        });
        
        const followUpText = followUpResult.response.text();
        if (!followUpText?.trim()) {
          throw new Error('AI response was empty. Please try again with a more specific prompt.');
        }
        
        return this.parseCodeGenerationResponse(followUpText);
      } else {
        const response_text = response.text();
        return this.parseCodeGenerationResponse(response_text);
      }
    } catch (error) {
      console.error('AI code generation error:', error);
      throw new Error('Failed to generate Sway code. Please try again.');
    }
  }


  async analyzeError(request: ErrorAnalysisRequest): Promise<ErrorAnalysisResponse> {
    if (!this.isAvailable()) {
      throw new Error('AI service not available. Please check your API key configuration.');
    }

    const systemPrompt = `You are an expert Sway compiler error analyst. Fix Sway compilation errors with accurate, working code.

MANDATORY: Always call 'searchDocumentation' before analyzing errors. Go one by one and fix errors. 

CRITICAL SWAY SYNTAX RULES:
1. Context imports: use std::{context::{msg_sender, msg_amount}, call_frames::msg_asset_id};
2. Storage syntax: storage { field: Type = default_value, } (trailing comma required)
3. Validation: Use assert() not require()
4. Identity type: Identity::Address(addr) for addresses
5. ABI functions: Must match impl exactly
6. Storage attributes: #[storage(read)] or #[storage(read, write)]

IMPORTANT CORRECTIONS:
- Identity::zero() is NOT a method. Use Identity::Address(Address::zero()).
- Option pattern-match limitation:
  // GOOD
  if storage.highest_bidder.read().is_some() { … }
  // BAD (will not compile)  
  if let Option::Some(x) = storage.highest_bidder.read() { … }
- assert has ONE parameter; use require for message strings.
- Never import or call transfer_inner; only transfer() is public.
- Always unwrap msg_sender() once:
  let sender = msg_sender().expect("unauthenticated");
- Built-ins for time & value:
  msg_amount()        // std::context
  block_timestamp()   // std::context
  Never import them from anywhere else.
- There is NO transfer_to_contract.
  To move tokens into the contract, call
  transfer(this_contract_id(), asset_id, amount);
- Do NOT import StorageMap.
  Just use it inside the storage { … } block, e.g.
  sales: StorageMap<u64, Auction> = StorageMap {},
  and access via storage.sales.
- Replace unwrap_or_revert("msg") ➜ expect("msg") (same semantics).
- self is a *type parameter* in Sway ABIs, not a variable.
  Call sibling fns directly:
  let price = get_current_auction_price(id);

COMMON ERROR FIXES:
- "No storage has been declared"
  - insert a storage { … } block and ensure every .read() / .write() target is declared there.
- "symbol transfer_inner / msg_amount / block_height not found"
  - remove the bad import; use the std::context versions shown above.
- "Identity::zero() not found" - replace with Identity::Address(Address::zero()).
- "Option::Some cannot be matched" - read into a variable and use .is_some() / .unwrap() instead of pattern matching.
- "assert expects 1 argument" - change to require(cond,"msg").
- "No method .write / .read" - make sure the field is declared as a StorageValue (or StorageMap) and the type matches exactly.
- "Could not find symbol transfer_to_contract / msg_amount / block_timestamp"
  - Use the import list shown above and call transfer(this_contract_id(), …).
- "Mismatched types – expected Identity, found u64"
  - Your parameter order in transfer is wrong.
    Correct: (to: Identity, asset_id: AssetId, amount: u64)
- "Function assert expects 1 argument"
  - change to require(condition, "explanation")
- "Option::Some cannot be matched"
  - use .is_some() / .unwrap() instead of pattern matching.
- "unwrap_or_revert not found"
  - use .expect("msg") (same effect).
- "Field access requires a struct"
  - The storage field or local struct wasn't declared; verify your
    Auction struct and storage map types.
- "cannot find msg_sender": Add use std::auth::msg_sender;
- "cannot find assert": Use assert() instead of require()
- "type mismatch Identity": Use Identity::Address(addr)
- "storage field not found": Check storage block syntax
- "ABI mismatch": Ensure impl matches abi exactly
    - insert: storage.my_map.insert(key, value);
    - read  : storage.my_map.get(key).try_read().unwrap_or(default);
- Nested map read/write:
    storage.nested.get(k1).insert(k2, v);                // write
    let v = storage.nested.get(k1).get(k2).try_read();   // read

PROVEN SWAY PATTERNS:
- Basic contract structure:
  contract;
  use std::context::msg_sender;
  abi MyContract { fn my_function(); }
  impl MyContract for Contract { fn my_function() { } }

- Storage with validation:
  storage { owner: Identity = Identity::Address(Address::zero()), }
  #[storage(read)] fn get_owner() -> Identity { storage.owner.read() }

- Asset operations:
  use std::{context::msg_amount, call_frames::msg_asset_id};
  assert(msg_amount() > 0);

- "No method unwrap_or(StorageKey…, numeric)"  
     - Insert .try_read() before unwrap_or.

- "add / subtract / ge … for type {unknown}"  
     - Ensure the variable is a u64 by calling .try_read().unwrap_or(0).

- "msg_sender not found"  
     - use std::auth::msg_sender; and drop the .unwrap().

- "assert expects 1 argument"  
     - Change to require(cond, "reason") **or** use the 1-arg
       assert(cond) form.

- "function in ABI is pure but impl is not"  
     - Copy the #[storage(...)] attribute to the ABI signature.

RESPONSE FORMAT:
1. Identify the specific error type
2. Apply the correct Sway syntax fix using proven patterns
3. Return complete working code in \`\`\`sway block

CRITICAL: Only change what's broken. Use exact syntax from proven patterns above.`;

    const userPrompt = `Fix this Sway compilation error by applying ONLY the necessary changes:

ERROR: ${request.errorMessage}

CURRENT CODE:
\`\`\`sway
${request.sourceCode}
\`\`\`

INSTRUCTIONS:
1. Search documentation for this specific error
2. Identify the exact issue causing the error
3. Apply MINIMAL fixes - change only what's broken
4. Keep all working code unchanged
5. Return the complete corrected contract

CRITICAL: Return the entire corrected Sway contract in a \`\`\`sway code block. Fix ONLY the error, don't refactor working code.`;

    try {
      const result = await this.model.generateContent({
        contents: [{
          role: "user",
          parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }]
        }]
      });

      const response = result.response;
      const functionCalls = response.functionCalls();
      
      if (functionCalls && functionCalls.length > 0) {
        const hasDocumentationSearch = functionCalls.some((call: any) => 
          call.name === 'searchDocumentation' || call.name === 'getRelevantDocumentation'
        );
        
        if (!hasDocumentationSearch && this.documentationSearchRequired) {
          console.warn('Error analysis proceeded without mandatory documentation search');
        }

        const functionResponses = await Promise.all(
          functionCalls.map(async (call: any) => {
            return await this.handleFunctionCall(call);
          })
        );

        const followUpResult = await this.model.generateContent({
          contents: [
            { role: "user", parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }] },
            { role: "model", parts: response.candidates[0].content.parts },
            { 
              role: "function", 
              parts: functionResponses.map((resp, index) => ({
                functionResponse: {
                  name: functionCalls[index].name,
                  response: resp
                }
              }))
            }
          ]
        });
        
        return this.parseErrorAnalysisResponse(followUpResult.response.text());
      } else {
        console.warn('No function calls made for error analysis - documentation search was not attempted');
        const response_text = response.text();
        const parsed = this.parseErrorAnalysisResponse(response_text);
        
        parsed.analysis += '\n\n⚠️ Note: Documentation search was not available. For more accurate error diagnosis, please check docs.fuel.network/docs/sway/reference/ for compiler messages and syntax reference.';
        
        return parsed;
      }
    } catch (error) {
      console.error('AI error analysis error:', error);
      throw new Error('Failed to analyze error. Please try again.');
    }
  }


  private async handleFunctionCall(call: any): Promise<any> {
    try {
      switch (call.name) {
        case 'searchDocumentation':
          if (this.mcpService && this.mcpService.isAvailable()) {
            const result = await this.mcpService.searchDocs(call.args);
            if (typeof result === 'string' && result.length > 2000) {
              return result.substring(0, 2000) + '\n... (truncated for brevity)';
            }
            if (result && typeof result === 'object' && result.results) {
              const limitedResults = result.results.slice(0, 3).map((r: any) => ({
                ...r,
                content: r.content?.substring(0, 500) + (r.content?.length > 500 ? '...' : '')
              }));
              return { ...result, results: limitedResults };
            }
            return result;
          }
          return { 
            error: 'MCP not available',
            fallback: `Check docs.fuel.network for "${call.args.query}"`
          };
          
        case 'getRelevantDocumentation':
          if (this.mcpService && this.mcpService.isAvailable()) {
            const result = await this.mcpService.getRelevantDocs(call.args.topic);
            if (typeof result === 'string' && result.length > 1500) {
              return { context: result.substring(0, 1500) + '... (truncated)' };
            }
            return { context: result };
          }
          return { 
            error: 'MCP not available',
            fallback: `Check docs.fuel.network for "${call.args.topic}"`
          };
          
        default:
          return { error: `Unknown function: ${call.name}` };
      }
    } catch (error) {
      console.error(`Function call error (${call.name}):`, error);
      return { 
        error: `Failed to execute ${call.name}`,
        fallback: `Check docs.fuel.network manually.`
      };
    }
  }

  private parseCodeGenerationResponse(response: string): SwayCodeGenerationResponse {
    const codeMatch = response.match(/```(?:sway|rust)?\n([\s\S]*?)```/);
    const code = codeMatch ? codeMatch[1].trim() : response;
    
    const explanation = response.replace(/```(?:sway|rust)?\n[\s\S]*?```/g, '').trim();
    
    if (!code || code.length === 0) {
      console.warn('⚠️ EMPTY CODE DETECTED');
    }
    
    const result = {
      code,
      explanation: explanation || "Generated Sway smart contract",
      suggestions: [
        "Review the generated code for your specific requirements",
        "Test the contract thoroughly before deployment",
        "Consider gas optimization for complex operations"
      ]
    };
    
    return result;
  }

  private parseErrorAnalysisResponse(response: string): ErrorAnalysisResponse {
    const codeMatch = response.match(/```(?:sway|rust)?\n([\s\S]*?)```/);
    let fixedCode = codeMatch ? codeMatch[1].trim() : undefined;
    
    if (!fixedCode && response.length > 0) {
      const partialCodeMatch = response.match(/```(?:sway|rust)?\n([\s\S]*?)$/);
      if (partialCodeMatch) {
        fixedCode = partialCodeMatch[1].trim();
      }
    }
    
    let analysis = response;
    if (!fixedCode) {
      console.warn('No fixed code found in AI response');
      analysis += '\n\n**Incomplete Response**: The AI response was truncated and does not contain the complete fixed code. Please try again or manually apply the suggested fixes.';
    }
    
    return {
      analysis,
      suggestions: [
        "Verify the fix addresses the root cause",
        "Check for similar patterns in your code",
        "Consider adding tests to prevent regression"
      ],
      fixedCode
    };
  }
}