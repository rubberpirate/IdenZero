    // Helper methods for complexity and technical debt estimation
    fn estimate_complexity(language: &str, bytes: u64) -> f64 {
        let base_complexity = match language.to_lowercase().as_str() {
            "c++" | "c" | "rust" => 8.0,
            "java" | "c#" => 6.0,
            "python" | "javascript" | "typescript" => 4.0,
            "go" | "kotlin" | "swift" => 5.0,
            _ => 3.0,
        };
        
        // Scale with project size
        base_complexity * (1.0 + (bytes as f64 / 100000.0))
    }

    fn estimate_cognitive_complexity(language: &str, commits: u32) -> f64 {
        let base_cognitive = match language.to_lowercase().as_str() {
            "assembly" | "c" => 9.0,
            "c++" | "rust" => 7.0,
            "java" | "c#" => 5.0,
            "python" | "javascript" => 3.0,
            _ => 4.0,
        };
        
        // Scale with commit frequency (more commits might indicate complexity)
        base_cognitive * (1.0 + (commits as f64 / 1000.0))
    }

    fn estimate_maintainability(language: &str, project_count: u32) -> f64 {
        let base_maintainability = match language.to_lowercase().as_str() {
            "python" | "go" | "rust" => 85.0,
            "java" | "c#" | "typescript" => 75.0,
            "javascript" | "php" => 65.0,
            "c++" | "c" => 55.0,
            _ => 70.0,
        };
        
        // Higher project count might indicate better practices
        (base_maintainability + (project_count as f64 * 2.0)).min(100.0)
    }

    fn estimate_technical_debt(commits: u32, bytes: u64) -> f64 {
        if commits == 0 || bytes == 0 {
            return 0.5; // Default moderate debt
        }
        
        let commits_per_kloc = (commits as f64) / ((bytes / 1000) as f64);
        
        // Higher commits per KLOC might indicate more maintenance/fixes
        if commits_per_kloc > 50.0 {
            0.7 // High debt
        } else if commits_per_kloc > 20.0 {
            0.4 // Moderate debt
        } else {
            0.2 // Low debt
        }
    }

    fn has_multiple_languages(languages: &HashMap<String, u64>) -> bool {
        languages.len() > 2
    }

    fn has_testing_indicators(files: &[String]) -> bool {
        files.iter().any(|f| {
            let name = f.to_lowercase();
            name.contains("test") || 
            name.contains("spec") || 
            name.ends_with(".test.js") ||
            name.ends_with(".spec.ts") ||
            name.ends_with("_test.py") ||
            name.contains("cypress") ||
            name.contains("jest")
        })
    }

    fn has_ci_cd_setup(files: &[String]) -> bool {
        files.iter().any(|f| {
            let name = f.to_lowercase();
            name.contains(".github/workflows") ||
            name.contains("jenkinsfile") ||
            name.contains("gitlab-ci") ||
            name.contains("azure-pipelines") ||
            name == "dockerfile" ||
            name == "docker-compose.yml"
        })
    }

    fn detect_architectural_patterns(files: &[String], description: &Option<String>) -> Vec<String> {
        let mut patterns = Vec::new();
        
        // Check for common architectural patterns
        if files.iter().any(|f| f.to_lowercase().contains("microservice")) {
            patterns.push("Microservices".to_string());
        }
        
        if files.iter().any(|f| f.to_lowercase().contains("mvc")) {
            patterns.push("MVC".to_string());
        }
        
        if files.iter().any(|f| f.to_lowercase().contains("component")) {
            patterns.push("Component-Based".to_string());
        }
        
        // Check description for patterns
        if let Some(desc) = description {
            let desc_lower = desc.to_lowercase();
            if desc_lower.contains("rest") || desc_lower.contains("api") {
                patterns.push("REST API".to_string());
            }
            if desc_lower.contains("graphql") {
                patterns.push("GraphQL".to_string());
            }
            if desc_lower.contains("serverless") {
                patterns.push("Serverless".to_string());
            }
        }
        
        patterns
    }
}