use crate::error::ApiError;
use crate::types::{
    ErrorAnalysisRequest, ErrorAnalysisResponse, SwayCodeGenerationRequest,
    SwayCodeGenerationResponse,
};
use gemini_rust::{
    Content, FunctionCallingMode, FunctionDeclaration, FunctionParameters, Gemini,
    GenerationConfig, PropertyDetails, Role,
};
use serde_json::{json, Value};
use std::env;

pub struct AIService {
    client: Option<Gemini>,
    mcp_server_url: Option<String>,
    http_client: reqwest::Client,
}

#[derive(serde::Deserialize)]
struct MCPResponse {
    result: Option<Value>,
    error: Option<MCPError>,
}

#[derive(serde::Deserialize)]
struct MCPError {
    message: String,
}

#[derive(serde::Deserialize)]
struct MCPToolResponse {
    content: Vec<MCPContent>,
}

#[derive(serde::Deserialize)]
struct MCPContent {
    text: Option<String>,
    content: Option<String>,
}

impl AIService {
    pub fn new() -> Result<Self, ApiError> {
        let api_key = env::var("GEMINI_API_KEY").ok();
        let mcp_server_url = env::var("MCP_SERVER_URL").ok();

        let client =
            api_key.map(|key| Gemini::with_model(key, "models/gemini-2.5-flash".to_string()));
        let http_client = reqwest::Client::new();

        Ok(AIService {
            client,
            mcp_server_url,
            http_client,
        })
    }

    pub fn is_ai_available(&self) -> bool {
        self.client.is_some()
    }

    pub fn is_mcp_available(&self) -> bool {
        self.mcp_server_url.is_some()
    }

    pub async fn generate_sway_code(
        &self,
        request: SwayCodeGenerationRequest,
    ) -> Result<SwayCodeGenerationResponse, ApiError> {
        if !self.is_ai_available() {
            return Err(ApiError::Ai(
                "AI service not available. Please configure GEMINI_API_KEY.".to_string(),
            ));
        }

        let system_prompt = self.get_code_generation_prompt();
        let user_prompt = format!(
            "Generate a Sway smart contract for: {}\n\nSTEPS:\n1. Call 'searchDocumentation' to find relevant examples\n2. Generate complete, working Sway contract code\n3. Provide brief explanation\n\nRequired features for common patterns:\n- Tokens: SRC20 standard\n- NFTs: SRC3 standard\n- Access control: SRC5 standard\n- Basic: contract structure, storage, functions",
            request.prompt
        );

        let client = self.client.as_ref().unwrap();

        if self.is_mcp_available() {
            let functions = self.create_function_declarations();
            let mut request_builder = client.generate_content();
            request_builder =
                request_builder.with_user_message(format!("{}\n\n{}", system_prompt, user_prompt));

            for function in functions.iter() {
                request_builder = request_builder.with_function(function.clone());
            }

            let response = request_builder
                .execute()
                .await
                .map_err(|e| ApiError::Ai(format!("Gemini API error: {}", e)))?;

            let function_calls = response.function_calls();
            if !function_calls.is_empty() {
                let mut function_responses = Vec::new();
                for function_call in function_calls.iter() {
                    let function_response =
                        self.handle_function_call_response(function_call).await?;
                    function_responses.push((function_call, function_response));
                }

                let mut final_request = client
                    .generate_content()
                    .with_user_message(format!("{}\n\n{}", system_prompt, user_prompt));

                final_request
                    .contents
                    .push(response.candidates[0].content.clone());

                let mut function_content = Content { role: Some(Role::Function), ..Default::default() };

                for (function_call, function_response) in function_responses {
                    let response_content = Content::function_response_json(
                        function_call.name.clone(),
                        function_response,
                    );
                    function_content.parts.extend(response_content.parts);
                }

                final_request.contents.push(function_content);

                let final_response = final_request
                    .execute()
                    .await
                    .map_err(|e| ApiError::Ai(format!("Gemini API error: {}", e)))?;

                self.parse_code_generation_response(&final_response.text())
            } else {
                self.parse_code_generation_response(&response.text())
            }
        } else {
            let response = client
                .generate_content()
                .with_user_message(format!("{}\n\n{}", system_prompt, user_prompt))
                .execute()
                .await
                .map_err(|e| ApiError::Ai(format!("Gemini API error: {}", e)))?;

            self.parse_code_generation_response(&response.text())
        }
    }

