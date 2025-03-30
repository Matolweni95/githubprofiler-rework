import React from 'react';
import { GithubIcon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext'; 

const GithubLogin = () => {
  const { login } = useAuth();

  const handleLogin = async () => {
    const success = await login();
    if (success) {
      console.log("Login successful");
    } else {
      console.log("Login failed");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-lg">
        <div className="mb-6 text-center">
          <h1 className="mb-2 text-2xl font-bold text-gray-800">GitHub Profiler</h1>
          <p className="text-gray-600">Explore GitHub profiles and repositories with a modern interface</p>
        </div>
        
        <button
          onClick={handleLogin}
          className="flex w-full items-center justify-center rounded-md bg-gray-900 px-4 py-3 text-white transition hover:bg-gray-800"
        >
          <GithubIcon className="mr-2 h-5 w-5" />
          <span>Continue with GitHub</span>
        </button>
        
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>Your data is securely processed using GitHub's official API</p>
        </div>
      </div>
    </div>
  );
};

export default GithubLogin;
