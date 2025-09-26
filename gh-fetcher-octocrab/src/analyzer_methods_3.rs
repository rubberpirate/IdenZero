    fn calculate_language_skills_comprehensive(&self, repo_analyses: &[RepositoryAnalysis]) -> HashMap<String, LanguageSkill> {
        let mut language_stats: HashMap<String, (u64, u32, HashSet<String>, u32)> = HashMap::new();

        // Aggregate language data across repositories
        for repo in repo_analyses {
            for (language, bytes) in &repo.languages {
                let entry = language_stats.entry(language.clone()).or_insert((0, 0, HashSet::new(), 0));
                entry.0 += bytes; // Total bytes
                entry.1 += repo.commit_analysis.total_commits; // Total commits
                entry.2.insert(repo.name.clone()); // Projects using this language
                entry.3 += repo.stars; // Total stars for projects using this language
            }
            
            // Also count primary language if not in languages map
            if let Some(primary_lang) = &repo.primary_language {
                let entry = language_stats.entry(primary_lang.clone()).or_insert((0, 0, HashSet::new(), 0));
                if entry.0 == 0 {
                    entry.0 = 1000; // Estimate if no byte count
                }
                entry.1 += repo.commit_analysis.total_commits;
                entry.2.insert(repo.name.clone());
                entry.3 += repo.stars;
            }
        }

        // Convert to LanguageSkill objects
        language_stats.into_iter().map(|(language, (bytes, commits, projects, total_stars))| {
            let project_count = projects.len() as u32;
            let weight_multiplier = self.language_weights.get(&language).copied().unwrap_or(1.0);
            
            // Calculate comprehensive proficiency score
            let usage_score = (bytes as f64).ln_1p() / 100.0; // Logarithmic scaling
            let commit_score = (commits as f64).ln_1p() / 10.0;
            let project_score = project_count as f64 * 15.0;
            let community_score = (total_stars as f64).ln_1p() * 2.0;
            
            let base_proficiency = (usage_score + commit_score + project_score + community_score).min(100.0);
            let proficiency_score = base_proficiency * weight_multiplier;

            let complexity_metrics = ComplexityMetrics {
                cyclomatic_complexity: Self::estimate_complexity(&language, bytes),
                cognitive_complexity: Self::estimate_cognitive_complexity(&language, commits),
                maintainability_index: Self::estimate_maintainability(&language, project_count),
                technical_debt_ratio: Self::estimate_technical_debt(commits, bytes),
            };

            (language.clone(), LanguageSkill {
                language: language.clone(),
                proficiency_score,
                lines_of_code: bytes / 50, // Rough estimation: 50 bytes per line
                commit_count: commits,
                project_count,
                complexity_metrics,
                weight_multiplier,
            })
        }).collect()
    }

    fn identify_technologies(&self, repo_analyses: &[RepositoryAnalysis]) -> HashMap<String, TechnologySkill> {
        let mut tech_stats: HashMap<String, (u32, HashSet<String>, bool)> = HashMap::new();

        for repo in repo_analyses {
            for technology in &repo.technologies {
                let entry = tech_stats.entry(technology.clone()).or_insert((0, HashSet::new(), false));
                entry.0 += 1; // Usage count
                entry.1.insert(repo.name.clone()); // Projects using this tech
                
                // Check if it's recent (within last year)
                if let Some(updated_at) = repo.updated_at {
                    if (Utc::now() - updated_at).num_days() < 365 {
                        entry.2 = true;
                    }
                }
            }
        }

        tech_stats.into_iter().map(|(tech, (usage_count, projects, recent_usage))| {
            let project_count = projects.len() as u32;
            
            // Calculate proficiency based on usage frequency and project count
            let proficiency_score = ((usage_count as f64 * 10.0) + (project_count as f64 * 20.0)).min(100.0);

            (tech.clone(), TechnologySkill {
                technology: tech,
                usage_count,
                project_count,
                proficiency_score,
                recent_usage,
            })
        }).collect()
    }

    fn determine_specializations(&self, repo_analyses: &[RepositoryAnalysis], tech_breakdown: &HashMap<String, TechnologySkill>) -> Vec<Specialization> {
        let mut specializations = Vec::new();

        // Web Development Specialization
        let web_techs = ["react", "vue", "angular", "nodejs", "express", "nextjs", "javascript", "typescript", "html", "css"];
        let web_score = self.calculate_specialization_score(tech_breakdown, &web_techs, repo_analyses);
        if web_score > 30.0 {
            specializations.push(Specialization {
                area: "Web Development".to_string(),
                confidence_score: web_score,
                supporting_projects: self.get_supporting_projects(repo_analyses, &web_techs),
                key_technologies: web_techs.iter().filter(|t| tech_breakdown.contains_key(**t)).map(|s| s.to_string()).collect(),
            });
        }

        // Backend Development
        let backend_techs = ["spring", "django", "flask", "rails", "laravel", "asp.net", "gin", "fiber", "microservice"];
        let backend_score = self.calculate_specialization_score(tech_breakdown, &backend_techs, repo_analyses);
        if backend_score > 30.0 {
            specializations.push(Specialization {
                area: "Backend Development".to_string(),
                confidence_score: backend_score,
                supporting_projects: self.get_supporting_projects(repo_analyses, &backend_techs),
                key_technologies: backend_techs.iter().filter(|t| tech_breakdown.contains_key(**t)).map(|s| s.to_string()).collect(),
            });
        }

        // Mobile Development
        let mobile_techs = ["android", "ios", "flutter", "react native", "xamarin", "ionic"];
        let mobile_score = self.calculate_specialization_score(tech_breakdown, &mobile_techs, repo_analyses);
        if mobile_score > 30.0 {
            specializations.push(Specialization {
                area: "Mobile Development".to_string(),
                confidence_score: mobile_score,
                supporting_projects: self.get_supporting_projects(repo_analyses, &mobile_techs),
                key_technologies: mobile_techs.iter().filter(|t| tech_breakdown.contains_key(**t)).map(|s| s.to_string()).collect(),
            });
        }

        // DevOps/Cloud
        let devops_techs = ["docker", "kubernetes", "aws", "azure", "gcp", "terraform", "ansible", "jenkins"];
        let devops_score = self.calculate_specialization_score(tech_breakdown, &devops_techs, repo_analyses);
        if devops_score > 30.0 {
            specializations.push(Specialization {
                area: "DevOps/Cloud".to_string(),
                confidence_score: devops_score,
                supporting_projects: self.get_supporting_projects(repo_analyses, &devops_techs),
                key_technologies: devops_techs.iter().filter(|t| tech_breakdown.contains_key(**t)).map(|s| s.to_string()).collect(),
            });
        }

        // Data Science/ML
        let ml_techs = ["tensorflow", "pytorch", "scikit-learn", "pandas", "numpy", "jupyter", "spark", "hadoop"];
        let ml_score = self.calculate_specialization_score(tech_breakdown, &ml_techs, repo_analyses);
        if ml_score > 30.0 {
            specializations.push(Specialization {
                area: "Data Science/ML".to_string(),
                confidence_score: ml_score,
                supporting_projects: self.get_supporting_projects(repo_analyses, &ml_techs),
                key_technologies: ml_techs.iter().filter(|t| tech_breakdown.contains_key(**t)).map(|s| s.to_string()).collect(),
            });
        }

        // Blockchain/Web3
        let blockchain_techs = ["blockchain", "ethereum", "solidity", "web3", "defi", "nft", "smart contract"];
        let blockchain_score = self.calculate_specialization_score(tech_breakdown, &blockchain_techs, repo_analyses);
        if blockchain_score > 30.0 {
            specializations.push(Specialization {
                area: "Blockchain/Web3".to_string(),
                confidence_score: blockchain_score,
                supporting_projects: self.get_supporting_projects(repo_analyses, &blockchain_techs),
                key_technologies: blockchain_techs.iter().filter(|t| tech_breakdown.contains_key(**t)).map(|s| s.to_string()).collect(),
            });
        }

        // Game Development
        let game_techs = ["unity", "unreal", "godot", "opengl", "vulkan", "directx"];
        let game_score = self.calculate_specialization_score(tech_breakdown, &game_techs, repo_analyses);
        if game_score > 30.0 {
            specializations.push(Specialization {
                area: "Game Development".to_string(),
                confidence_score: game_score,
                supporting_projects: self.get_supporting_projects(repo_analyses, &game_techs),
                key_technologies: game_techs.iter().filter(|t| tech_breakdown.contains_key(**t)).map(|s| s.to_string()).collect(),
            });
        }

        // Sort by confidence score
        specializations.sort_by(|a, b| b.confidence_score.partial_cmp(&a.confidence_score).unwrap());
        specializations
    }

    fn calculate_specialization_score(&self, tech_breakdown: &HashMap<String, TechnologySkill>, specialization_techs: &[&str], repo_analyses: &[RepositoryAnalysis]) -> f64 {
        let mut total_score = 0.0;
        let mut tech_count = 0;

        for tech in specialization_techs {
            if let Some(tech_skill) = tech_breakdown.get(*tech) {
                total_score += tech_skill.proficiency_score;
                tech_count += 1;
            }
        }

        // Also check repository names and descriptions for specialization indicators
        let specialization_repos = repo_analyses.iter()
            .filter(|repo| {
                let repo_text = format!("{} {}", 
                    repo.name.to_lowercase(), 
                    repo.description.as_ref().unwrap_or(&String::new()).to_lowercase()
                );
                specialization_techs.iter().any(|tech| repo_text.contains(tech))
            })
            .count();

        let repo_bonus = specialization_repos as f64 * 15.0;

        if tech_count > 0 {
            (total_score / tech_count as f64) + repo_bonus
        } else {
            repo_bonus
        }
    }

    fn get_supporting_projects(&self, repo_analyses: &[RepositoryAnalysis], specialization_techs: &[&str]) -> Vec<String> {
        repo_analyses.iter()
            .filter(|repo| {
                let repo_text = format!("{} {}", 
                    repo.name.to_lowercase(), 
                    repo.description.as_ref().unwrap_or(&String::new()).to_lowercase()
                );
                specialization_techs.iter().any(|tech| repo_text.contains(tech)) ||
                repo.technologies.iter().any(|t| specialization_techs.contains(&t.as_str()))
            })
            .map(|repo| repo.name.clone())
            .take(5) // Limit to top 5 supporting projects
            .collect()
    }

    fn calculate_overall_score_comprehensive(&self, language_breakdown: &HashMap<String, LanguageSkill>, repo_analyses: &[RepositoryAnalysis]) -> f64 {
        if language_breakdown.is_empty() || repo_analyses.is_empty() {
            return 0.0;
        }

        // Language proficiency component (30%)
        let language_score: f64 = language_breakdown.values()
            .map(|skill| skill.proficiency_score)
            .sum::<f64>() / language_breakdown.len() as f64;

        // Project quality component (40%)
        let project_score: f64 = repo_analyses.iter()
            .map(|repo| {
                (repo.project_structure_score * 0.25 + 
                 repo.documentation_score * 0.2 + 
                 repo.testing_score * 0.25 + 
                 repo.activity_score * 0.15 +
                 repo.innovation_score * 0.15)
            })
            .sum::<f64>() / repo_analyses.len() as f64;

        // Code quality component (20%)
        let code_quality: f64 = repo_analyses.iter()
            .map(|repo| {
                (repo.code_quality_metrics.commit_message_quality + 
                 repo.code_quality_metrics.code_consistency * 100.0 +
                 (1.0 - repo.code_quality_metrics.bug_fix_ratio) * 100.0) / 3.0
            })
            .sum::<f64>() / repo_analyses.len() as f64;

        // Activity and community component (10%)
        let activity_score: f64 = repo_analyses.iter()
            .map(|repo| {
                let stars_score = (repo.stars as f64).ln_1p() * 10.0;
                let commits_score = (repo.commit_analysis.total_commits as f64).ln_1p() * 5.0;
                (stars_score + commits_score).min(100.0)
            })
            .sum::<f64>() / repo_analyses.len() as f64;

        // Weighted combination
        (language_score * 0.3 + project_score * 0.4 + code_quality * 0.2 + activity_score * 0.1).min(100.0)
    }

    fn calculate_years_active(&self, repo_analyses: &[RepositoryAnalysis]) -> f64 {
        if repo_analyses.is_empty() {
            return 0.0;
        }

        let oldest_repo = repo_analyses.iter()
            .filter_map(|repo| repo.created_at)
            .min();

        if let Some(oldest_date) = oldest_repo {
            (Utc::now() - oldest_date).num_days() as f64 / 365.25
        } else {
            0.0
        }
    }

    fn calculate_code_quality_score(&self, repo_analyses: &[RepositoryAnalysis]) -> f64 {
        if repo_analyses.is_empty() {
            return 0.0;
        }

        repo_analyses.iter()
            .map(|repo| {
                let metrics = &repo.code_quality_metrics;
                (metrics.commit_message_quality * 0.3 + 
                 metrics.code_consistency * 100.0 * 0.3 +
                 (1.0 - metrics.bug_fix_ratio) * 100.0 * 0.2 +
                 metrics.refactoring_frequency * 100.0 * 0.2)
            })
            .sum::<f64>() / repo_analyses.len() as f64
    }

    fn calculate_project_quality_score(&self, repo_analyses: &[RepositoryAnalysis]) -> f64 {
        if repo_analyses.is_empty() {
            return 0.0;
        }

        repo_analyses.iter()
            .map(|repo| {
                (repo.project_structure_score * 0.3 + 
                 repo.documentation_score * 0.3 + 
                 repo.testing_score * 0.4)
            })
            .sum::<f64>() / repo_analyses.len() as f64
    }

    fn calculate_innovation_score_comprehensive(&self, repo_analyses: &[RepositoryAnalysis]) -> f64 {
        if repo_analyses.is_empty() {
            return 0.0;
        }

        repo_analyses.iter()
            .map(|repo| repo.innovation_score)
            .sum::<f64>() / repo_analyses.len() as f64
    }