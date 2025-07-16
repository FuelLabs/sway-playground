use chrono::{DateTime, Utc};
use dashmap::DashMap;
use rocket::request::{FromRequest, Outcome};
use rocket::{http::Status, Request, State};
use std::env;
use std::net::IpAddr;
use std::str::FromStr;
use std::sync::Arc;
use std::time::Duration;
use tokio::time::interval;
use crate::types::RateLimitStatus;

const DAY_SECONDS: u64 = 86400;

#[derive(Debug, Clone)]
pub struct RateLimitConfig {
    pub requests_per_day: u32,
    pub cleanup_interval_minutes: u64,
}

impl Default for RateLimitConfig {
    fn default() -> Self {
        Self {
            requests_per_day: 20,
            cleanup_interval_minutes: 60,
        }
    }
}

impl RateLimitConfig {
    pub fn from_env() -> Self {
        let requests_per_day = env::var("RATE_LIMIT_REQUESTS_PER_DAY")
            .ok()
            .and_then(|v| v.parse().ok())
            .unwrap_or(20);

        let cleanup_interval_minutes = env::var("RATE_LIMIT_CLEANUP_INTERVAL_MINUTES")
            .ok()
            .and_then(|v| v.parse().ok())
            .unwrap_or(10);

        Self {
            requests_per_day,
            cleanup_interval_minutes,
        }
    }
}

#[derive(Debug, Clone)]
struct RequestRecord {
    count: u32,
    window_start: DateTime<Utc>,
}

impl RequestRecord {
    fn new() -> Self {
        Self {
            count: 0,
            window_start: Utc::now(),
        }
    }

    fn reset_if_expired(&mut self) -> bool {
        let now = Utc::now();
        let elapsed = now.signed_duration_since(self.window_start);
        
        if elapsed.num_seconds() > DAY_SECONDS as i64 {
            self.count = 0;
            self.window_start = now;
            true
        } else {
            false
        }
    }
}

pub struct RateLimiter {
    storage: Arc<DashMap<IpAddr, RequestRecord>>,
    config: RateLimitConfig,
}

impl RateLimiter {
    pub fn new(config: RateLimitConfig) -> Self {
        let storage = Arc::new(DashMap::new());
        
        let limiter = Self {
            storage: storage.clone(),
            config: config.clone(),
        };

        limiter.start_cleanup_task();
        limiter
    }

    pub fn check_rate_limit(&self, ip: IpAddr) -> Result<(), RateLimitError> {
        let mut entry = self.storage.entry(ip).or_insert_with(RequestRecord::new);
        
        entry.reset_if_expired();
        
        if entry.count < self.config.requests_per_day {
            entry.count += 1;
            Ok(())
        } else {
            let reset_time = entry.window_start + chrono::Duration::seconds(DAY_SECONDS as i64);
            Err(RateLimitError::LimitExceeded {
                limit: self.config.requests_per_day,
                reset_time,
            })
        }
    }

    pub fn get_rate_limit_status(&self, ip: IpAddr) -> RateLimitStatus {
        if let Some(entry) = self.storage.get(&ip) {
            let now = Utc::now();
            let elapsed = now.signed_duration_since(entry.window_start);
            
            if elapsed.num_seconds() > DAY_SECONDS as i64 {
                RateLimitStatus {
                    requests_remaining: self.config.requests_per_day,
                    requests_limit: self.config.requests_per_day,
                    reset_time: None,
                    window_duration_seconds: DAY_SECONDS,
                }
            } else {
                let remaining = if entry.count >= self.config.requests_per_day {
                    0
                } else {
                    self.config.requests_per_day - entry.count
                };

                let reset_time = entry.window_start + chrono::Duration::seconds(DAY_SECONDS as i64);

                RateLimitStatus {
                    requests_remaining: remaining,
                    requests_limit: self.config.requests_per_day,
                    reset_time: Some(reset_time),
                    window_duration_seconds: DAY_SECONDS,
                }
            }
        } else {
            RateLimitStatus {
                requests_remaining: self.config.requests_per_day,
                requests_limit: self.config.requests_per_day,
                reset_time: None,
                window_duration_seconds: DAY_SECONDS,
            }
        }
    }

    fn start_cleanup_task(&self) {
        let storage = self.storage.clone();
        let cleanup_interval = Duration::from_secs(self.config.cleanup_interval_minutes * 60);
        
        tokio::spawn(async move {
            let mut interval = interval(cleanup_interval);
            
            loop {
                interval.tick().await;
                
                let now = Utc::now();
                let mut to_remove = Vec::new();
                
                for entry in storage.iter() {
                    let elapsed = now.signed_duration_since(entry.window_start);
                    if elapsed.num_seconds() > DAY_SECONDS as i64 {
                        to_remove.push(*entry.key());
                    }
                }
                
                for ip in to_remove {
                    storage.remove(&ip);
                }
            }
        });
    }
}

#[derive(Debug)]
pub enum RateLimitError {
    LimitExceeded {
        limit: u32,
        reset_time: DateTime<Utc>,
    },
}

impl std::fmt::Display for RateLimitError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            RateLimitError::LimitExceeded { limit, reset_time } => {
                write!(f, "Rate limit exceeded. Limit: {} requests per day. Reset at: {}", limit, reset_time)
            }
        }
    }
}

impl std::error::Error for RateLimitError {}

pub struct RateLimitGuard {
    pub ip: IpAddr,
}

pub struct ClientIp(pub IpAddr);

#[rocket::async_trait]
impl<'r> FromRequest<'r> for ClientIp {
    type Error = ();

    async fn from_request(request: &'r Request<'_>) -> Outcome<Self, Self::Error> {
        let ip = extract_client_ip(request).unwrap_or_else(|| "127.0.0.1".parse().unwrap());
        Outcome::Success(ClientIp(ip))
    }
}

#[rocket::async_trait]
impl<'r> FromRequest<'r> for RateLimitGuard {
    type Error = RateLimitError;

    async fn from_request(request: &'r Request<'_>) -> Outcome<Self, Self::Error> {
        let rate_limiter = match request.guard::<&State<RateLimiter>>().await {
            Outcome::Success(limiter) => limiter,
            Outcome::Failure((status, _)) => return Outcome::Failure((status, RateLimitError::LimitExceeded { 
                limit: 0, 
                reset_time: chrono::Utc::now() 
            })),
            Outcome::Forward(f) => return Outcome::Forward(f),
        };

        let ip = extract_client_ip(request).unwrap_or_else(|| "127.0.0.1".parse().unwrap());

        match rate_limiter.check_rate_limit(ip) {
            Ok(()) => Outcome::Success(RateLimitGuard { ip }),
            Err(e) => Outcome::Failure((Status::TooManyRequests, e)),
        }
    }
}

pub fn extract_client_ip(request: &Request) -> Option<IpAddr> {
    // Check X-Forwarded-For header (proxy/load balancer)
    if let Some(forwarded) = request.headers().get_one("X-Forwarded-For") {
        if let Some(ip_str) = forwarded.split(',').next() {
            if let Ok(ip) = IpAddr::from_str(ip_str.trim()) {
                return Some(ip);
            }
        }
    }

    // Check X-Real-IP header (Nginx proxy)
    if let Some(real_ip) = request.headers().get_one("X-Real-IP") {
        if let Ok(ip) = IpAddr::from_str(real_ip.trim()) {
            return Some(ip);
        }
    }

    // Fall back to remote address
    request.remote()
        .map(|addr| addr.ip())
}