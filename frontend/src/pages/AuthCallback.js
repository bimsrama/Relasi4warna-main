import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth, API } from "../App";
import axios from "axios";

const AuthCallback = () => {
  const navigate = useNavigate();
  const { loginWithSession } = useAuth();
  const hasProcessed = useRef(false);

  useEffect(() => {
    // Prevent double execution in React Strict Mode
    if (hasProcessed.current) return;
    hasProcessed.current = true;

    const processAuth = async () => {
      try {
        // 1. Ambil Parameter dari URL Hash (#)
        const hash = window.location.hash;
        const params = new URLSearchParams(hash.replace('#', ''));
        
        // Cek dua tipe token:
        // - access_token: Format Baru (Google OAuth dari Server Sendiri)
        // - session_id: Format Lama (Emergent Auth)
        const accessToken = params.get('access_token');
        const sessionId = params.get('session_id');

        // --- SKENARIO 1: Token Langsung (Google Login Baru) ---
        if (accessToken) {
          console.log("Processing Google Access Token...");
          
          // Token sudah valid JWT dari backend, tidak perlu ditukar lagi.
          // Kita pass object kosong {} sebagai user data sementara.
          // AuthProvider di App.js akan otomatis mendeteksi token berubah
          // dan melakukan fetch ke /auth/me untuk mengisi data user lengkap.
          loginWithSession(accessToken, {});
          
          navigate('/dashboard', { replace: true });
          return;
        }

        // --- SKENARIO 2: Session ID (Flow Lama) ---
        if (sessionId) {
          console.log("Processing Session ID...");
          
          // Tukar session_id dengan token asli ke backend
          const response = await axios.get(`${API}/auth/session`, {
            headers: { 'X-Session-ID': sessionId }
          });

          const { session_token, user_id, email, name } = response.data;

          // Login dan simpan
          loginWithSession(session_token, { user_id, email, name });

          navigate('/dashboard', { replace: true });
          return;
        }

        // --- Jika Tidak Ada Token Sama Sekali ---
        console.error("No access_token or session_id found");
        navigate('/login');

      } catch (error) {
        console.error("Auth callback error:", error);
        // Beri sedikit delay sebelum redirect agar user sempat melihat error di console jika perlu
        setTimeout(() => navigate('/login'), 1000);
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
