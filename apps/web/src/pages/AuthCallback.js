import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth, API } from "../App";
import axios from "axios";

const AuthCallback = () => {
  const navigate = useNavigate();
  const { loginWithSession } = useAuth();
  const hasProcessed = useRef(false);

  useEffect(() => {
    // REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
    if (hasProcessed.current) return;
    hasProcessed.current = true;

    const processAuth = async () => {
      try {
        // Extract session_id from URL fragment
        const hash = window.location.hash;
        const params = new URLSearchParams(hash.replace('#', ''));
        const sessionId = params.get('session_id');

        if (!sessionId) {
          console.error("No session_id found");
          navigate('/login');
          return;
        }

        // Exchange session_id for session data
        const response = await axios.get(`${API}/auth/session`, {
          headers: { 'X-Session-ID': sessionId }
        });

        const { session_token, user_id, email, name } = response.data;

        // Login with session
        loginWithSession(session_token, { user_id, email, name });

        // Navigate to dashboard
        navigate('/dashboard', { replace: true });
      } catch (error) {
        console.error("Auth callback error:", error);
        navigate('/login');
      }
    };

    processAuth();
  }, [navigate, loginWithSession]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center animate-pulse-soft">
        <div className="w-16 h-16 rounded-full bg-primary/20 mx-auto mb-4 flex items-center justify-center">
          <div className="w-10 h-10 rounded-full bg-primary/40"></div>
        </div>
        <p className="text-muted-foreground">Memproses login...</p>
      </div>
    </div>
  );
};

export default AuthCallback;
