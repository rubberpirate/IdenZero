use warp::{Filter, Reply};
use serde_json;
use std::sync::{Arc};
use tokio::sync::Mutex;

use crate::improved_analyzer::{ImprovedAnalyzer, AnalysisRequest, AnalysisDepth};
use crate::streamlined_analyzer::StreamlinedAnalyzer;

pub struct ApiServer {
    analyzer: Arc<Mutex<ImprovedAnalyzer>>,
    streamlined_analyzer: Arc<Mutex<StreamlinedAnalyzer>>,
}

impl ApiServer {
    pub fn new(github_token: String) -> Result<Self, Box<dyn std::error::Error>> {
        let analyzer = ImprovedAnalyzer::new(github_token.clone())?;
        let streamlined_analyzer = StreamlinedAnalyzer::new(github_token)?;
        Ok(Self {
            analyzer: Arc::new(Mutex::new(analyzer)),
            streamlined_analyzer: Arc::new(Mutex::new(streamlined_analyzer)),
        })
    }

    pub async fn serve(self) {
        let analyzer = self.analyzer.clone();
        let streamlined_analyzer = self.streamlined_analyzer.clone();
        
        // CORS headers
        let cors = warp::cors()
            .allow_any_origin()
            .allow_headers(vec!["content-type"])
            .allow_methods(vec!["GET", "POST", "OPTIONS"]);

        // Health check endpoint
        let health = warp::path("health")
            .and(warp::get())
            .map(|| {
                warp::reply::json(&serde_json::json!({
                    "status": "healthy",
                    "timestamp": chrono::Utc::now().to_rfc3339(),
                    "service": "idenzero-analyzer"
                }))
            });

        // Streamlined profile endpoint - NEW
        let streamlined = warp::path!("streamlined" / String)
            .and(warp::get())
            .and(with_streamlined_analyzer(streamlined_analyzer.clone()))
            .and_then(handle_streamlined_profile);

        // Main analysis endpoint
        let analyze = warp::path("analyze")
            .and(warp::post())
            .and(warp::body::json())
            .and(with_analyzer(analyzer.clone()))
            .and_then(handle_analyze);

        // Quick analysis endpoint (basic info only)
        let quick_analyze = warp::path!("quick" / String)
            .and(warp::get())
            .and(with_analyzer(analyzer.clone()))
            .and_then(handle_quick_analyze);

        // Frontend-optimized endpoint
        let frontend_profile = warp::path!("profile" / String)
            .and(warp::get())
            .and(with_analyzer(analyzer.clone()))
            .and_then(handle_frontend_profile);

        // Compare multiple developers
        let compare = warp::path("compare")
            .and(warp::post())
            .and(warp::body::json())
            .and(with_analyzer(analyzer.clone()))
            .and_then(handle_compare);

        // Serve static demo files
        let demo = warp::path("demo")
            .and(warp::fs::dir("../demo-ui"));

        let api = warp::path("api")
            .and(health.or(streamlined).or(analyze).or(quick_analyze).or(frontend_profile).or(compare))
            .with(cors.clone());

        let routes = api.or(demo).with(cors);

        tracing::info!("IdenZero API Server starting on http://localhost:3030");
        tracing::info!("Health endpoint available at: /api/health");
        tracing::info!("Profile endpoints available at: /api/streamlined/<username>, /api/quick/<username>, /api/profile/<username>");
        
        warp::serve(routes)
            .run(([0, 0, 0, 0], 3030))
            .await;
    }
}

fn with_analyzer(analyzer: Arc<Mutex<ImprovedAnalyzer>>) -> impl Filter<Extract = (Arc<Mutex<ImprovedAnalyzer>>,), Error = std::convert::Infallible> + Clone {
    warp::any().map(move || analyzer.clone())
}

fn with_streamlined_analyzer(analyzer: Arc<Mutex<StreamlinedAnalyzer>>) -> impl Filter<Extract = (Arc<Mutex<StreamlinedAnalyzer>>,), Error = std::convert::Infallible> + Clone {
    warp::any().map(move || analyzer.clone())
}

