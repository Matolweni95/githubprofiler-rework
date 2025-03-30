import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { 
  Star, 
  GitFork, 
  Clock, 
  Eye, 
  Code, 
  FileText, 
  BookOpen, 
  GitBranch, 
  GitPullRequest, 
  AlertCircle, 
  Tag, 
  Users, 
  Activity,
  ArrowLeft,
  RefreshCw
} from "lucide-react";
import Navbar from "../dashboard/Navbar";
import useGithubApi from "../../hooks/useGithubApi";

const RepoDetailPage = () => {
  const { owner, name } = useParams();
  const [repo, setRepo] = useState(null);
  const [commits, setCommits] = useState([]);
  const [branches, setBranches] = useState([]);
  const [contributors, setContributors] = useState([]);
  const [readme, setReadme] = useState("");
  const [loading, setLoading] = useState(true);
  const [Languages, setLanguage] = useState([]);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");

  const { 
    fetchRepoDetails, 
    fetchRepoCommits,
    fetchRepoBranches,
    fetchRepoContributors,
    fetchRepoReadme,
    fetchRepoLanguage,
    loading: apiLoading, 
    error: apiError 
  } = useGithubApi();

  // Create a unique cache key for this specific repository
  const getCacheKey = () => `repo-detail-${owner}-${name}`;

  const getRepoDetails = async (forceRefresh = false) => {
    try {
      setLoading(true);
      setError(null);

      // Check local storage first
      const cacheKey = getCacheKey();
      const cachedData = localStorage.getItem(cacheKey);

      if (!forceRefresh && cachedData) {
        const parsedData = JSON.parse(cachedData);
        setRepo(parsedData.repo);
        setCommits(parsedData.commits);
        setBranches(parsedData.branches);
        setContributors(parsedData.contributors);
        setReadme(parsedData.readme);
        setLanguage(parsedData.languages);
        setLoading(false);
        return;
      }

      // Fetch repo details
      const repoData = await fetchRepoDetails(owner, name);
      const commit = await fetchRepoCommits(owner, name);
      const branch = await fetchRepoBranches(owner, name);
      const contribute = await fetchRepoContributors(owner, name);
      const readmeContent = await fetchRepoReadme(owner, name);
      const languages = await fetchRepoLanguage(owner, name);

      setRepo(repoData);
      setCommits(commit);
      setBranches(branch);
      setContributors(contribute);
      setReadme(readmeContent);
      setLanguage(languages);

      // Cache the data
      localStorage.setItem(cacheKey, JSON.stringify({
        repo: repoData,
        commits: commit,
        branches: branch,
        contributors: contribute,
        readme: readmeContent,
        languages: languages
      }));

    } catch (err) {
      console.error("Error fetching repo details:", err);
      setError(err.message || "Failed to fetch repository details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getRepoDetails();
  }, [owner, name]);

  const handleManualRefresh = () => {
    getRepoDetails(true); 
  };

  // Format date to relative time
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


  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error && !repo) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-6">
          <div className="bg-red-50 p-4 rounded-md text-red-800 text-center">
            Error: {error}
            <div className="mt-4">
              <button 
                onClick={handleManualRefresh}
                className="flex items-center mx-auto bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Retry Fetching
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="container mx-auto px-4 py-6">
        {/* Refresh button */}
      <div className="mb-4 flex justify-end">
          <button 
            onClick={handleManualRefresh}
            className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh Repository
          </button>
        </div>
        {/* Back button */}
        <div className="mb-4">
          <Link to="/" className="inline-flex items-center text-blue-600 hover:text-blue-800">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Dashboard
          </Link>
        </div>
        
        {/* Repository Header */}
        <div className="mb-6 overflow-hidden rounded-lg bg-white shadow">
          <div className="p-6">
            <div className="flex items-center">
              <img 
                src={repo?.owner?.avatar_url || "https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png"} 
                alt={repo?.owner?.login || "Owner"} 
                className="h-10 w-10 rounded-full mr-4"
              />
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex flex-wrap items-center">
                  <span className="text-gray-600">{repo?.owner?.login || owner}</span>
                  <span className="mx-2">/</span>
                  <span>{repo?.name || name}</span>
                </h1>
                <p className="text-gray-600 mt-1">{repo?.description || "No description available"}</p>
              </div>
            </div>
            
            <div className="mt-4 flex flex-wrap gap-2">
              {repo?.topics?.map(topic => (
                <span key={topic} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                  {topic}
                </span>
              ))}
            </div>
            
            <div className="mt-4 flex flex-wrap gap-6">
              <div className="flex items-center text-gray-700">
                <Star className="h-4 w-4 mr-1 text-gray-500" />
                <span>{repo?.stargazers_count} stars</span>
              </div>
              <div className="flex items-center text-gray-700">
                <GitFork className="h-4 w-4 mr-1 text-gray-500" />
                <span>{repo?.forks_count} forks</span>
              </div>
              <div className="flex items-center text-gray-700">
                <Eye className="h-4 w-4 mr-1 text-gray-500" />
                <span>{repo?.watchers_count} watching</span>
              </div>
              <div className="flex items-center text-gray-700">
                <AlertCircle className="h-4 w-4 mr-1 text-gray-500" />
                <span>{repo?.open_issues_count} issues</span>
              </div>
              {repo?.license && (
                <div className="flex items-center text-gray-700">
                  <FileText className="h-4 w-4 mr-1 text-gray-500" />
                  <span>{repo.license.name}</span>
                </div>
              )}
              {repo?.language && (
                <div className="flex items-center text-gray-700">
                  <span className={`inline-block h-3 w-3 rounded-full mr-1 ${getLanguageColor(repo.language)}`}></span>
                  <span>{repo.language}</span>
                </div>
              )}
            </div>
            
            <div className="mt-4 flex justify-between items-center">
              <div className="text-sm text-gray-600">
                Created: {repo?.created_at} | 
                Updated: {repo?.updated_at}
              </div>
              <div>
                <a 
                  href={repo?.html_url || `https://github.com/${owner}/${name}`} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="bg-blue-600 text-white px-4 py-1 rounded-md hover:bg-blue-700 inline-flex items-center"
                >
                  <Code className="h-4 w-4 mr-1" />
                  View on GitHub
                </a>
              </div>
            </div>
          </div>
        </div>
        
        {/* Repository Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="-mb-px flex">
          <button
              onClick={() => setActiveTab("overview")}
              className={`py-2 w-full md:w-[unset] mx-auto md:mx-[unset] md:px-4 border-b-2 font-medium text-sm ${
                activeTab === "overview"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <div className="flex items-center">
                <BookOpen className="h-4 w-4 mr-1" />
                README
              </div>
            </button>
            <button
              onClick={() => setActiveTab("commits")}
              className={`py-2 mx-auto w-full md:w-[unset] md:mx-[unset] md:px-4 border-b-2 font-medium text-sm ${
                activeTab === "commits"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <div className="flex items-center">
                <GitBranch className="h-4 w-4 mr-1" />
                Commits
              </div>
            </button>
            <button
              onClick={() => setActiveTab("contributors")}
              className={`py-2 mx-auto w-full md:w-[unset] md:mx-[unset] md:px-4 border-b-2 font-medium text-sm ${
                activeTab === "contributors"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <div className="flex items-center">
                <Users className="h-4 w-4 mr-1" />
                Contributors
              </div>
            </button>
          </nav>
        </div>
        
        {/* Tab Content */}
        <div className="grid gap-6 grid-cols-1 lg:grid-cols-4">
          <div className={`lg:col-span-3 overflow-hidden rounded-lg bg-white shadow ${activeTab === "overview" ? "" : "hidden"}`}>
            <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <BookOpen className="h-5 w-5 mr-2 text-gray-600" />
                README
              </h3>
            </div>
            <div className="p-6">
            {readme ? (
              <div
                  className="prose max-w-none"
                  dangerouslySetInnerHTML={{
                    __html: readme, 
                }}
                />
              ) : (
                <div className="text-center text-gray-500 py-8">
                  No README file found for this repository.
                </div>
            )}
            </div>
          </div>
          
          {/* Code Browser Tab */}
          <div className={`lg:col-span-3 overflow-hidden rounded-lg bg-white shadow ${activeTab === "code" ? "" : "hidden"}`}>
            <div className="border-b border-gray-200 bg-gray-50 px-6 py-4 flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <Code className="h-5 w-5 mr-2 text-gray-600" />
                Code Browser
              </h3>
              <div className="flex items-center">
                <select className="rounded-md border border-gray-300 py-1 pl-2 pr-8 text-sm text-gray-700 focus:border-blue-500 focus:outline-none">
                  <option value={repo?.default_branch || "main"}>
                    {repo?.default_branch || "main"}
                  </option>
                  {branches.map(branch => (
                    branch.name !== (repo?.default_branch || "main") && (
                      <option key={branch.name} value={branch.name}>
                        {branch.name}
                      </option>
                    )
                  ))}
                </select>
              </div>
            </div>
            <div className="p-0">
              <div className="border-b border-gray-200">
                <div className="bg-gray-50 p-4 text-sm">
                  <div className="flex items-center justify-between">
                    <div className="text-blue-600 flex items-center">
                      <FileText className="h-4 w-4 mr-1" />
                      Files in {repo?.default_branch || "main"}
                    </div>
                    <div className="text-gray-600">Last commit on {formatDate(repo?.updated_at || "2025-01-01")}</div>
                  </div>
                </div>
              </div>
              
              <div className="divide-y divide-gray-200">
                {/* dummy data*/}
                {[
                  { name: "src", type: "directory", path: "src" },
                  { name: "public", type: "directory", path: "public" },
                  { name: "package.json", type: "file", path: "package.json" },
                  { name: "README.md", type: "file", path: "README.md" },
                  { name: ".gitignore", type: "file", path: ".gitignore" },
                ].map((item, index) => (
                  <div key={index} className="hover:bg-gray-50">
                    <div className="p-4 flex items-center">
                      {item.type === "directory" ? (
                        <svg className="h-5 w-5 mr-2 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4l2 2h4a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <FileText className="h-5 w-5 mr-2 text-gray-600" />
                      )}
                      <span className={item.type === "directory" ? "text-blue-600" : "text-gray-700"}>
                        {item.name}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Commits Tab */}
          <div className={`lg:col-span-3 overflow-hidden rounded-lg bg-white shadow ${activeTab === "commits" ? "" : "hidden"}`}>
            <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <GitBranch className="h-5 w-5 mr-2 text-gray-600" />
                Recent Commits
              </h3>
            </div>
            <div className="divide-y divide-gray-200">
              {commits.length > 0 ? (
                commits.map((commit, index) => (
                  <div key={index} className="p-4 hover:bg-gray-50">
                    <div className="flex items-start">
                      <img 
                        src={commit.author?.avatar_url || "https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png"} 
                        alt={commit.author?.login || "Author"} 
                        className="h-8 w-8 rounded-full mr-3"
                      />
                      <div className="flex-1">
                        <div className="font-medium">{commit.commit.message}</div>
                        <div className="flex items-center mt-1 text-sm text-gray-600">
                          <span className="font-medium">{commit.author?.login || "Unknown author"}</span>
                          <span className="mx-1">·</span>
                          <span>{formatDate(commit.date || commit.commit?.author?.date)}</span>
                        </div>
                      </div>
                      <div>
                        <a 
                          href={commit.html_url} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-700 hover:bg-gray-200"
                        >
                          {commit.sha?.substring(0, 7) || "abcdef1"}
                        </a>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-gray-500">
                  No commits found for this repository.
                </div>
              )}
            </div>
          </div>
          
          {/* Contributors Tab */}
          <div className={`lg:col-span-3 overflow-hidden rounded-lg bg-white shadow ${activeTab === "contributors" ? "" : "hidden"}`}>
            <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <Users className="h-5 w-5 mr-2 text-gray-600" />
                Contributors
              </h3>
            </div>
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {contributors.length > 0 ? (
                contributors.map((contributor, index) => (
                  <div key={index} className="flex flex-col items-center p-4 border rounded-lg hover:shadow-md transition-shadow">
                    <img 
                      src={contributor.avatar_url} 
                      alt={contributor.login} 
                      className="h-16 w-16 rounded-full mb-2"
                    />
                    <div className="font-medium text-blue-600">{contributor.login}</div>
                    <div className="text-gray-600 text-sm">{contributor.contributions} commits</div>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center text-gray-500 py-8">
                  No contributor data available for this repository.
                </div>
              )}
            </div>
          </div>
          
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <div className="overflow-hidden rounded-lg bg-white shadow">
              <div className="border-b border-gray-200 bg-gray-50 px-4 py-3">
                <h3 className="text-base font-medium text-gray-900">About</h3>
              </div>
              <div className="p-4 text-sm">
                <div className="space-y-3">
                  <div>
                    <div className="font-medium text-gray-700">Default Branch</div>
                    <div className="mt-1 flex items-center">
                      <GitBranch className="h-4 w-4 mr-1 text-gray-600" />
                      {repo?.default_branch || "main"}
                    </div>
                  </div>
                  <div>
                    <div className="font-medium text-gray-700">Branches</div>
                    <div className="mt-1 flex items-center">
                      <GitBranch className="h-4 w-4 mr-1 text-gray-600" />
                      {branches.length} branches
                    </div>
                  </div>
                  {repo?.license && (
                    <div>
                      <div className="font-medium text-gray-700">License</div>
                      <div className="mt-1 flex items-center">
                        <FileText className="h-4 w-4 mr-1 text-gray-600" />
                        {repo.license.name}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Languages Section */}
            <div className="overflow-hidden rounded-lg bg-white shadow">
              <div className="border-b border-gray-200 bg-gray-50 px-4 py-3">
                <h3 className="text-base font-medium text-gray-900">Languages</h3>
              </div>
              <div className="p-4">
                {/* language bar */}
                <div className="h-3 rounded-full overflow-hidden bg-gray-200 relative">
                  {Languages && Languages.length > 0 && (
                    Languages.map((lang, index) => {
                      const previousTotal = Languages
                        .slice(0, index)
                        .reduce((sum, l) => sum + parseFloat(l.percentage), 0);
                      
                      return (
                        <div 
                          key={lang.name}
                          className={`h-full absolute ${getLanguageColor(lang.name)}`} 
                          style={{ 
                            width: `${lang.percentage}%`, 
                            left: `${previousTotal}%`
                          }}
                        ></div>
                      );
                    })
                  )}
                </div>
                
                {/* Language breakdown list */}
                <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                  {Languages && Languages.length > 0 ? (
                    Languages.map((lang, index) => (
                      <React.Fragment key={lang.name}>
                        <div className="flex items-center">
                          <span 
                            className={`h-3 w-3 rounded-full mr-1 ${getLanguageColor(lang.name)}`}
                          ></span>
                          <span>{lang.name}</span>
                        </div>
                        <div className="text-right text-gray-600">{lang.percentage}%</div>
                      </React.Fragment>
                    ))
                  ) : (
                    <div className="col-span-2 text-center text-gray-500">No language data available</div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Releases Section */}
            <div className="overflow-hidden rounded-lg bg-white shadow">
              <div className="border-b border-gray-200 bg-gray-50 px-4 py-3">
                <h3 className="text-base font-medium text-gray-900">Releases</h3>
              </div>
              <div className="p-4 text-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Tag className="h-4 w-4 mr-1 text-gray-600" />
                    <span className="font-medium">v1.0.0</span>
                  </div>
                  <span className="text-gray-600">2 weeks ago</span>
                </div>
                <div className="mt-1 text-gray-600">Latest release</div>
                
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <button className="text-blue-600 hover:text-blue-800 flex items-center">
                    <Tag className="h-4 w-4 mr-1" />
                    View all releases
                  </button>
                </div>
              </div>
            </div>
            
            {/* Activity Section */}
            <div className="overflow-hidden rounded-lg bg-white shadow">
              <div className="border-b border-gray-200 bg-gray-50 px-4 py-3">
                <h3 className="text-base font-medium text-gray-900">Activity</h3>
              </div>
              <div className="p-4 text-sm">
                <div className="space-y-3">
                  <div className="flex items-center">
                    <Activity className="h-4 w-4 mr-1 text-gray-600" />
                    <span>{commits.length} commits in the last month</span>
                  </div>
                  <div className="flex items-center">
                    <GitPullRequest className="h-4 w-4 mr-1 text-gray-600" />
                    <span>5 pull requests</span>
                  </div>
                  <div className="flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1 text-gray-600" />
                    <span>{repo?.open_issues_count || 0} open issues</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default RepoDetailPage;