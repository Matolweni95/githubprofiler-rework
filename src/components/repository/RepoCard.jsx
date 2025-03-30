import React from 'react';

const RepoCard = ({ repo, onClick }) => {
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div 
      className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow duration-200 cursor-pointer bg-white"
      onClick={() => onClick(repo.name)}
    >
      <div className="flex justify-between items-start">
        <h3 className="text-xl font-semibold text-blue-600 truncate">{repo.name}</h3>
        <div className="flex items-center">
          <span className="text-yellow-500 mr-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </span>
          <span className="text-gray-600">{repo.stargazers_count}</span>
        </div>
      </div>
      
      <p className="text-gray-600 mt-2 line-clamp-2 h-10">
        {repo.description || 'No description provided'}
      </p>
      
      <div className="mt-4 flex flex-wrap items-center">
        {repo.language && (
          <span className="flex items-center text-sm text-gray-600 mr-4">
            <span className="w-3 h-3 rounded-full mr-1 bg-blue-500"></span>
            {repo.language}
          </span>
        )}
        <span className="text-sm text-gray-500">
          Updated on {formatDate(repo.updated_at)}
        </span>
      </div>
      
      <div className="mt-3 flex items-center text-sm">
        <span className="flex items-center text-gray-600 mr-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m-8 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
          {repo.forks_count} forks
        </span>
        <span className="flex items-center text-gray-600">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          {repo.watchers_count} watchers
        </span>
      </div>
    </div>
  );
};

export default RepoCard;