    pub async fn analyze_error(
        &self,
        request: ErrorAnalysisRequest,
    ) -> Result<ErrorAnalysisResponse, ApiError> {
        if !self.is_ai_available() {
            return Err(ApiError::Ai(
                "AI service not available. Please configure GEMINI_API_KEY.".to_string(),
            ));
        }

        let system_prompt = self.get_error_analysis_prompt();
        let user_prompt = format!(
            "Fix this Sway compilation error by applying ONLY the necessary changes:\n\nERROR: {}\n\nCURRENT CODE:\n```sway\n{}\n```\n\nINSTRUCTIONS:\n1. If there are multiple errors, call 'searchDocumentation' for EACH DISTINCT error type\n2. Search documentation for each specific error pattern\n3. Identify the exact issue causing each error\n4. Apply MINIMAL fixes - change only what's broken\n5. Keep all working code unchanged\n6. Return the complete corrected contract\n\nCRITICAL: Return the entire corrected Sway contract in a ```sway code block. Fix ONLY the errors, don't refactor working code.",
            request.error_message, request.source_code
        );

        let client = self.client.as_ref().unwrap();

        if self.is_mcp_available() {
            let functions = self.create_function_declarations();
            let mut request_builder = client
                .generate_content()
                .with_user_message(format!("{}\n\n{}", system_prompt, user_prompt))
                .with_function_calling_mode(FunctionCallingMode::Any)
                .with_generation_config(GenerationConfig {
                    temperature: Some(0.7),
                    top_p: Some(0.95),
                    top_k: Some(40),
                    max_output_tokens: Some(8192),
                    candidate_count: Some(1),
                    stop_sequences: Some(vec!["END".to_string()]),
                    response_mime_type: None,
                    response_schema: None,
                });

            for function in &functions {
                request_builder = request_builder.with_function(function.clone());
            }

            let response = request_builder
                .execute()
                .await
                .map_err(|e| ApiError::Ai(format!("Gemini API error: {}", e)))?;

            let function_calls = response.function_calls();

            if !function_calls.is_empty() {
                let mut function_responses = Vec::new();
                for function_call in function_calls.iter() {
                    let function_response =
                        self.handle_function_call_response(function_call).await?;
                    function_responses.push((function_call, function_response));
                }

                let mut final_request = client
                    .generate_content()
                    .with_user_message(format!("{}\n\n{}", system_prompt, user_prompt));

                final_request
                    .contents
                    .push(response.candidates[0].content.clone());

                let mut function_content = Content { role: Some(Role::Function), ..Default::default() };

                for (function_call, function_response) in function_responses.into_iter() {
                    let response_content = Content::function_response_json(
                        function_call.name.clone(),
                        function_response,
                    );
                    function_content.parts.extend(response_content.parts);
                }

                final_request.contents.push(function_content);

                let final_response = final_request
                    .execute()
                    .await
                    .map_err(|e| ApiError::Ai(format!("Gemini API error: {}", e)))?;

                self.parse_error_analysis_response(&final_response.text())
            } else {
                self.parse_error_analysis_response(&response.text())
            }
        } else {
            let response = client
                .generate_content()
                .with_user_message(format!("{}\n\n{}", system_prompt, user_prompt))
                .execute()
                .await
                .map_err(|e| ApiError::Ai(format!("Gemini API error: {}", e)))?;

            self.parse_error_analysis_response(&response.text())
        }
    }

