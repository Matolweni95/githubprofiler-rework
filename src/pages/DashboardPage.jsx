import React, { useState, useEffect } from 'react';
import Navbar from '../components/dashboard/Navbar';
import { Search, Star, GitFork, Clock, TrendingUp, Activity, Code, User, RefreshCw, ChevronRight, ChevronLeft } from 'lucide-react';
import useGithubApi from '../hooks/useGithubApi'; 
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

const DashboardPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userRepos, setUserRepos] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [userProfile, setUserProfile] = useState(null);
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const reposPerPage = 10;

   // Function to get current page's repo
   const getCurrentPageRepos = () => {
    if (!searchResults || !searchResults.repos) return [];

    const indexOfLastRepo = currentPage * reposPerPage;
    const indexOfFirstRepo = indexOfLastRepo - reposPerPage;
    return searchResults.repos.slice(indexOfFirstRepo, indexOfLastRepo);
  };

  // Calculate total pages
  const getTotalPages = () => {
    if (!searchResults || !searchResults.repos) return 0;
    return Math.ceil(searchResults.repos.length / reposPerPage);
  };

  // Reset current page when search results change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchResults]);

  // Default fallback profile
  const fallbackUser = {
    avatar_url: "https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png",
    name: "Your Name",
    login: "your-username",
    followers: 0,
    public_repos: 0,
    location: "Your Location",
    bio: "Your bio information"
  };
  
  const { 
    fetchRepoDetails,
    fetchAuthenticatedUser, 
    fetchUserRepos: fetchGithubUserRepos,
    fetchUserData,
    loading: apiLoading, 
    error: apiError 
  } = useGithubApi();

  // Load data from local storage or fetch new data
  const loadUserData = async (forceRefresh = false) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const cachedData = localStorage.getItem('githubDashboardData');
      if (!forceRefresh && cachedData) {
        const parsedData = JSON.parse(cachedData);
        setUserProfile(parsedData.userProfile);
        setUserRepos(parsedData.userRepos);
        setRecentActivity(parsedData.recentActivity);
        setIsLoading(false);
        return;
      }
      
      // Fetch fresh data if no cache or force refresh
      let userData = await fetchAuthenticatedUser();
      
      if (!userData || apiError) {
        console.log("No authenticated user found, using fallback profile");
        userData = fallbackUser;
      }
      
      setUserProfile(userData);
      
      // Fetch repositories for the user
      const repos = await fetchGithubUserRepos(userData.login);
      localStorage.setItem('fullRepo', JSON.stringify(repos));
      const formattedRepos = repos && repos.length > 0 
        ? repos.slice(0, 5).map(repo => ({
            id: repo.id,
            name: repo.name,
            language: repo.language,
            stars: repo.stargazers_count,
            forks: repo.forks_count,
            updated_at: repo.updated_at,
            owner: repo.owner?.login
          }))
        : [
            { id: 1, name: 'react-dashboard', language: 'JavaScript', stars: 32, forks: 8, updated_at: '2025-02-15T14:22:10Z' },
            { id: 2, name: 'tailwind-components', language: 'CSS', stars: 154, forks: 47, updated_at: '2025-02-28T09:15:22Z' },
            { id: 3, name: 'api-toolkit', language: 'TypeScript', stars: 78, forks: 12, updated_at: '2025-02-10T11:30:45Z' },
            { id: 4, name: 'nextjs-blog-template', language: 'JavaScript', stars: 92, forks: 38, updated_at: '2025-02-20T16:05:10Z' },
          ];
      
      setUserRepos(formattedRepos);
      
      // recent activity dummy data
      const activity = [
        { id: 1, type: 'commit', repo: 'react-dashboard', message: 'Fix navbar responsiveness', time: '3 hours ago' },
        { id: 2, type: 'star', repo: 'awesome-react', owner: 'facebook', time: '1 day ago' },
        { id: 3, type: 'fork', repo: 'tailwind-ui', owner: 'tailwindlabs', time: '2 days ago' },
        { id: 4, type: 'issue', repo: 'api-toolkit', message: 'Add pagination to results', time: '3 days ago' },
      ];
      setRecentActivity(activity);
      
      // Cache the data in local storage
      localStorage.setItem('githubDashboardData', JSON.stringify({
        userProfile: userData,
        userRepos: formattedRepos,
        recentActivity: activity
      }));
      
    } catch (err) {
      console.error("Error loading user data:", err);
      setUserProfile(fallbackUser);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial data load on component mount
  useEffect(() => {
    loadUserData();
  }, []);

  const handleManualRefresh = () => {
    loadUserData(true);
  };

  // Search function
  const handleSearch = async (query) => {
    if (!query.trim()) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Create a unique cache key for the search query
      const cacheKey = `github-search-${query}`;
      const cachedResults = localStorage.getItem(cacheKey);
  
      // Check if cached results exist and are recent
      if (cachedResults) {
        const { data, timestamp } = JSON.parse(cachedResults);
        const oneHourAgo = Date.now() - (60 * 60 * 1000);
  
        if (timestamp > oneHourAgo) {
          setSearchResults(data);
          setIsLoading(false);
          return;
        }
      }
  
      // Fetch user data
      const userData = await fetchUserData(query);
      
      if (!userData) {
        throw new Error('User not found');
      }
      
      // Fetch repositories
      const reposData = await fetchGithubUserRepos(query);
      const searchResultsData = {
        user: userData,
        repos: reposData || []
      };
  
      // Cache the search results with a timestamp
      localStorage.setItem(cacheKey, JSON.stringify({
        data: searchResultsData,
        timestamp: Date.now()
      }));
  
      setSearchResults(searchResultsData);
    } catch (error) {
      setError(error.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle search submission
  const handleSubmit = (e) => {
    e.preventDefault();
    handleSearch(searchQuery);
  };

  // Function to format date to relative time
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    return `${Math.floor(diffInDays / 30)} months ago`;
  };

  // Get language color
  const getLanguageColor = (language) => {
    const colors = {
      JavaScript: 'bg-yellow-400',
      TypeScript: 'bg-blue-600',
      Python: 'bg-green-500',
      Java: 'bg-red-600',
      CSS: 'bg-purple-500',
      HTML: 'bg-orange-500',
      Swift: 'bg-pink-500',
      Kotlin: 'bg-indigo-500',
      Ruby: 'bg-red-400',
      Go: 'bg-blue-400',
    };
    return colors[language] || 'bg-gray-400';
  };

  const handleViewDetails = (owner, repoName) => {
    navigate(`/repo/${owner}/${repoName}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={userProfile || fallbackUser} />
      
      <main className="container mx-auto px-4 py-6">
      <div className="mb-4 flex justify-end">
          <button 
            onClick={handleManualRefresh}
            className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh Data
          </button>
        </div>
        {/* Main Search Section */}
        <div className="mb-6">
          <form onSubmit={handleSubmit} className="flex justify-center">
            <div className="relative w-full max-w-2xl">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                <Search className="h-5 w-5 text-gray-500" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for a GitHub user..."
                className="w-full rounded-lg border-0 bg-white py-3 pl-10 pr-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-blue-600"
              />
              <button
                type="submit"
                className="absolute right-2 top-2 rounded-md bg-blue-600 px-4 py-1 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Search
              </button>
            </div>
          </form>
        </div>
        
        {/* Error Message */}
        {error && (
          <div className="mb-6 rounded-md bg-red-50 p-4 text-center text-red-800">
            {error}
          </div>
        )}
        
        {/* Search Results */}
        {searchResults && (
          <div className="space-y-6">
            {/* User Profile Card */}
            <div className="overflow-hidden rounded-lg bg-white shadow">
              <div className="p-6">
                <div className="flex flex-col sm:flex-row items-center sm:items-start">
                  <img 
                    src={searchResults.user.avatar_url} 
                    alt={searchResults.user.login} 
                    className="h-24 w-24 rounded-full object-cover border-4 border-white shadow"
                  />
                  <div className="mt-4 sm:mt-0 sm:ml-6 text-center sm:text-left">
                    <h2 className="text-2xl font-bold text-gray-900">{searchResults.user.name || searchResults.user.login}</h2>
                    <p className="text-gray-600">@{searchResults.user.login}</p>
                    <div className="mt-2 flex flex-wrap justify-center sm:justify-start gap-4">
                      {searchResults.user.location && (
                        <div className="text-gray-600 flex items-center">
                          <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                          </svg>
                          {searchResults.user.location}
                        </div>
                      )}
                      <div className="text-gray-600 flex items-center">
                        <User className="h-4 w-4 mr-1" />
                        {searchResults.user.followers} followers
                      </div>
                      <div className="text-gray-600 flex items-center">
                        <Code className="h-4 w-4 mr-1" />
                        {searchResults.user.public_repos} repositories
                      </div>
                    </div>
                    {searchResults.user.bio && (
                      <p className="mt-3 text-gray-700">{searchResults.user.bio}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Repository List */}
            {searchResults && searchResults.repos.length > 0 && (
              <div className="overflow-hidden rounded-lg bg-white shadow">
                <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
                  <h3 className="text-lg font-medium text-gray-900 flex items-center">
                    <Code className="h-5 w-5 mr-2 text-gray-600" />
                    Repositories
                  </h3>
                </div>
                <div className="divide-y divide-gray-200">
                  {getCurrentPageRepos().map(repo => (
                    <div key={repo.id} className="p-6 hover:bg-gray-50">
                      <div className="flex flex-col sm:flex-row sm:justify-between">
                        <div>
                          <div onClick={() => handleViewDetails(searchResults.user.login, repo.name)}>
                            <h4 className="text-lg font-medium text-blue-600 hover:underline">
                              {repo.name}
                            </h4>
                          </div>
                          {repo.description && (
                            <p className="mt-1 text-sm text-gray-600">{repo.description}</p>
                          )}
                          <div className="mt-2 flex items-center flex-wrap gap-4">
                            {repo.language && (
                              <div className="flex items-center">
                                <span className={`inline-block h-3 w-3 rounded-full ${getLanguageColor(repo.language)}`}></span>
                                <span className="ml-1 text-xs text-gray-600">{repo.language}</span>
                              </div>
                            )}
                            <div className="flex items-center text-xs text-gray-600">
                              <Star className="h-3 w-3 mr-1" />
                              {repo.stargazers_count || 0}
                            </div>
                            <div className="flex items-center text-xs text-gray-600">
                              <GitFork className="h-3 w-3 mr-1" />
                              {repo.forks_count || 0}
                            </div>
                            <div className="flex items-center text-xs text-gray-600">
                              <Clock className="h-3 w-3 mr-1" />
                              Updated {formatDate(repo.updated_at)}
                            </div>
                          </div>
                        </div>
                      
                      </div>
                    </div>
                  ))}
                  
                </div>
                {getTotalPages() > 1 && (
                  <div className="flex justify-between items-center border-t border-gray-200 p-4">
                    <div className="text-sm text-gray-600">
                      Page {currentPage} of {getTotalPages()}
                    </div>
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => setCurrentPage(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="p-2 rounded-md bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                      <button 
                        onClick={() => setCurrentPage(currentPage + 1)}
                        disabled={currentPage === getTotalPages()}
                        className="p-2 rounded-md bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronRight className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
        
        {/* Initial Dashboard State */}
        {!searchResults && !isLoading && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Profile Card */}
            <div className="col-span-full overflow-hidden rounded-lg bg-white shadow">
              <div className="p-6">
                <div className="flex flex-col sm:flex-row items-center sm:items-start">
                  <img 
                    src={userProfile?.avatar_url || fallbackUser.avatar_url} 
                    alt={userProfile?.login || fallbackUser.login} 
                    className="h-24 w-24 rounded-full object-cover border-4 border-white shadow"
                  />
                  <div className="mt-4 sm:mt-0 sm:ml-6 text-center sm:text-left">
                    <h2 className="text-2xl font-bold text-gray-900">
                      {userProfile?.name || userProfile?.login || fallbackUser.name}
                    </h2>
                    <p className="text-gray-600">@{userProfile?.login || fallbackUser.login}</p>
                    <div className="mt-2 flex flex-wrap justify-center sm:justify-start gap-4">
                      {(userProfile?.location || fallbackUser.location) && (
                        <div className="text-gray-600 flex items-center">
                          <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                          </svg>
                          {userProfile?.location || fallbackUser.location}
                        </div>
                      )}
                      <div className="text-gray-600 flex items-center">
                        <User className="h-4 w-4 mr-1" />
                        {userProfile?.followers || fallbackUser.followers} followers
                      </div>
                      <div className="text-gray-600 flex items-center">
                        <Code className="h-4 w-4 mr-1" />
                        {userProfile?.public_repos || fallbackUser.public_repos} repositories
                      </div>
                    </div>
                    {(userProfile?.bio || fallbackUser.bio) && (
                      <p className="mt-3 text-gray-700">{userProfile?.bio || fallbackUser.bio}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Your Repositories Card */}
            <div className="col-span-full md:col-span-1 lg:col-span-2 overflow-hidden rounded-lg bg-white shadow">
              <div className="border-b border-gray-200 bg-gray-50 px-6 py-4 flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                  <Code className="h-5 w-5 mr-2 text-gray-600" />
                  Your Repositories
                </h3>
                <button 
                 onClick={() => {
                  
                  navigate('/detailed');
                }} 
                className="text-sm text-blue-600 hover:text-blue-800">View all</button>
              </div>
              <div className="divide-y divide-gray-200">
                {userRepos.length > 0 ? (
                  userRepos.map(repo => (
                    <div key={repo.id} className="p-4 hover:bg-gray-50">
                      <div className="flex justify-between items-start">
                        <div  onClick={() => handleViewDetails(repo.owner, repo.name)}>
                                         
                        <h4 className="font-medium text-blue-600 hover:underline">
                            {repo.name}
                          </h4>
                          
                          <div className="mt-2 flex items-center space-x-4">
                            {repo.language && (
                              <div className="flex items-center">
                                <span className={`inline-block h-3 w-3 rounded-full ${getLanguageColor(repo.language)}`}></span>
                                <span className="ml-1 text-xs text-gray-600">{repo.language}</span>
                              </div>
                            )}
                            <div className="flex items-center text-xs text-gray-600">
                              <Star className="h-3 w-3 mr-1" />
                              {repo.stars}
                            </div>
                            <div className="flex items-center text-xs text-gray-600">
                              <GitFork className="h-3 w-3 mr-1" />
                              {repo.forks}
                            </div>
                          </div>
                        </div>
                        <div>
                          <span className="text-xs text-gray-500">
                            Updated {formatDate(repo.updated_at)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-6 text-center text-gray-500">
                    No repositories found. Check again later.
                  </div>
                )}
              </div>
            </div>

            {/* Recent Activity Card */}
            <div className="overflow-hidden rounded-lg bg-white shadow">
              <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                  <Activity className="h-5 w-5 mr-2 text-gray-600" />
                  Recent Activity
                </h3>
              </div>
              <div className="divide-y divide-gray-200">
                {recentActivity.length > 0 ? (
                  recentActivity.map(activity => (
                    <div key={activity.id} className="p-4 hover:bg-gray-50">
                      <div className="flex items-start">
                        <div className="mr-3 mt-1">
                          {activity.type === 'commit' && <Code className="h-4 w-4 text-green-600" />}
                          {activity.type === 'star' && <Star className="h-4 w-4 text-yellow-500" />}
                          {activity.type === 'fork' && <GitFork className="h-4 w-4 text-blue-500" />}
                          {activity.type === 'issue' && (
                            <svg className="h-4 w-4 text-purple-500" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" />
                            </svg>
                          )}
                        </div>
                        <div>
                          <div className="text-sm">
                            {activity.type === 'commit' && (
                              <span>Committed to <span className="font-medium text-blue-600">{activity.repo}</span>: {activity.message}</span>
                            )}
                            {activity.type === 'star' && (
                              <span>Starred <span className="font-medium text-blue-600">{activity.owner}/{activity.repo}</span></span>
                            )}
                            {activity.type === 'fork' && (
                              <span>Forked <span className="font-medium text-blue-600">{activity.owner}/{activity.repo}</span></span>
                            )}
                            {activity.type === 'issue' && (
                              <span>Opened issue in <span className="font-medium text-blue-600">{activity.repo}</span>: {activity.message}</span>
                            )}
                          </div>
                          <div className="mt-1 text-xs text-gray-500">{activity.time}</div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-6 text-center text-gray-500">
                    No recent activity found.
                  </div>
                )}
              </div>
            </div>

            {/* Trending Repositories Card */}
            <div className="col-span-full overflow-hidden rounded-lg bg-white shadow">
              <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2 text-gray-600" />
                  Trending on GitHub
                </h3>
              </div>
              <div className="p-0 sm:p-2">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                  {[
                    { name: 'vercel/next.js', description: 'The React Framework for Production', stars: 98452, language: 'JavaScript' },
                    { name: 'facebook/react', description: 'A declarative, efficient, and flexible JavaScript library for building user interfaces', stars: 189563, language: 'JavaScript' },
                    { name: 'tailwindlabs/tailwindcss', description: 'A utility-first CSS framework for rapid UI development', stars: 68742, language: 'CSS' },
                  ].map((repo, index) => (
                    <div key={index} className="rounded-md border border-gray-200 p-4 hover:shadow-md transition-shadow">
                      <h4 className="font-medium text-blue-600 truncate">{repo.name}</h4>
                      <p className="mt-1 text-sm text-gray-600 line-clamp-2">{repo.description}</p>
                      <div className="mt-3 flex items-center justify-between">
                        <div className="flex items-center">
                          <span className={`inline-block h-3 w-3 rounded-full ${getLanguageColor(repo.language)}`}></span>
                          <span className="ml-1 text-xs text-gray-600">{repo.language}</span>
                        </div>
                        <div className="flex items-center text-xs text-gray-600">
                          <Star className="h-3 w-3 mr-1" />
                          {repo.stars.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
          </div>
        )}
      </main>
    </div>
  );
};

export default DashboardPage;