    fn calculate_commit_message_quality_comprehensive(&self, commits: &[CommitData]) -> f64 {
        let mut total_score = 0.0;

        for commit in commits {
            let message = &commit.message;
            let mut score = 0.0;

            // Length check (not too short, not too long)
            let first_line = message.lines().next().unwrap_or("");
            if first_line.len() >= 10 && first_line.len() <= 72 {
                score += 20.0;
            }

            // Conventional commit format
            if Self::is_conventional_commit(first_line) {
                score += 25.0;
            }

            // Multi-line commits for complex changes
            if message.lines().count() > 2 {
                score += 15.0;
            }

            // Descriptive and clear
            if Self::is_descriptive_message(first_line) {
                score += 20.0;
            }

            // No obvious bad patterns
            if !Self::has_bad_commit_patterns(message) {
                score += 20.0;
            }

            total_score += score;
        }

        total_score / commits.len() as f64
    }

    fn categorize_commits_comprehensive(&self, commits: &[CommitData]) -> (u32, u32, u32) {
        let mut feature_commits = 0;
        let mut bug_fix_commits = 0;
        let mut refactor_commits = 0;

        for commit in commits {
            let message_lower = commit.message.to_lowercase();
            
            // More sophisticated categorization
            if message_lower.contains("feat") || message_lower.contains("feature") ||
               message_lower.contains("add") || message_lower.contains("implement") ||
               message_lower.contains("create") || message_lower.contains("new") {
                feature_commits += 1;
            } else if message_lower.contains("fix") || message_lower.contains("bug") ||
                     message_lower.contains("patch") || message_lower.contains("hotfix") ||
                     message_lower.contains("resolve") || message_lower.contains("correct") {
                bug_fix_commits += 1;
            } else if message_lower.contains("refactor") || message_lower.contains("cleanup") ||
                     message_lower.contains("optimize") || message_lower.contains("improve") ||
                     message_lower.contains("restructure") || message_lower.contains("simplify") {
                refactor_commits += 1;
            }
        }

        (feature_commits, bug_fix_commits, refactor_commits)
    }

    fn calculate_commit_consistency_comprehensive(&self, commits: &[CommitData]) -> f64 {
        if commits.len() < 3 {
            return 0.5; // Neutral score for insufficient data
        }

        let mut consistency_scores = Vec::new();

        // Time consistency (regular intervals)
        let intervals: Vec<i64> = commits.windows(2)
            .map(|window| (window[0].date - window[1].date).num_hours())
            .collect();
        
        if intervals.len() > 1 {
            let mean_interval = intervals.iter().sum::<i64>() as f64 / intervals.len() as f64;
            let variance = intervals.iter()
                .map(|&interval| {
                    let diff = interval as f64 - mean_interval;
                    diff * diff
                })
                .sum::<f64>() / intervals.len() as f64;
            
            let consistency = if mean_interval.abs() < 1.0 {
                0.5 // Neutral for very frequent commits
            } else {
                1.0 / (1.0 + variance.sqrt() / mean_interval.abs())
            };
            consistency_scores.push(consistency);
        }

        // Size consistency
        let sizes: Vec<u32> = commits.iter().map(|c| c.additions + c.deletions).collect();
        if sizes.len() > 1 {
            let mean_size = sizes.iter().sum::<u32>() as f64 / sizes.len() as f64;
            let size_variance = sizes.iter()
                .map(|&size| {
                    let diff = size as f64 - mean_size;
                    diff * diff
                })
                .sum::<f64>() / sizes.len() as f64;
            
            let size_consistency = if mean_size < 1.0 {
                0.5
            } else {
                1.0 / (1.0 + size_variance.sqrt() / mean_size)
            };
            consistency_scores.push(size_consistency);
        }

        // Message quality consistency
        let message_qualities: Vec<f64> = commits.iter()
            .map(|commit| {
                let msg = &commit.message;
                if Self::is_conventional_commit(msg) && Self::is_descriptive_message(msg) {
                    1.0
                } else if Self::is_descriptive_message(msg) {
                    0.7
                } else {
                    0.3
                }
            })
            .collect();

        if message_qualities.len() > 1 {
            let mean_quality = message_qualities.iter().sum::<f64>() / message_qualities.len() as f64;
            consistency_scores.push(mean_quality);
        }

        consistency_scores.iter().sum::<f64>() / consistency_scores.len() as f64
    }

    fn has_bad_commit_patterns(message: &str) -> bool {
        let message_lower = message.to_lowercase();
        message_lower.contains("wip") ||
        message_lower.contains("temp") ||
        message_lower.contains("tmp") ||
        message_lower.contains("test commit") ||
        message_lower.starts_with("update") && message_lower.len() < 15 ||
        message_lower == "minor changes" ||
        message_lower == "fixes" ||
        message_lower.len() < 5
    }

    fn detect_technologies_from_repo(&self, repo: &Repository, commits: &[CommitData]) -> Vec<String> {
        let mut technologies = Vec::new();
        
        // Analyze repository name and description
        let repo_text = format!("{} {}", 
            repo.name.to_lowercase(), 
            repo.description.as_ref().unwrap_or(&String::new()).to_lowercase()
        );

        // Analyze commit messages
        let commit_text = commits.iter()
            .map(|c| c.message.to_lowercase())
            .collect::<Vec<_>>()
            .join(" ");

        let combined_text = format!("{} {}", repo_text, commit_text);

        // Check for technology keywords
        for keyword in &self.tech_keywords {
            if combined_text.contains(keyword) {
                technologies.push(keyword.clone());
            }
        }

        technologies.sort();
        technologies.dedup();
        technologies
    }

    fn calculate_code_quality_metrics(&self, commits: &[CommitData]) -> CodeQualityMetrics {
        if commits.is_empty() {
            return CodeQualityMetrics {
                avg_commit_size: 0.0,
                commit_message_quality: 0.0,
                code_consistency: 0.0,
                refactoring_frequency: 0.0,
                bug_fix_ratio: 0.0,
                feature_to_maintenance_ratio: 1.0,
            };
        }

        let total_changes: u32 = commits.iter().map(|c| c.additions + c.deletions).sum();
        let avg_commit_size = total_changes as f64 / commits.len() as f64;
        
        let commit_message_quality = self.calculate_commit_message_quality_comprehensive(commits);
        let code_consistency = self.calculate_commit_consistency_comprehensive(commits);
        
        let (feature_commits, bug_fix_commits, refactor_commits) = self.categorize_commits_comprehensive(commits);
        let total_commits = commits.len() as f64;
        
        let refactoring_frequency = refactor_commits as f64 / total_commits;
        let bug_fix_ratio = bug_fix_commits as f64 / total_commits;
        
        let feature_to_maintenance_ratio = if (bug_fix_commits + refactor_commits) == 0 {
            2.0 // High ratio if no maintenance commits
        } else {
            feature_commits as f64 / (bug_fix_commits + refactor_commits) as f64
        };

        CodeQualityMetrics {
            avg_commit_size,
            commit_message_quality,
            code_consistency,
            refactoring_frequency,
            bug_fix_ratio,
            feature_to_maintenance_ratio,
        }
    }