    fn create_function_declarations(&self) -> Vec<FunctionDeclaration> {
        vec![
            FunctionDeclaration::new(
                "searchDocumentation",
                "Search Fuel/Sway documentation for relevant information",
                FunctionParameters::object()
                    .with_property(
                        "query",
                        PropertyDetails::string("Search query for documentation"),
                        true,
                    )
                    .with_property(
                        "maxResults",
                        PropertyDetails::number("Maximum number of results to return"),
                        false,
                    ),
            ),
            FunctionDeclaration::new(
                "getRelevantDocumentation",
                "Get relevant documentation context for a specific topic or code",
                FunctionParameters::object().with_property(
                    "topic",
                    PropertyDetails::string("The topic or code to get relevant documentation for"),
                    true,
                ),
            ),
        ]
    }

    async fn handle_function_call_response(
        &self,
        function_call: &gemini_rust::FunctionCall,
    ) -> Result<Value, ApiError> {
        match function_call.name.as_str() {
            "searchDocumentation" => self.search_mcp_docs(function_call).await,
            "getRelevantDocumentation" => self.get_relevant_docs(function_call).await,
            _ => Ok(json!({
                "error": format!("Unknown function: {}", function_call.name)
            })),
        }
    }

    async fn search_mcp_docs(
        &self,
        function_call: &gemini_rust::FunctionCall,
    ) -> Result<Value, ApiError> {
        let _mcp_url = match &self.mcp_server_url {
            Some(url) => url,
            None => {
                return Ok(json!({
                    "error": "MCP server not configured",
                    "fallback": "Check docs.fuel.network/docs/sway/ for documentation"
                }))
            }
        };

        let query: String = function_call
            .get("query")
            .unwrap_or_else(|_| "sway".to_string());

        let max_results: u64 = function_call.get("maxResults").unwrap_or(5);

        self.search_mcp_docs_internal(query, max_results).await
    }

    async fn get_relevant_docs(
        &self,
        function_call: &gemini_rust::FunctionCall,
    ) -> Result<Value, ApiError> {
        let topic: String = function_call
            .get("topic")
            .unwrap_or_else(|_| "sway".to_string());

        // Create a direct search for the topic
        let search_result = self.search_mcp_docs_by_query(topic, 3).await?;

        if let Some(results) = search_result.get("results").and_then(|r| r.as_array()) {
            let context = results
                .iter()
                .filter_map(|r| r.get("content").and_then(|c| c.as_str()))
                .collect::<Vec<_>>()
                .join("\n\n");

            Ok(json!({ "context": context }))
        } else {
            Ok(json!({
                "error": "No relevant documentation found",
                "fallback": "Check docs.fuel.network/docs/sway/ for documentation"
            }))
        }
    }

    async fn search_mcp_docs_by_query(
        &self,
        query: String,
        max_results: u64,
    ) -> Result<Value, ApiError> {
        // Just delegate to the main search function which handles SSE properly
        self.search_mcp_docs_internal(query, max_results).await
    }

