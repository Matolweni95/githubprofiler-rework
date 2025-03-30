import React from 'react';
import { MapPin, Link2, Building, Users, Star } from 'lucide-react';

const UserProfile = ({ user, isLoading }) => {
  if (isLoading) {
    return (
      <div className="rounded-lg bg-white p-6 shadow-sm">
        <div className="flex animate-pulse flex-col items-center space-y-4">
          <div className="h-24 w-24 rounded-full bg-gray-300"></div>
          <div className="h-4 w-1/2 rounded bg-gray-300"></div>
          <div className="h-3 w-1/3 rounded bg-gray-300"></div>
          <div className="h-24 w-full rounded bg-gray-300"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="rounded-lg bg-white p-6 shadow-sm">
      <div className="flex flex-col md:flex-row">
        <div className="flex flex-col items-center md:items-start">
          <img 
            src={user.avatar_url} 
            alt={`${user.login}'s avatar`} 
            className="h-24 w-24 rounded-full border-2 border-gray-200"
          />
          <h1 className="mt-4 text-xl font-bold">{user.name}</h1>
          <h2 className="text-gray-600">{user.login}</h2>
          
          {user.bio && (
            <p className="mt-4 text-gray-700">{user.bio}</p>
          )}
          
          <div className="mt-4 flex items-center">
            <Users className="mr-2 h-4 w-4 text-gray-500" />
            <span className="mr-4">
              <strong>{user.followers}</strong> followers
            </span>
            <span>
              <strong>{user.following}</strong> following
            </span>
          </div>
        </div>
        
        {/* Additional info */}
        <div className="mt-6 md:mt-0 md:ml-8 md:flex-1">
          <ul className="space-y-2">
            {user.company && (
              <li className="flex items-center text-gray-700">
                <Building className="mr-2 h-4 w-4 text-gray-500" />
                {user.company}
              </li>
            )}
            
            {user.location && (
              <li className="flex items-center text-gray-700">
                <MapPin className="mr-2 h-4 w-4 text-gray-500" />
                {user.location}
              </li>
            )}
            
            {user.blog && (
              <li className="flex items-center text-gray-700">
                <Link2 className="mr-2 h-4 w-4 text-gray-500" />
                <a 
                  href={user.blog.startsWith('http') ? user.blog : `https://${user.blog}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  {user.blog}
                </a>
              </li>
            )}
          </ul>
          
          <div className="mt-6">
            <h3 className="mb-2 font-medium">GitHub Stats</h3>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              <div className="rounded-md bg-gray-50 p-3 text-center">
                <div className="text-lg font-bold">{user.public_repos}</div>
                <div className="text-xs text-gray-500">Repositories</div>
              </div>
              <div className="rounded-md bg-gray-50 p-3 text-center">
                <div className="text-lg font-bold">{user.public_gists || 0}</div>
                <div className="text-xs text-gray-500">Gists</div>
              </div>
              <div className="rounded-md bg-gray-50 p-3 text-center">
                <div className="flex items-center justify-center text-lg font-bold">
                  <Star className="mr-1 h-4 w-4 text-yellow-500" fill="currentColor" />
                  {user.starred_count || "N/A"}
                </div>
                <div className="text-xs text-gray-500">Starred</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;