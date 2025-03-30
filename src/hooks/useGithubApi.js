import { useState } from 'react';

const useGithubApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Extract user info from JWT token
  const extractUserFromToken = () => {
    try {
      const tokenString = localStorage.getItem('sb-hpbqcsdnelanzpwzvxsf-auth-token');
      
      if (!tokenString) {
        console.log('No token found in localStorage');
        return null;
      }
      
      // Parse the Supabase token JSON
      const tokenData = JSON.parse(tokenString);
      const jwt = tokenData.access_token;
      
      if (!jwt) {
        console.log('No access token found in token data');
        return null;
      }
      
      // decode the JWT to get the payload & get GitHub username from meta data
      const payload = JSON.parse(atob(jwt.split('.')[1]));
      
      if (payload && payload.user_metadata && payload.user_metadata.user_name) {
        const username = payload.user_metadata.user_name;
        
        // Fetch the full GitHub user profile
        return fetchUserData(username);
      }
      
      return null;
    } catch (err) {
      console.error('Error extracting user from token:', err);
      return null;
    }
  };
  
  const getHeaders = () => {
    const token = localStorage.getItem('github_token');
    const headers = {
      'Accept': 'application/vnd.github.v3+json'
    };
    
    if (token) {
      headers['Authorization'] = `token ${token}`;
    }
    
    return headers;
  };
  
  const handleResponse = async (response) => {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.message || `HTTP error ${response.status}`;
      throw new Error(errorMessage);
    }
    return response.json();
  };
  
  // Fetch user data by username
  const fetchUserData = async (username) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`https://api.github.com/users/${username}`, {
        headers: getHeaders()
      });
      
      const data = await handleResponse(response);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  const fetchAuthenticatedUser = async () => {
    try {
      // Extract user info from token
      const tokenString = localStorage.getItem('sb-hpbqcsdnelanzpwzvxsf-auth-token');
      
      if (!tokenString) {
        throw new Error('No authentication token found');
      }
      
      // Parse the Supabase token JSON
      const tokenData = JSON.parse(tokenString);
      const jwt = tokenData.access_token;
      
      // Decode JWT and get username
      const payload = JSON.parse(atob(jwt.split('.')[1]));
      const username = payload.user_metadata.user_name;
      
      if (!username) {
        throw new Error('No username found in token');
      }
      
      // Fetch user data with the extracted username
      return fetchUserData(username);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching authenticated user:', err);
      return null;
    }
  };
  
  // Fetch user repositories
  const fetchUserRepos = async (username, sort = 'updated') => {
    setLoading(true);
    setError(null);
    
    const allRepos = [];
    let page = 1;
    const perPage = 100; 
  
    try {
      while (true) {
        const response = await fetch(
          `https://api.github.com/users/${username}/repos?page=${page}&sort=${sort}&per_page=${perPage}`,
          { headers: getHeaders() }
        );
        
        const data = await handleResponse(response);
        
        if (!data || data.length === 0) {
          break;
        }

        allRepos.push(...data);
        
        if (data.length < perPage) {
          break;
        }
        
        page++;
      }
  
      return allRepos;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch authenticated user's repositories
  const fetchMyRepos = async (sort = 'updated', per_page = 10) => {
    setLoading(true);
    setError(null);
    
    try {
      // First get the authenticated user
      const user = await fetchAuthenticatedUser();
      
      if (!user || !user.login) {
        throw new Error('Unable to get authenticated user information');
      }
      
      // Then fetch their repos
      return fetchUserRepos(user.login, sort, per_page);
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch repository details
  const fetchRepoDetails = async (username, repoName) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(
        `https://api.github.com/repos/${username}/${repoName}`,
        { headers: getHeaders() }
      );
      
      const data = await handleResponse(response);
      console.log(data)
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch repository languages
  const fetchRepoLanguages = async (username, repoName) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(
        `https://api.github.com/repos/${username}/${repoName}/languages`,
        { headers: getHeaders() }
      );
      
      const data = await handleResponse(response);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch repository commits
  const fetchRepoCommits = async (username, repoName, per_page = 10) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(
        `https://api.github.com/repos/${username}/${repoName}/commits?per_page=${per_page}`,
        { headers: getHeaders() }
      );
      
      const data = await handleResponse(response);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const fetchRepoBranches = async (username, repoName) => {
    // GitHub API endpoint for listing branches
    const url = `https://api.github.com/repos/${username}/${repoName}/branches`;
    
    try {
      const response = await fetch(url, {
        headers: {
          'Accept': 'application/vnd.github.v3+json',
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`GitHub API error: ${response.status} - ${errorData.message || 'Unknown error'}`);
      }
      
      // Parse and return the branches data
      const branches = await response.json();
      return branches;
    } catch (error) {
      console.error('Error fetching repository branches:', error);
      throw error;
    }
  }

  async function fetchRepoContributors(username, repoName, options = {}) {
    const { token, perPage = 30, anon = false } = options;
    
    // GitHub API endpoint for listing contributors
    let url = `https://api.github.com/repos/${username}/${repoName}/contributors`;
    
    // query parameters
    const params = new URLSearchParams();
    if (perPage) params.append('per_page', perPage);
    if (anon) params.append('anon', 1);
    
    if (params.toString()) {
      url += `?${params.toString()}`;
    }
    
    const headers = {
      'Accept': 'application/vnd.github.v3+json'
    };
    
    if (token) {
      headers['Authorization'] = `token ${token}`;
    }
    
    try {
      const response = await fetch(url, { headers });
        if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`GitHub API error: ${response.status} - ${errorData.message || 'Unknown error'}`);
      }
      
      // Check for pagination
      const contributors = await response.json();
      const linkHeader = response.headers.get('Link');
      if (linkHeader && linkHeader.includes('rel="next"')) {
        console.warn('There are more contributors available. Consider implementing pagination.');
      }
      
      return contributors;
    } catch (error) {
      console.error('Error fetching repository contributors:', error);
      throw error;
    }
  }

  // Fetch Readme
  async function fetchRepoReadme(username, repoName, options = {}) {
    const { token, branch, format = 'json' } = options;
    let url = `https://api.github.com/repos/${username}/${repoName}/readme`;
    
    if (branch) {
      url += `?ref=${branch}`;
    }
  
    const headers = {
      'Accept': format === 'raw' ? 'application/vnd.github.v3.raw' 
             : format === 'html' ? 'application/vnd.github.v3.html' 
             : 'application/vnd.github.v3+json'
    };
  
    if (token) {
      headers['Authorization'] = `token ${token}`;
    }
  
    try {
      const response = await fetch(url, { headers });
  
      if (!response.ok) {
        if (response.status === 404) {
          return generateFallbackReadme(username, repoName);
        }
  
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`GitHub API error: ${response.status} - ${errorData.message || 'Unknown error'}`);
      }
  
      if (format === 'raw' || format === 'html') {
        return await response.text();
      } else {
        const data = await response.json();
        if (data.content) {
          const decodedContent = atob(data.content); 
          return stripMarkdown(decodedContent); 
        }
        return data;
      }
    } catch (error) {
      console.error('Error fetching repository README:', error);
      
      // Fallback to generate a README 
      return generateFallbackReadme(username, repoName);
    }
  }
  
  // Fallback README generator function
  function generateFallbackReadme(username, repoName) {
    return `
  This is an automatically generated README for the repository: ${repoName} by ${username}.`;
  }
  
  function stripMarkdown(markdown) {
    return markdown
      .replace(/^#+\s*/gm, '')   // Remove headers
      .replace(/[*_`]/g, '')     // Remove formatting characters
      .replace(/!\[.*?\]\(.*?\)/g, '') // Remove images
      .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1') // Replace link text
      .trim();
  }
  
  // Function to remove Markdown syntax
  function stripMarkdown(markdown) {
    return markdown
    .replace(/^# (.*$)/gm, '<h1>$1</h1>') // H1 -> <h1>
    .replace(/^## (.*$)/gm, '<h2>$1</h2>') // H2 -> <h2>
    .replace(/^### (.*$)/gm, '<h3>$1</h3>') // H3 -> <h3>
    .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>') // **bold** -> <b>
    .replace(/\*(.*?)\*/g, '<i>$1</i>') // *italic* -> <i>
    .replace(/\[(.*?)\]\(.*?\)/g, '$1') // Remove links but keep text
    .replace(/\n{2,}/g, '<br><br>'); // Double newlines -> <br><br>
  }

  // Fetch repository languages
const fetchRepoLanguage = async (owner, repo) => {
  setLoading(true);
  setError(null);
  
  try {
    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/languages`,
      { headers: getHeaders() }
    );
    
    const data = await handleResponse(response);
    
    // Calculate percentages
    const totalBytes = Object.values(data).reduce((sum, bytes) => sum + bytes, 0);
    const languagesWithPercentages = Object.entries(data).map(([language, bytes]) => ({
      name: language,
      percentage: ((bytes / totalBytes) * 100).toFixed(2)
    }));
    
    return languagesWithPercentages;
  } catch (err) {
    setError(err.message);
    throw err;
  } finally {
    setLoading(false);
  }
};
  
  return {
    fetchUserData,
    fetchUserRepos,
    fetchRepoDetails,
    fetchRepoLanguages,
    fetchRepoCommits,
    fetchAuthenticatedUser,
    fetchMyRepos,
    extractUserFromToken,
    fetchRepoBranches,
    fetchRepoContributors,
    fetchRepoReadme,
    fetchRepoLanguage,
    loading,
    error
  };
};

export default useGithubApi;