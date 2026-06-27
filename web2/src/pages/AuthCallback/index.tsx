import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { api } from '../../lib/api';
import { useAuth } from '../../context/useAuth';

export default function AuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { fetchUser, resolveRedirect } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const processed = useRef(false);

  const getErrorMessage = (err: unknown, fallback: string): string => {
    if (axios.isAxiosError(err)) {
      const apiMessage = err.response?.data?.message;
      if (typeof apiMessage === 'string' && apiMessage.trim().length > 0) {
        return apiMessage;
      }
    }

    if (err instanceof Error && err.message.trim().length > 0) {
      return err.message;
    }

    return fallback;
  };

  useEffect(() => {
    if (processed.current) return;
    processed.current = true;

    const processGoogleAuth = async () => {
      try {
        // 1. Get Session from Supabase URL hash fragment
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError || !session) {
          throw new Error('No session fragment found');
        }

        const token = session.access_token;
        const supabaseUser = session.user;
        const intent = searchParams.get('intent') || 'login';

        // Helper function to register user on backend
        const registerOnBackend = async (role: 'user' | 'merchant') => {
          const payload = {
            name: supabaseUser.user_metadata?.full_name || supabaseUser.email?.split('@')[0] || 'Unknown',
            email: supabaseUser.email || '',
            contactNumber: '', // Optional per our backend change
            supabaseUserId: supabaseUser.id,
          };

          try {
            await api.post(`/auth/register/${role}`, payload);
          } catch (registerErr: unknown) {
            // If role already exists due to a race between callback/bootstrap requests,
            // continue with login flow instead of failing the whole auth callback.
            if (axios.isAxiosError(registerErr) && registerErr.response?.status === 409) {
              return;
            }
            throw registerErr;
          }
        };

        try {
          // 2. Try to log them in first (in case they already exist in our DB)
          const loginRes = await api.post('/auth/login', { token });
          
          const userData = loginRes.data;
          let forcedRoute: string | null = null;

          // Cross-Registration: If they signed up via Google specifically to add a missing role
          if (intent === 'register_merchant' && !userData.isMerchant) {
            // Because they just logged in securely, the backend has a cookie, but our token is in memory.
            // Since backend allows cookie authentication, we can just call /auth/add-role.
            await api.post('/auth/add-role', { role: 'merchant' }, {
              headers: { Authorization: `Bearer ${token}` } // ensuring token is sent if cookie isn't there yet
            });
            forcedRoute = '/onboarding/merchant';
          } else if (intent === 'register_user' && !userData.isTraveller) {
            await api.post('/auth/add-role', { role: 'traveller' }, {
              headers: { Authorization: `Bearer ${token}` }
            });
            forcedRoute = '/onboarding/user';
          }

          // Fetch user and determine the correct redirect (e.g. to onboarding page for the new role)
          const { data: updatedData } = await api.get('/auth/me', {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          await fetchUser(); // Updates the global context
          
          const route = forcedRoute ?? resolveRedirect(updatedData ?? loginRes.data);
          navigate(route, { replace: true });
        } catch (err: unknown) {
          // 3. User does not exist in our DB (404) OR backend failed
          if (axios.isAxiosError(err) && err.response?.status === 404) {
            
            // Auto-register based on intent
            if (intent === 'register_merchant') {
              await registerOnBackend('merchant');
            } else {
              // Default to registering as traveller for 'login' or 'register_user' intents
              await registerOnBackend('user');
            }

            // Now log them in again
            const retryLogin = await api.post('/auth/login', { token });
            await fetchUser();
            const route = resolveRedirect(retryLogin.data);
            navigate(route, { replace: true });

          } else {
            throw err; // Some other error
          }
        }

      } catch (err: unknown) {
        console.error(err);
        setError(getErrorMessage(err, 'Authentication failed. Please try again.'));
      }
    };

    processGoogleAuth();
  }, [navigate, searchParams, fetchUser, resolveRedirect]);

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-6">
        <div className="bg-white p-8 rounded-2xl shadow-sm text-center max-w-md w-full">
          <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">Authentication Failed</h2>
          <p className="text-slate-500 text-sm mb-6">{error}</p>
          <button 
            onClick={() => navigate('/login', { replace: true })}
            className="w-full bg-slate-900 text-white py-2.5 rounded-xl font-medium hover:bg-slate-800 transition-colors"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-(--app-bg) flex items-center justify-center px-4">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-[#2dd4af]/15 blur-2xl" />
          <img src="/images/logo.png" alt="LushWare" className="relative z-10 h-24 md:h-28 w-auto object-contain" />
        </div>
        <p className="text-slate-700 font-medium">Completing your sign in..</p>
        <div className="flex items-center justify-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#2dd4af] animate-pulse" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#2dd4af]/70 animate-pulse [animation-delay:150ms]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#2dd4af]/40 animate-pulse [animation-delay:300ms]" />
        </div>
      </div>
    </div>
  );
}
