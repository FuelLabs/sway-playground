// We ignore this lint because clippy doesn't like the rocket macro for OPTIONS.
#![allow(clippy::let_unit_value)]
#[macro_use]
extern crate rocket;

mod ai;
mod compilation;
mod cors;
mod error;
mod gist;
mod transpilation;
mod types;
mod util;

use crate::ai::AIService;
use crate::compilation::build_and_destroy_project;
use crate::cors::Cors;
use crate::error::ApiResult;
use crate::gist::GistClient;
use crate::types::{
    CompileRequest, CompileResponse, ErrorAnalysisRequest, ErrorAnalysisResponse, GistResponse, 
    Language, NewGistRequest, NewGistResponse, SwayCodeGenerationRequest, SwayCodeGenerationResponse,
    TranspileRequest,
};
use crate::{transpilation::solidity_to_sway, types::TranspileResponse};
use rocket::serde::json::Json;
use rocket::{State, Request, catch};

/// The endpoint to compile a Sway contract.
#[post("/compile", data = "<request>")]
fn compile(request: Json<CompileRequest>) -> ApiResult<CompileResponse> {
    let response =
        build_and_destroy_project(request.contract.to_string(), request.toolchain.to_string())?;
    Ok(Json(response))
}

/// The endpoint to transpile a contract written in another language into Sway.
#[post("/transpile", data = "<request>")]
fn transpile(request: Json<TranspileRequest>) -> ApiResult<TranspileResponse> {
    let response = match request.contract_code.language {
        Language::Solidity => solidity_to_sway(request.contract_code.contract.to_string()),
    }?;
    Ok(Json(response))
}

/// The endpoint to create a new gist to store the playground editors' code.
#[post("/gist", data = "<request>")]
async fn new_gist(
    request: Json<NewGistRequest>,
    gist: &State<GistClient>,
) -> ApiResult<NewGistResponse> {
    let gist = gist.create(request.into_inner()).await?;
    Ok(Json(NewGistResponse { gist, error: None }))
}

/// The endpoint to fetch a gist.
#[get("/gist/<id>")]
async fn get_gist(id: String, gist: &State<GistClient>) -> ApiResult<GistResponse> {
    let gist_response = gist.get(id).await?;
    Ok(Json(gist_response))
}

/// The endpoint to generate Sway code using AI.
#[post("/ai/generate", data = "<request>")]
async fn generate_sway_code(
    request: Json<SwayCodeGenerationRequest>,
    ai_service: &State<AIService>,
) -> ApiResult<SwayCodeGenerationResponse> {
    let response = ai_service.generate_sway_code(request.into_inner()).await?;
    Ok(Json(response))
}

/// The endpoint to analyze compilation errors using AI.
#[post("/ai/analyze-error", data = "<request>")]
async fn analyze_error(
    request: Json<ErrorAnalysisRequest>,
    ai_service: &State<AIService>,
) -> ApiResult<ErrorAnalysisResponse> {
    let response = ai_service.analyze_error(request.into_inner()).await?;
    Ok(Json(response))
}

/// Catches all OPTION requests in order to get the CORS related Fairing triggered.
#[options("/<_..>")]
fn all_options() {
    // Intentionally left empty
}

// Indicates the service is running
#[get("/health")]
fn health() -> String {
    "true".to_string()
}

// Launch the rocket server.
#[launch]
fn rocket() -> _ {
    // Load environment variables from .env file
    dotenv::dotenv().ok();
    
    let ai_service = AIService::new().expect("Failed to initialize AI service");
    
    rocket::build()
        .manage(GistClient::default())
        .manage(ai_service)
        .attach(Cors)
        .mount(
            "/",
            routes![compile, transpile, new_gist, get_gist, generate_sway_code, analyze_error, all_options, health],
        )
}
