import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import GithubLogin from '../components/auth/GithubLogin';

const LoginPage = () => {
  const { user, login, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [hasProcessedCode, setHasProcessedCode] = useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const code = urlParams.get('code');
    
    if (code && !hasProcessedCode && !loading) {
      setHasProcessedCode(true); 
      login(code);
    }
  }, [location.search, hasProcessedCode, loading, login]);

  useEffect(() => {
    if (!loading && user) {
      const redirectTimer = setTimeout(() => {
        navigate('/');
      }, 100);
      
      return () => clearTimeout(redirectTimer);
    }
  }, [user, loading, navigate]);

  if (loading || (hasProcessedCode && !user)) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
          <p className="mt-2 text-gray-600">Logging you in...</p>
        </div>
      </div>
    );
  }

  return <GithubLogin />;
};

export default LoginPage;