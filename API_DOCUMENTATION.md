# IdenZero API Documentation

The IdenZero Skill Analyzer provides a comprehensive RESTful API for analyzing GitHub developers. This API offers multiple endpoints with different levels of detail to suit various use cases.

## Base URL
```
http://localhost:3030/api
```

## Endpoints Overview

### 1. Streamlined Profile (Recommended) ⚡
**GET** `/streamlined/{username}`

The most efficient endpoint that provides essential information with minimal data overhead.

#### Response Format
```json
{
  "success": true,
  "profile": {
    "username": "developer_name",
    "summary": "Mid-level developer with 4.2 years of experience in Rust. Specialized in Blockchain Development with 45 public repositories and strong focus on Web3/Blockchain.",
    "proficiency": ["Rust", "TypeScript", "Solidity", "Blockchain Development", "DeFi"],
    "top_languages": [
      {
        "name": "Rust",
        "percentage": 45.2,
        "lines_of_code": 125000
      },
      {
        "name": "TypeScript",
        "percentage": 22.1,
        "lines_of_code": 61200
      }
    ],
    "recent_commits": [
      {
        "message": "Add support for EIP-1559 gas estimation",
        "repository": "defi-protocol",
        "date": "2025-09-25T14:30:00Z",
        "url": "https://github.com/user/repo/commit/abc123"
      }
    ],
    "key_contributions": [
      {
        "repository": "awesome-project",
        "description": "A decentralized finance protocol for yield farming",
        "stars": 1240,
        "primary_language": "Rust",
        "readme_insights": "DeFi protocol that enables users to earn yield through automated market making strategies. Features include liquidity mining, governance tokens, and cross-chain compatibility..."
      }
    ],
    "github_stats": {
      "public_repos": 45,
      "followers": 128,
      "following": 89,
      "years_active": 4.2,
      "total_commits": 9450
    },
    "last_updated": "2025-09-27T10:00:00Z"
  }
}
```

### 2. Health Check 📊
**GET** `/health`

Check if the API server is running and healthy.

#### Response
```json
{
  "status": "healthy",
  "timestamp": "2025-09-27T10:00:00Z",
  "service": "idenzero-analyzer"
}
```

### 3. Quick Analysis 🧑‍💻
**GET** `/quick/{username}`

Basic analysis with core metrics only.

### 4. Full Analysis 🔍
**POST** `/analyze`

Comprehensive analysis with all available features.

#### Request Body
```json
{
  "username": "developer_name",
  "wallet_address": "0x742d35Cc6634C0532925a3b8D772C3B5F68D2C66",
  "include_frontend_data": true,
  "analysis_depth": "Detailed"
}
```

### 5. Frontend Profile 🎨
**GET** `/profile/{username}`

Frontend-optimized data structure for web applications.

### 6. Compare Developers 🔄
**POST** `/compare`

Compare multiple developers side by side.

#### Request Body
```json
{
  "usernames": ["dev1", "dev2", "dev3"]
}
```

## Frontend Integration Guide

### HTML Example
```html
<!DOCTYPE html>
<html>
<head>
    <title>IdenZero Developer Analysis</title>
    <style>
        .profile-card { 
            border: 1px solid #ddd; 
            padding: 20px; 
            margin: 10px;
            border-radius: 8px;
        }
        .language-bar {
            background: #f0f0f0;
            border-radius: 4px;
            height: 20px;
            margin: 5px 0;
        }
        .language-fill {
            height: 100%;
            border-radius: 4px;
            transition: width 0.3s ease;
        }
    </style>
</head>
<body>
    <div id="search-container">
        <input type="text" id="username-input" placeholder="Enter GitHub username">
        <button onclick="analyzeUser()">Analyze Developer</button>
    </div>
    
    <div id="results-container"></div>

    <script>
        // See JavaScript section below
    </script>
</body>
</html>
```

### JavaScript Integration

