import React, { useState, useEffect } from 'react';
import { Code, Star, GitFork, AlertCircle, ChevronLeft, ChevronRight, User as UserIcon } from 'lucide-react';
import Navbar from '../dashboard/Navbar';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const RepoListViewer = () => {
  const [userProfile, setUserProfile] = useState(null);
  const [userRepos, setUserRepos] = useState([]);
  const [filteredRepos, setFilteredRepos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState('updated');
  const [filterLanguage, setFilterLanguage] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [reposPerPage] = useState(10);

  useEffect(() => {
    try {
      const storedData = localStorage.getItem('githubDashboardData');
      if (storedData) {
        const parsedData = JSON.parse(storedData);
        setUserProfile(parsedData.userProfile);
      }

      const repoData = localStorage.getItem('fullRepo');
      if (repoData) {
        const parsedRepoData = JSON.parse(repoData);        
        const allRepos = Array.isArray(parsedRepoData) ? parsedRepoData : parsedRepoData.userRepos || [];
        const sortedRepos = allRepos.sort((a, b) => 
          new Date(b.updated_at) - new Date(a.updated_at)
        );
  
        setUserRepos(sortedRepos);
        setFilteredRepos(sortedRepos);
      }
      setIsLoading(false);
    } catch (error) {
      console.error('Error retrieving GitHub data:', error);
      setIsLoading(false);
    }
  }, []);

   // Update filtered repos when sort or language filter changes
   useEffect(() => {
    let result = [...userRepos];
    
    // Filter by language
    if (filterLanguage) {
      result = result.filter(repo => repo.language === filterLanguage);
    }
    
    // Sort 
    result.sort((a, b) => {
      if (sortBy === 'stars') return b.stars - a.stars;
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      // Default: sort by updated
      return new Date(b.updated_at) - new Date(a.updated_at);
    });
    
    setFilteredRepos(result);
    setCurrentPage(1);
  }, [sortBy, filterLanguage, userRepos]);


  // Pagination logic
  const indexOfLastRepo = currentPage * reposPerPage;
  const indexOfFirstRepo = indexOfLastRepo - reposPerPage;
  const currentRepos = filteredRepos.slice(indexOfFirstRepo, indexOfLastRepo);
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Calculate total pages
  const totalPages = Math.ceil(filteredRepos.length / reposPerPage);

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto bg-white shadow-md rounded-lg overflow-hidden">
        <div className="animate-pulse p-6">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="h-20 bg-gray-300 mb-4 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

 
 

  // Get unique languages
  const languages = [...new Set(userRepos.map(repo => repo.language).filter(Boolean))];
  
  // Get color for language
  const getLanguageColor = (language) => {
    const colors = {
      JavaScript: 'bg-yellow-300',
      TypeScript: 'bg-blue-400',
      CSS: 'bg-pink-500',
      default: 'bg-gray-400'
    };
    
    return colors[language] || colors.default;
  };
  
  // Format date to be more readable
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <>
      <div className="bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 py-8 ">
      <div className="mb-4">
          <Link to="/" className="inline-flex items-center text-blue-600 hover:text-blue-800">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Dashboard
          </Link>
        </div>
        {/* User Profile */}
        {userProfile && (
          <div className="mb-8 overflow-hidden rounded-lg bg-white shadow">
            <div className="p-6">
              <div className="flex flex-col sm:flex-row items-center sm:items-start">
                <img
                  src={userProfile.avatar_url}
                  alt={userProfile.login}
                  className="h-24 w-24 rounded-full object-cover border-4 border-white shadow"
                />
                <div className="mt-4 sm:mt-0 sm:ml-6 text-center sm:text-left">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {userProfile.name || userProfile.login}
                  </h2>
                  <p className="text-gray-600">@{userProfile.login}</p>
                  <div className="mt-2 flex flex-wrap justify-center sm:justify-start gap-4">
                    {userProfile.location && (
                      <div className="text-gray-600 flex items-center">
                        <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                        </svg>
                        {userProfile.location}
                      </div>
                    )}
                    <div className="text-gray-600 flex items-center">
                      <UserIcon className="h-4 w-4 mr-1" />
                      {userProfile.followers} followers
                    </div>
                    <div className="text-gray-600 flex items-center">
                      <Code className="h-4 w-4 mr-1" />
                      {userProfile.public_repos} repositories
                    </div>
                  </div>
                  {userProfile.bio && (
                    <p className="mt-3 text-gray-700">{userProfile.bio}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Repositories Section */}
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          {/* Header */}
          <div className="border-b border-gray-200 bg-gray-50 px-6 py-4 flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <Code className="h-5 w-5 mr-2 text-gray-600" />
              Your Repositories ({userRepos.length} total)
            </h3>
          </div>
          
          {/* Sorting and Filtering Options */}
          <div className="px-6 py-4 border-b border-gray-200 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
            <select 
              value={filterLanguage} 
              onChange={(e) => setFilterLanguage(e.target.value)}
              className="rounded-md border border-gray-300 px-3 py-1 text-sm"
            >
              <option value="">All languages</option>
              {languages.map(lang => (
                <option key={lang} value={lang}>{lang}</option>
              ))}
            </select>
            
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
              className="rounded-md border border-gray-300 px-3 py-1 text-sm"
            >
              <option value="updated">Most recently updated</option>
              <option value="stars">Most stars</option>
              <option value="name">Name</option>
            </select>
          </div>
          
          {filteredRepos.length > 0 ? (
            <>
              <div className="divide-y divide-gray-200">
                {currentRepos.map(repo => (
                  <div 
                    key={repo.id} 
                    className="p-4 hover:bg-gray-50 cursor-pointer"
                  >
                    <div className="flex justify-between items-start">
                      <div>
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
                            {repo.forks || 0}
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
                ))}
              </div>

              {/* Pagination */}
              <div className="flex justify-between items-center px-6 py-4 border-t border-gray-200">
                <div className="text-sm text-gray-600">
                  Page {currentPage} of {totalPages}
                </div>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-2 rounded-md bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button 
                    onClick={() => paginate(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-md bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="p-6 text-center text-gray-500 flex flex-col items-center justify-center">
              <AlertCircle className="mb-2 h-10 w-10 text-gray-400" />
              <h3 className="text-lg font-medium text-gray-900">No repositories found</h3>
              <p className="text-gray-500">Check again later or try connecting your GitHub account.</p>
            </div>
          )}
        </div>
      </div>
      </div>
    </>
  );
};

export default RepoListViewer;