    async fn search_mcp_docs_internal(
        &self,
        query: String,
        max_results: u64,
    ) -> Result<Value, ApiError> {
        let mcp_url = match &self.mcp_server_url {
            Some(url) => url,
            None => {
                return Ok(json!({
                    "error": "MCP server not configured",
                    "fallback": "Check docs.fuel.network/docs/sway/ for documentation"
                }))
            }
        };

        let request_body = json!({
            "jsonrpc": "2.0",
            "id": 1,
            "method": "tools/call",
            "params": {
                "name": "searchFuelDocs",
                "arguments": {
                    "query": query,
                    "maxResults": max_results
                }
            }
        });

        let response_result = self
            .http_client
            .post(mcp_url)
            .header("Content-Type", "application/json")
            .header("Accept", "application/json, text/event-stream")
            .json(&request_body)
            .send()
            .await;

        match response_result {
            Ok(response) => {
                if response.status().is_success() {
                    let response_text = response
                        .text()
                        .await
                        .map_err(|e| ApiError::Ai(format!("Failed to get response text: {}", e)))?;

                    let json_data = if response_text.starts_with("event:") {
                        response_text
                            .lines()
                            .find(|line| line.starts_with("data: "))
                            .and_then(|line| line.strip_prefix("data: "))
                            .unwrap_or(&response_text)
                    } else {
                        &response_text
                    };

                    let mcp_response: MCPResponse =
                        serde_json::from_str(json_data).map_err(|e| {
                            ApiError::Ai(format!("Failed to parse MCP response: {}", e))
                        })?;

                    if let Some(error) = mcp_response.error {
                        Ok(json!({
                            "error": error.message,
                            "fallback": "Check docs.fuel.network/docs/sway/ for documentation"
                        }))
                    } else if let Some(result) = mcp_response.result {
                        if let Ok(tool_response) =
                            serde_json::from_value::<MCPToolResponse>(result.clone())
                        {
                            let results: Vec<Value> = tool_response
                                .content
                                .into_iter()
                                .take(3)
                                .map(|content| {
                                    let text = content
                                        .text
                                        .clone()
                                        .or(content.content.clone())
                                        .unwrap_or_else(|| "No content".to_string());
                                    let truncated = if text.len() > 500 {
                                        text.chars().take(500).collect::<String>() + "..."
                                    } else {
                                        text
                                    };
                                    json!({
                                        "title": "Documentation",
                                        "content": truncated
                                    })
                                })
                                .collect();

                            Ok(json!({ "results": results }))
                        } else {
                            Ok(json!({
                                "error": "Invalid MCP response format",
                                "fallback": "Check docs.fuel.network/docs/sway/ for documentation"
                            }))
                        }
                    } else {
                        Ok(json!({
                            "error": "Empty MCP response",
                            "fallback": "Check docs.fuel.network/docs/sway/ for documentation"
                        }))
                    }
                } else {
                    Ok(json!({
                        "error": format!("MCP server error: {}", response.status()),
                        "fallback": "Check docs.fuel.network/docs/sway/ for documentation"
                    }))
                }
            }
            Err(e) => Ok(json!({
                "error": format!("Failed to connect to MCP server: {}", e),
                "fallback": "Check docs.fuel.network/docs/sway/ for documentation"
            })),
        }
    }

    fn parse_code_generation_response(
        &self,
        response: &str,
    ) -> Result<SwayCodeGenerationResponse, ApiError> {
        let code_regex = regex::Regex::new(r"```(?:sway|rust)?\n([\s\S]*?)```").unwrap();
        let code = code_regex
            .captures(response)
            .and_then(|caps| caps.get(1))
            .map(|m| m.as_str().trim().to_string())
            .unwrap_or_else(|| response.to_string());

        let explanation = code_regex.replace_all(response, "").trim().to_string();
        let explanation = if explanation.is_empty() {
            "Generated Sway smart contract".to_string()
        } else {
            explanation
        };

        Ok(SwayCodeGenerationResponse {
            code,
            explanation,
            suggestions: vec![
                "Review the generated code for your specific requirements".to_string(),
                "Test the contract thoroughly before deployment".to_string(),
                "Consider gas optimization for complex operations".to_string(),
            ],
        })
    }

    fn parse_error_analysis_response(
        &self,
        response: &str,
    ) -> Result<ErrorAnalysisResponse, ApiError> {
        let code_regex = regex::Regex::new(r"```(?:sway|rust)?\n([\s\S]*?)```").unwrap();
        let fixed_code = code_regex
            .captures(response)
            .and_then(|caps| caps.get(1))
            .map(|m| m.as_str().trim().to_string());

        Ok(ErrorAnalysisResponse {
            analysis: response.to_string(),
            suggestions: vec![
                "Verify the fix addresses the root cause".to_string(),
                "Check for similar patterns in your code".to_string(),
                "Consider adding tests to prevent regression".to_string(),
            ],
            fixed_code,
        })
    }

    fn get_code_generation_prompt(&self) -> String {
        r#"You are an expert Sway smart contract developer. Generate secure, efficient Sway contracts.

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

FALLBACK: If documentation search fails, direct users to docs.fuel.network/docs/sway/"#.to_string()
    }

