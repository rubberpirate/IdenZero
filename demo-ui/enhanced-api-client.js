// Enhanced TrustHire API Client for Better GitHub Analysis
class TrustHireAPI {
    constructor(baseUrl = 'http://localhost:3030/api') {
        this.baseUrl = baseUrl;
        this.cache = new Map();
        this.retryAttempts = 3;
    }

    // Main analysis method with caching and retry logic
    async analyzeUser(username, options = {}) {
        const cacheKey = `${username}-${JSON.stringify(options)}`;
        
        if (this.cache.has(cacheKey)) {
            console.log('📋 Using cached analysis for', username);
            return this.cache.get(cacheKey);
        }

        const request = {
            username,
            wallet_address: options.walletAddress || null,
            include_frontend_data: options.includeFrontendData !== false,
            analysis_depth: options.depth || 'Frontend'
        };

        for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
            try {
                console.log(`🔍 Analyzing ${username} (attempt ${attempt})`);
                
                const response = await fetch(`${this.baseUrl}/analyze`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(request)
                });

                if (!response.ok) {
                    throw new Error(`API error: ${response.status} ${response.statusText}`);
                }

                const result = await response.json();
                
                if (result.success) {
                    this.cache.set(cacheKey, result);
                    console.log('✅ Analysis complete for', username);
                    return result;
                } else {
                    throw new Error(result.error_message || 'Analysis failed');
                }
            } catch (error) {
                console.warn(`⚠️ Attempt ${attempt} failed:`, error.message);
                
                if (attempt === this.retryAttempts) {
                    throw error;
                }
                
                // Wait before retry with exponential backoff
                await this.delay(Math.pow(2, attempt) * 1000);
            }
        }
    }

    // Quick analysis for basic info only
    async quickAnalyze(username) {
        try {
            const response = await fetch(`${this.baseUrl}/quick/${username}`);
            
            if (!response.ok) {
                throw new Error(`API error: ${response.status} ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('❌ Quick analysis failed:', error);
            throw error;
        }
    }

    // Get frontend-optimized profile
    async getFrontendProfile(username) {
        try {
            const response = await fetch(`${this.baseUrl}/profile/${username}`);
            
            if (!response.ok) {
                throw new Error(`API error: ${response.status} ${response.statusText}`);
            }

            const result = await response.json();
            
            if (result.success) {
                return result.profile;
            } else {
                throw new Error(result.error || 'Failed to get profile');
            }
        } catch (error) {
            console.error('❌ Frontend profile failed:', error);
            throw error;
        }
    }

    // Compare multiple developers
    async compareDevelopers(usernames) {
        try {
            const response = await fetch(`${this.baseUrl}/compare`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ usernames })
            });

            if (!response.ok) {
                throw new Error(`API error: ${response.status} ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('❌ Comparison failed:', error);
            throw error;
        }
    }

    // Utility methods
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    clearCache() {
        this.cache.clear();
        console.log('🧹 Cache cleared');
    }

    getCacheSize() {
        return this.cache.size;
    }
}

// Enhanced Profile Renderer with Better Visual Design
class EnhancedProfileRenderer {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.animationDuration = 300;
        this.currentProfile = null;
    }

    // Main render method for complete profile
    async render(profile, username) {
        if (!profile) {
            this.renderError('No profile data available');
            return;
        }

        this.currentProfile = profile;
        this.container.innerHTML = '';
        this.container.className = 'enhanced-profile-container';

        // Create main sections
        const sections = [
            this.createHeader(profile.basic_info),
            this.createVisualSummary(profile.visual_summary),
            this.createBadgeSection(profile.badges),
            this.createInteractiveModules(profile.interactive_elements.draggable_modules),
            this.createSkillsVisualization(profile.skills_visualization),
            this.createProjectShowcase(profile.project_showcase),
            this.createTimelineSection(profile.timeline)
        ];

        // Animate sections in sequence
        for (let i = 0; i < sections.length; i++) {
            this.container.appendChild(sections[i]);
            await this.animateIn(sections[i], i * 100);
        }

        this.initializeInteractivity();
    }

    createHeader(basicInfo) {
        const header = document.createElement('div');
        header.className = 'profile-header';
        
        header.innerHTML = `
            <div class="header-background">
                <div class="header-content">
                    <div class="profile-avatar">
                        <img src="${basicInfo.profile_image_url || `https://github.com/${basicInfo.github_username}.png`}" 
                             alt="${basicInfo.name}" class="avatar-img">
                        <div class="verified-badge">✅</div>
                    </div>
                    <div class="profile-text">
                        <h1 class="profile-name">${basicInfo.name}</h1>
                        <h2 class="profile-title">${basicInfo.title}</h2>
                        <p class="profile-tagline">${basicInfo.tagline}</p>
                        <div class="profile-links">
                            <a href="https://github.com/${basicInfo.github_username}" target="_blank" class="github-link">
                                🐙 ${basicInfo.github_username}
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        return header;
    }

    createVisualSummary(visualSummary) {
        const summary = document.createElement('div');
        summary.className = 'visual-summary';
        
        summary.innerHTML = `
            <div class="summary-card">
                <div class="experience-indicator">
                    <div class="work-style-icon">${visualSummary.work_style_icon}</div>
                    <div class="experience-info">
                        <span class="experience-level">${visualSummary.experience_level_visual.level}</span>
                        <span class="experience-years">${visualSummary.experience_level_visual.years} years</span>
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${visualSummary.experience_level_visual.progress_percentage}%"></div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        return summary;
    }

    createBadgeSection(badges) {
        const section = document.createElement('div');
        section.className = 'badge-section';
        
        const badgeElements = badges.map(badge => `
            <div class="badge ${badge.verified ? 'verified' : 'unverified'}" 
                 style="border-color: ${badge.color}"
                 title="${badge.description}">
                <span class="badge-icon">${badge.icon}</span>
                <span class="badge-title">${badge.title}</span>
                ${badge.verified ? '<span class="verified-check">✓</span>' : ''}
            </div>
        `).join('');
        
        section.innerHTML = `
            <h3>🏅 Verified Skills & Achievements</h3>
            <div class="badge-grid">
                ${badgeElements}
            </div>
        `;
        
        return section;
    }

    createInteractiveModules(modules) {
        const section = document.createElement('div');
        section.className = 'interactive-modules';
        section.innerHTML = '<h3>🎮 Interactive Profile Modules</h3>';
        
        const grid = document.createElement('div');
        grid.className = 'module-grid';
        grid.style.cssText = `
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 16px;
            margin-top: 16px;
        `;
        
        modules.forEach((module, index) => {
            const moduleElement = this.createModule(module, index);
            grid.appendChild(moduleElement);
        });
        
        section.appendChild(grid);
        return section;
    }

    createModule(module, index) {
        const element = document.createElement('div');
        element.className = `module module-${module.content_type.toLowerCase()} ${this.getSizeClass(module.size)}`;
        element.style.backgroundColor = module.color_theme + '15';
        element.style.borderColor = module.color_theme;
        element.draggable = true;
        element.dataset.moduleId = module.id;
        
        let content = '';
        
        switch (module.content_type) {
            case 'StatNumber':
                content = `
                    <div class="stat-module">
                        <div class="stat-icon">${module.data.icon}</div>
                        <div class="stat-value">${module.data.value}</div>
                        <div class="stat-label">${module.data.label}</div>
                    </div>
                `;
                break;
                
            case 'SkillBar':
                content = `
                    <div class="skill-module">
                        <div class="skill-header">
                            <span class="skill-icon">${module.data.icon}</span>
                            <span class="skill-name">${module.data.skill}</span>
                        </div>
                        <div class="skill-progress">
                            <div class="skill-bar">
                                <div class="skill-fill" style="width: ${module.data.level}%; background-color: ${module.color_theme}"></div>
                            </div>
                            <span class="skill-percentage">${Math.round(module.data.level)}%</span>
                        </div>
                        <div class="skill-projects">${module.data.projects} projects</div>
                    </div>
                `;
                break;
                
            case 'ProjectCard':
                content = `
                    <div class="project-module">
                        <div class="project-header">
                            <h4 class="project-name">${module.data.name}</h4>
                            <div class="project-stats">
                                <span>⭐ ${module.data.stars}</span>
                            </div>
                        </div>
                        <p class="project-description">${module.data.description || 'No description available'}</p>
                        <div class="project-tech">
                            <span class="tech-badge">${module.data.language}</span>
                        </div>
                    </div>
                `;
                break;
                
            case 'Achievement':
                content = `
                    <div class="achievement-module">
                        <div class="achievement-icon">${module.data.icon}</div>
                        <div class="achievement-text">${module.data.text}</div>
                    </div>
                `;
                break;
                
            default:
                content = `
                    <div class="generic-module">
                        <h4>${module.title}</h4>
                        <p>Content type: ${module.content_type}</p>
                    </div>
                `;
        }
        
        element.innerHTML = content;
        return element;
    }

    createSkillsVisualization(skillsViz) {
        const section = document.createElement('div');
        section.className = 'skills-visualization';
        
        section.innerHTML = `
            <h3>📊 Skills Breakdown</h3>
            <div class="skills-container">
                <div class="skills-chart" id="skillsChart"></div>
                <div class="skills-legend">
                    ${skillsViz.skills.slice(0, 8).map((skill, index) => `
                        <div class="skill-legend-item">
                            <div class="skill-color" style="background-color: ${skillsViz.color_scheme[index % skillsViz.color_scheme.length]}"></div>
                            <span class="skill-legend-name">${skill.name}</span>
                            <span class="skill-legend-level">${Math.round(skill.level)}%</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
        
        // Would integrate with Chart.js or similar library for actual visualization
        setTimeout(() => this.renderSkillsChart(skillsViz), 100);
        
        return section;
    }

    createProjectShowcase(projectShowcase) {
        const section = document.createElement('div');
        section.className = 'project-showcase';
        
        const projectElements = projectShowcase.featured_projects.slice(0, 6).map(project => `
            <div class="project-card" onclick="window.open('${project.github_url}', '_blank')">
                <div class="project-card-header">
                    <h4 class="project-card-name">${project.name}</h4>
                    <div class="project-card-stats">
                        <span class="project-stars">⭐ ${project.stars}</span>
                    </div>
                </div>
                <p class="project-card-description">${project.description}</p>
                <div class="project-tech-stack">
                    ${project.tech_stack.slice(0, 3).map(tech => `
                        <span class="tech-pill">${tech}</span>
                    `).join('')}
                </div>
            </div>
        `).join('');
        
        section.innerHTML = `
            <h3>🚀 Featured Projects</h3>
            <div class="projects-grid">
                ${projectElements}
            </div>
        `;
        
        return section;
    }

    createTimelineSection(timeline) {
        const section = document.createElement('div');
        section.className = 'timeline-section';
        
        const timelineElements = timeline.events.slice(0, 10).map((event, index) => `
            <div class="timeline-item" style="animation-delay: ${index * 0.1}s">
                <div class="timeline-marker">
                    <span class="timeline-icon">${event.icon}</span>
                </div>
                <div class="timeline-content">
                    <div class="timeline-date">${event.date}</div>
                    <h4 class="timeline-title">${event.title}</h4>
                    <p class="timeline-description">${event.description}</p>
                </div>
            </div>
        `).join('');
        
        section.innerHTML = `
            <h3>📅 Development Timeline</h3>
            <div class="timeline">
                ${timelineElements}
            </div>
        `;
        
        return section;
    }

    // Utility methods
    getSizeClass(size) {
        const sizeMap = {
            'Small': 'size-1x1',
            'Medium': 'size-2x1',
            'Large': 'size-2x2',
            'Wide': 'size-3x1',
            'Tall': 'size-1x3'
        };
        return sizeMap[size] || 'size-1x1';
    }

    async animateIn(element, delay = 0) {
        element.style.opacity = '0';
        element.style.transform = 'translateY(20px)';
        
        await this.delay(delay);
        
        element.style.transition = `opacity ${this.animationDuration}ms ease, transform ${this.animationDuration}ms ease`;
        element.style.opacity = '1';
        element.style.transform = 'translateY(0)';
    }

    initializeInteractivity() {
        // Add drag and drop for modules
        this.initializeDragAndDrop();
        
        // Add hover effects
        this.initializeHoverEffects();
        
        // Add click handlers
        this.initializeClickHandlers();
    }

    initializeDragAndDrop() {
        const modules = this.container.querySelectorAll('.module[draggable="true"]');
        const grid = this.container.querySelector('.module-grid');
        
        modules.forEach(module => {
            module.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('text/plain', e.target.dataset.moduleId);
                e.target.style.opacity = '0.5';
            });
            
            module.addEventListener('dragend', (e) => {
                e.target.style.opacity = '1';
            });
        });
        
        if (grid) {
            grid.addEventListener('dragover', (e) => {
                e.preventDefault();
            });
            
            grid.addEventListener('drop', (e) => {
                e.preventDefault();
                const moduleId = e.dataTransfer.getData('text/plain');
                const draggedElement = this.container.querySelector(`[data-module-id="${moduleId}"]`);
                
                if (draggedElement && e.target.classList.contains('module')) {
                    // Swap positions
                    const nextSibling = e.target.nextSibling;
                    e.target.parentNode.insertBefore(draggedElement, e.target);
                    draggedElement.parentNode.insertBefore(e.target, nextSibling);
                }
            });
        }
    }

    initializeHoverEffects() {
        const cards = this.container.querySelectorAll('.module, .project-card, .badge');
        
        cards.forEach(card => {
            card.addEventListener('mouseenter', () => {
                card.style.transform = 'translateY(-4px)';
                card.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)';
            });
            
            card.addEventListener('mouseleave', () => {
                card.style.transform = 'translateY(0)';
                card.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
            });
        });
    }

    initializeClickHandlers() {
        // Add any specific click handlers here
        const badges = this.container.querySelectorAll('.badge');
        badges.forEach(badge => {
            badge.addEventListener('click', (e) => {
                // Show badge details or verification info
                console.log('Badge clicked:', badge.querySelector('.badge-title').textContent);
            });
        });
    }

    renderSkillsChart(skillsViz) {
        // Placeholder for chart rendering - would use Chart.js or D3.js
        const chartContainer = this.container.querySelector('#skillsChart');
        if (chartContainer) {
            chartContainer.innerHTML = '<div style="text-align: center; padding: 40px; background: #f8f9fa; border-radius: 8px;">📊 Skills chart would render here with Chart.js</div>';
        }
    }

    renderError(message) {
        this.container.innerHTML = `
            <div class="error-container">
                <div class="error-icon">❌</div>
                <h3>Analysis Error</h3>
                <p>${message}</p>
                <button onclick="location.reload()" class="retry-button">Retry</button>
            </div>
        `;
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Usage example
const api = new TrustHireAPI();
const renderer = new EnhancedProfileRenderer('profile-container');

// Example usage function
async function analyzeAndRender(username) {
    try {
        console.log('🚀 Starting enhanced analysis for', username);
        
        const result = await api.analyzeUser(username, {
            depth: 'Frontend',
            includeFrontendData: true
        });
        
        if (result.frontend_profile) {
            await renderer.render(result.frontend_profile, username);
            console.log('✅ Profile rendered successfully');
        } else {
            renderer.renderError('No frontend profile data available');
        }
        
    } catch (error) {
        console.error('❌ Analysis failed:', error);
        renderer.renderError(error.message);
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { TrustHireAPI, EnhancedProfileRenderer };
}