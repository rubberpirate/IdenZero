    fn calculate_project_structure_score(&self, repo: &Repository, commits: &[CommitData]) -> f64 {
        let mut score = 0.0;

        // Repository size indicates substantial project
        let size_kb = repo.size.unwrap_or(0) as f64;
        if size_kb > 100.0 {
            score += 20.0;
        }
        if size_kb > 1000.0 {
            score += 15.0; // Bonus for substantial projects
        }

        // Check for project structure indicators in commit messages
        let has_structure_files = commits.iter().any(|commit| {
            let files_text = commit.files.iter()
                .map(|f| f.filename.to_lowercase())
                .collect::<Vec<_>>()
                .join(" ");
            
            files_text.contains("package.json") ||
            files_text.contains("cargo.toml") ||
            files_text.contains("requirements.txt") ||
            files_text.contains("pom.xml") ||
            files_text.contains("build.gradle") ||
            files_text.contains("dockerfile") ||
            files_text.contains("makefile") ||
            files_text.contains("cmake")
        });

        if has_structure_files {
            score += 25.0;
        }

        // Check for organized directory structure
        let has_organized_structure = commits.iter().any(|commit| {
            commit.files.iter().any(|f| {
                let path = &f.filename.to_lowercase();
                path.contains("src/") ||
                path.contains("lib/") ||
                path.contains("app/") ||
                path.contains("components/") ||
                path.contains("services/") ||
                path.contains("utils/") ||
                path.contains("helpers/")
            })
        });

        if has_organized_structure {
            score += 20.0;
        }

        // Check for configuration files
        let has_config_files = commits.iter().any(|commit| {
            let message = commit.message.to_lowercase();
            message.contains("config") ||
            message.contains("environment") ||
            message.contains("settings") ||
            message.contains(".env") ||
            message.contains("tsconfig") ||
            message.contains("eslint") ||
            message.contains("prettier")
        });

        if has_config_files {
            score += 15.0;
        }

        // Active development pattern
        if commits.len() > 10 {
            score += 20.0;
        }

        score.min(100.0)
    }

    fn calculate_documentation_score_comprehensive(&self, repo: &Repository, commits: &[CommitData]) -> f64 {
        let mut score = 0.0;

        // Repository has description
        if let Some(description) = &repo.description {
            if !description.is_empty() {
                let desc_len = description.len();
                if desc_len > 20 {
                    score += 25.0;
                } else if desc_len > 5 {
                    score += 15.0;
                }
            }
        }

        // Check for documentation in commits
        let has_docs = commits.iter().any(|commit| {
            let message = commit.message.to_lowercase();
            message.contains("readme") ||
            message.contains("documentation") ||
            message.contains("docs") ||
            message.contains("comment") ||
            message.contains("doc:")
        });

        if has_docs {
            score += 30.0;
        }

        // Check for documentation files
        let has_doc_files = commits.iter().any(|commit| {
            commit.files.iter().any(|f| {
                let filename = f.filename.to_lowercase();
                filename.contains("readme") ||
                filename.contains("doc") ||
                filename.contains("license") ||
                filename.contains("changelog") ||
                filename.contains("contributing") ||
                filename.ends_with(".md")
            })
        });

        if has_doc_files {
            score += 25.0;
        }

        // Code comments (inferred from commit patterns)
        let has_comment_commits = commits.iter().filter(|commit| {
            let message = commit.message.to_lowercase();
            message.contains("comment") ||
            message.contains("document") ||
            message.contains("explain") ||
            message.contains("clarify")
        }).count();

        if has_comment_commits > 0 {
            score += 20.0;
        }

        score.min(100.0)
    }

    fn calculate_testing_score_comprehensive(&self, commits: &[CommitData]) -> f64 {
        let mut score = 0.0;

        // Check for test files in commits
        let test_file_commits = commits.iter().filter(|commit| {
            commit.files.iter().any(|f| {
                let filename = f.filename.to_lowercase();
                filename.contains("test") ||
                filename.contains("spec") ||
                filename.ends_with("_test.py") ||
                filename.ends_with("_test.go") ||
                filename.ends_with("_test.rs") ||
                filename.ends_with(".test.js") ||
                filename.ends_with(".test.ts") ||
                filename.ends_with(".spec.js") ||
                filename.ends_with(".spec.ts") ||
                filename.contains("__tests__")
            })
        }).count();

        if test_file_commits > 0 {
            score += 40.0;
            
            // Bonus for multiple test commits
            let test_ratio = test_file_commits as f64 / commits.len() as f64;
            if test_ratio > 0.1 {
                score += 20.0; // More than 10% of commits involve tests
            }
        }

        // Check for test-related commit messages
        let test_message_commits = commits.iter().filter(|commit| {
            let message = commit.message.to_lowercase();
            message.contains("test") ||
            message.contains("spec") ||
            message.contains("unit test") ||
            message.contains("integration test") ||
            message.contains("e2e") ||
            message.contains("coverage")
        }).count();

        if test_message_commits > 0 {
            score += 25.0;
        }

        // Check for CI/CD related testing
        let has_ci_testing = commits.iter().any(|commit| {
            let message = commit.message.to_lowercase();
            message.contains("ci") ||
            message.contains("github actions") ||
            message.contains("workflow") ||
            message.contains("pipeline") ||
            commit.files.iter().any(|f| {
                f.filename.contains(".github/workflows") ||
                f.filename.contains("ci.yml") ||
                f.filename.contains("test.yml")
            })
        });

        if has_ci_testing {
            score += 15.0;
        }

        score.min(100.0)
    }

    fn calculate_activity_score(&self, repo: &Repository, commits: &[CommitData]) -> f64 {
        let mut score = 0.0;

        // Recent activity
        if let Some(updated_at) = repo.updated_at {
            let days_since_update = (Utc::now() - updated_at).num_days();
            if days_since_update < 30 {
                score += 30.0;
            } else if days_since_update < 90 {
                score += 20.0;
            } else if days_since_update < 365 {
                score += 10.0;
            }
        }

        // Commit frequency
        if !commits.is_empty() {
            let commit_count = commits.len() as f64;
            if commit_count > 100 {
                score += 25.0;
            } else if commit_count > 50 {
                score += 20.0;
            } else if commit_count > 20 {
                score += 15.0;
            } else if commit_count > 5 {
                score += 10.0;
            }
        }

        // Project age and sustained development
        if let Some(created_at) = repo.created_at {
            let days_old = (Utc::now() - created_at).num_days();
            if days_old > 365 && !commits.is_empty() {
                score += 15.0; // Bonus for sustained long-term development
            }
        }

        // Community engagement
        let stars = repo.stargazers_count.unwrap_or(0);
        let forks = repo.forks_count.unwrap_or(0);
        
        if stars > 10 {
            score += 15.0;
        }
        if forks > 5 {
            score += 15.0;
        }

        score.min(100.0)
    }

    fn calculate_repo_innovation_score(&self, repo: &Repository, commits: &[CommitData]) -> f64 {
        let mut score = 0.0;

        // Community interest
        let stars = repo.stargazers_count.unwrap_or(0) as f64;
        let forks = repo.forks_count.unwrap_or(0) as f64;
        
        score += (stars.ln_1p() * 5.0).min(25.0);
        score += (forks.ln_1p() * 8.0).min(20.0);

        // Project uniqueness (not a fork)
        if !repo.fork.unwrap_or(false) {
            score += 20.0;
        }

        // Use of modern technologies
        let has_modern_tech = commits.iter().any(|commit| {
            let content = format!("{} {}", commit.message.to_lowercase(), 
                commit.files.iter().map(|f| f.filename.to_lowercase()).collect::<Vec<_>>().join(" "));
            
            content.contains("ai") || content.contains("ml") || content.contains("machine learning") ||
            content.contains("kubernetes") || content.contains("docker") ||
            content.contains("graphql") || content.contains("grpc") ||
            content.contains("microservice") || content.contains("serverless") ||
            content.contains("blockchain") || content.contains("cryptocurrency") ||
            content.contains("react") || content.contains("vue") || content.contains("angular") ||
            content.contains("typescript") || content.contains("rust") || content.contains("go")
        });

        if has_modern_tech {
            score += 25.0;
        }

        // Active development with regular updates
        if commits.len() > 50 {
            score += 10.0;
        }

        score.min(100.0)
    }