    fn get_error_analysis_prompt(&self) -> String {
        r#"You are an expert Sway compiler error analyst. Fix Sway compilation errors with accurate, working code.

MANDATORY: Always call 'searchDocumentation' before analyzing errors. Go one by one and fix errors.

CRITICAL SWAY SYNTAX RULES:
1. Context imports: use std::{context::msg_amount, auth::msg_sender, call_frames::msg_asset_id};
2. Storage syntax: storage { field: Type = default_value, } (trailing comma required)
3. Validation: Use assert() not require()
4. Identity type: Identity::Address(addr) for addresses
5. ABI functions: Must match impl exactly
6. Storage attributes: #[storage(read)] or #[storage(read, write)]

IMPORTANT CORRECTIONS:
- Identity::zero() is NOT a method. Use Identity::Address(Address::zero()).
- Option pattern-match limitation:
- GOOD:
     if storage.highest_bidder.read().is_some() { … }
- BAD (will not compile):
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
  To move tokens into the contract, call:
  transfer(this_contract_id(), asset_id, amount);
- Do NOT import StorageMap.
  Just use it inside the storage { … } block, e.g.
  sales: StorageMap<u64, Auction> = StorageMap {},
  and access via storage.sales.
- Replace unwrap_or_revert("msg") with expect("msg") (same semantics).
- self is a *type parameter* in Sway ABIs, not a variable.
  Call sibling fns directly:
  let price = get_current_auction_price(id);

COMMON ERROR FIXES:
- "No storage has been declared"
  insert a storage { … } block and ensure every .read() / .write() target is declared there.
- "symbol transfer_inner / msg_amount / block_height not found"
  remove the bad import; use the std::context versions shown above.
- "Identity::zero() not found" replace with Identity::Address(Address::zero()).
- "Option::Some cannot be matched" read into a variable and use .is_some() / .unwrap() instead of pattern matching.
- "assert expects 1 argument" change to require(cond,"msg").
- "No method .write / .read" make sure the field is declared as a StorageValue (or StorageMap) and the type matches exactly.
- "Could not find symbol transfer_to_contract / msg_amount / block_timestamp"
  Use the import list shown above and call transfer(this_contract_id(), …).
- "Mismatched types – expected Identity, found u64"
  Your parameter order in transfer is wrong.
    Correct: (to: Identity, asset_id: AssetId, amount: u64)
- "Function assert expects 1 argument"
  change to require(condition, "explanation")
- "Option::Some cannot be matched"
  use .is_some() / .unwrap() instead of pattern matching.
- "unwrap_or_revert not found"
  use .expect("msg") (same effect).
- "Field access requires a struct"
  The storage field or local struct wasn't declared; verify your
    Auction struct and storage map types.
- "cannot find msg_sender": Add use std::auth::msg_sender;
- "cannot find assert": Use assert() instead of require()
- "type mismatch Identity": Use Identity::Address(addr)
- "storage field not found": Check storage block syntax
- "ABI mismatch": Ensure impl matches abi exactly
- StorageMap operations:
  insert: storage.my_map.insert(key, value);
  read  : storage.my_map.get(key).try_read().unwrap_or(default);
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

ADDITIONAL ERROR FIXES:
- "No method unwrap_or(StorageKey…, numeric)"
  Insert .try_read() before unwrap_or.
- "add / subtract / ge … for type {unknown}"
  Ensure the variable is a u64 by calling .try_read().unwrap_or(0).
- "msg_sender not found"
  use std::auth::msg_sender; and drop the .unwrap().
- "assert expects 1 argument"
  Change to require(cond, "reason") **or** use the 1-arg assert(cond) form.
- "function in ABI is pure but impl is not"
  Copy the #[storage(...)] attribute to the ABI signature.

RESPONSE FORMAT:
1. Identify the specific error type
2. Apply the correct Sway syntax fix using proven patterns
3. Return complete working code in \`\`\`sway block

CRITICAL: Only change what's broken. Use exact syntax from proven patterns above."#.to_string()
    }
}