#### Basic Usage
```javascript
class IdenZeroAPI {
    constructor(baseUrl = 'http://localhost:3030/api') {
        this.baseUrl = baseUrl;
    }

    async getStreamlinedProfile(username) {
        try {
            const response = await fetch(`${this.baseUrl}/streamlined/${username}`);
            const data = await response.json();
            
            if (data.success) {
                return data.profile;
            } else {
                throw new Error(data.error || 'Analysis failed');
            }
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }
}

// Usage
const api = new IdenZeroAPI();

async function analyzeUser() {
    const username = document.getElementById('username-input').value;
    if (!username) return;

    try {
        const profile = await api.getStreamlinedProfile(username);
        displayProfile(profile);
    } catch (error) {
        displayError(error.message);
    }
}

function displayProfile(profile) {
    const container = document.getElementById('results-container');
    container.innerHTML = `
        <div class="profile-card">
            <h2>@${profile.username}</h2>
            <p><strong>Summary:</strong> ${profile.summary}</p>
            
            <h3>Top Languages</h3>
            ${profile.top_languages.map(lang => `
                <div class="language-item">
                    <div class="language-info">
                        <span>${lang.name}</span>
                        <span>${lang.percentage.toFixed(1)}%</span>
                    </div>
                    <div class="language-bar">
                        <div class="language-fill" style="width: ${lang.percentage}%; background-color: ${getLanguageColor(lang.name)}"></div>
                    </div>
                </div>
            `).join('')}
            
            <h3>Proficiency</h3>
            <div class="tags">
                ${profile.proficiency.map(skill => `<span class="tag">${skill}</span>`).join('')}
            </div>
            
            <h3>Recent Commits</h3>
            <ul>
                ${profile.recent_commits.slice(0, 5).map(commit => `
                    <li>
                        <strong>${commit.repository}:</strong> ${commit.message}
                        <br><small>${new Date(commit.date).toLocaleDateString()}</small>
                    </li>
                `).join('')}
            </ul>
            
            <h3>Key Contributions</h3>
            ${profile.key_contributions.map(contrib => `
                <div class="contribution">
                    <h4>${contrib.repository} ⭐ ${contrib.stars}</h4>
                    <p>${contrib.description}</p>
                    ${contrib.readme_insights ? `<p><em>${contrib.readme_insights}</em></p>` : ''}
                </div>
            `).join('')}
            
            <h3>GitHub Stats</h3>
            <div class="stats">
                <div>📊 ${profile.github_stats.public_repos} repos</div>
                <div>👥 ${profile.github_stats.followers} followers</div>
                <div>📅 ${profile.github_stats.years_active.toFixed(1)} years active</div>
                <div>💻 ~${profile.github_stats.total_commits.toLocaleString()} commits</div>
            </div>
        </div>
    `;
}

function getLanguageColor(language) {
    const colors = {
        'Rust': '#dea584',
        'TypeScript': '#3178c6',
        'JavaScript': '#f1e05a',
        'Python': '#3572a5',
        'Solidity': '#AA6746',
        'Go': '#00ADD8',
        'Java': '#b07219',
        'C++': '#f34b7d',
        'C': '#555555'
    };
    return colors[language] || '#6366f1';
}
```

#### Advanced Features
```javascript
class AdvancedIdenZeroAPI extends IdenZeroAPI {
    async compareUsers(usernames) {
        const response = await fetch(`${this.baseUrl}/compare`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ usernames })
        });
        return await response.json();
    }

    async fullAnalysis(username, options = {}) {
        const response = await fetch(`${this.baseUrl}/analyze`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username,
                wallet_address: options.walletAddress || null,
                include_frontend_data: options.includeFrontend !== false,
                analysis_depth: options.depth || 'Frontend'
            })
        });
        return await response.json();
    }

    // Batch analysis with caching
    async batchAnalyze(usernames, maxConcurrent = 3) {
        const results = [];
        const errors = [];

        for (let i = 0; i < usernames.length; i += maxConcurrent) {
            const batch = usernames.slice(i, i + maxConcurrent);
            const promises = batch.map(async (username) => {
                try {
                    return await this.getStreamlinedProfile(username);
                } catch (error) {
                    errors.push({ username, error: error.message });
                    return null;
                }
            });

            const batchResults = await Promise.all(promises);
            results.push(...batchResults.filter(r => r !== null));

            // Rate limiting
            if (i + maxConcurrent < usernames.length) {
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }

        return { results, errors };
    }
}
```

### React Example
```jsx
import React, { useState, useEffect } from 'react';

const DeveloperProfile = ({ username }) => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const api = new IdenZeroAPI();
                const profileData = await api.getStreamlinedProfile(username);
                setProfile(profileData);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (username) {
            fetchProfile();
        }
    }, [username]);

    if (loading) return <div>Analyzing {username}...</div>;
    if (error) return <div>Error: {error}</div>;
    if (!profile) return null;

    return (
        <div className="developer-profile">
            <h2>@{profile.username}</h2>
            <p>{profile.summary}</p>
            
            <div className="languages">
                {profile.top_languages.map(lang => (
                    <div key={lang.name} className="language">
                        <span>{lang.name}</span>
                        <span>{lang.percentage.toFixed(1)}%</span>
                    </div>
                ))}
            </div>
            
            {/* Additional components */}
        </div>
    );
};
```

## Error Handling

All endpoints return consistent error responses:

```json
{
  "success": false,
  "error": "Error description",
  "username": "requested_username"
}
```

Common error codes:
- **404**: User not found
- **403**: GitHub API rate limit exceeded
- **500**: Internal server error

## Rate Limits

The API respects GitHub's rate limits:
- **Authenticated requests**: 5,000 per hour
- **Unauthenticated**: 60 per hour

## Authentication

Set the `GITHUB_TOKEN` environment variable with a Personal Access Token for higher rate limits and access to private repository data.

```bash
export GITHUB_TOKEN=your_github_token_here
```

## Running the Server

```bash
# Development mode
cargo run server

# Production mode  
cargo build --release
./target/release/idenzero-analyzer server
```

The server will start on `http://localhost:3030`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

For more information, visit the [GitHub repository](https://github.com/rubberpirate/ETH-SS).