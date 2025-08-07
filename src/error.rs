use crate::rate_limiter::RateLimitError;
use crate::types::RateLimitErrorResponse;
use rocket::{
    http::Status,
    response::Responder,
    serde::{json::Json, Serialize},
    Request,
};
use thiserror::Error;

/// A wrapper for API responses that can return errors.
pub type ApiResult<T> = Result<Json<T>, ApiError>;

/// An empty response.
#[derive(Serialize)]
pub struct EmptyResponse;

#[derive(Error, Debug)]
pub enum ApiError {
    #[error("Filesystem error: {0}")]
    Filesystem(String),
    #[error("Charcoal error: {0}")]
    Charcoal(String),
    #[error("GitHub error: {0}")]
    Github(String),
    #[error("AI service error: {0}")]
    Ai(String),
    #[error("Rate limit error: {0}")]
    RateLimit(#[from] RateLimitError),
}

impl<'r, 'o: 'r> Responder<'r, 'o> for ApiError {
    fn respond_to(self, _request: &'r Request<'_>) -> rocket::response::Result<'o> {
        match self {
            ApiError::Filesystem(_) => Err(Status::InternalServerError),
            ApiError::Charcoal(_) => Err(Status::InternalServerError),
            ApiError::Github(_) => Err(Status::InternalServerError),
            ApiError::Ai(_) => Err(Status::InternalServerError),
            ApiError::RateLimit(rate_limit_error) => {
                let RateLimitError::LimitExceeded { limit, reset_time } = rate_limit_error;
                let retry_after = (reset_time - chrono::Utc::now()).num_seconds() as u64;
                let error_response = RateLimitErrorResponse {
                    error: "Rate limit exceeded".to_string(),
                    requests_limit: limit,
                    reset_time,
                    retry_after_seconds: retry_after,
                };

                let json_response = Json(error_response);
                let mut response = json_response.respond_to(_request)?;
                response.set_status(Status::TooManyRequests);
                Ok(response)
            }
        }
    }
}