async fn handle_streamlined_profile(
    username: String,
    analyzer: Arc<Mutex<StreamlinedAnalyzer>>,
) -> Result<impl Reply, warp::Rejection> {
    let result = {
        let mut analyzer = analyzer.lock().await;
        analyzer.get_profile(username.clone()).await
    };
    
    match result {
        Ok(profile) => Ok(warp::reply::json(&serde_json::json!({
            "success": true,
            "profile": profile
        }))),
        Err(e) => Ok(warp::reply::json(&serde_json::json!({
            "success": false,
            "error": format!("Failed to analyze {}: {}", username, e)
        })))
    }
}

async fn handle_analyze(
    request: AnalysisRequest,
    analyzer: Arc<Mutex<ImprovedAnalyzer>>,
) -> Result<impl Reply, warp::Rejection> {
    let response = {
        let mut analyzer = analyzer.lock().await;
        analyzer.analyze_user(request).await
    };
    
    Ok(warp::reply::json(&response))
}

async fn handle_quick_analyze(
    username: String,
    analyzer: Arc<Mutex<ImprovedAnalyzer>>,
) -> Result<impl Reply, warp::Rejection> {
    let request = AnalysisRequest {
        username,
        wallet_address: None,
        include_frontend_data: Some(false),
        analysis_depth: Some(AnalysisDepth::Basic),
    };

    let response = {
        let mut analyzer = analyzer.lock().await;
        analyzer.analyze_user(request).await
    };
    
    Ok(warp::reply::json(&response))
}

async fn handle_frontend_profile(
    username: String,
    analyzer: Arc<Mutex<ImprovedAnalyzer>>,
) -> Result<impl Reply, warp::Rejection> {
    let request = AnalysisRequest {
        username,
        wallet_address: None,
        include_frontend_data: Some(true),
        analysis_depth: Some(AnalysisDepth::Frontend),
    };

    let response = {
        let mut analyzer = analyzer.lock().await;
        analyzer.analyze_user(request).await
    };
    
    // Extract just the frontend profile for cleaner API response
    if let Some(frontend_profile) = response.frontend_profile {
        Ok(warp::reply::json(&serde_json::json!({
            "success": response.success,
            "username": response.username,
            "profile": frontend_profile,
            "metadata": response.metadata
        })))
    } else {
        Ok(warp::reply::json(&serde_json::json!({
            "success": false,
            "error": "Failed to generate frontend profile",
            "username": response.username
        })))
    }
}

async fn handle_compare(
    request: CompareRequest,
    analyzer: Arc<Mutex<ImprovedAnalyzer>>,
) -> Result<impl Reply, warp::Rejection> {
    let response = {
        let mut analyzer = analyzer.lock().await;
        analyzer.compare_developers(request.usernames).await
    };
    
    Ok(warp::reply::json(&response))
}

#[derive(serde::Deserialize)]
struct CompareRequest {
    usernames: Vec<String>,
}

// Example usage functions for testing
pub fn example_requests() -> Vec<AnalysisRequest> {
    vec![
        // Basic analysis
        AnalysisRequest {
            username: "octocat".to_string(),
            wallet_address: None,
            include_frontend_data: Some(false),
            analysis_depth: Some(AnalysisDepth::Basic),
        },
        // Full analysis with frontend data
        AnalysisRequest {
            username: "gaearon".to_string(),
            wallet_address: None,
            include_frontend_data: Some(true),
            analysis_depth: Some(AnalysisDepth::Frontend),
        },
        // Detailed analysis for Web3 developer
        AnalysisRequest {
            username: "ethereum".to_string(),
            wallet_address: Some("0x742d35Cc6634C0532925a3b8D772C3B5F68D2C66".to_string()),
            include_frontend_data: Some(true),
            analysis_depth: Some(AnalysisDepth::Detailed),
        },
    ]
}

#[cfg(test)]
mod tests {
    use super::*;
}