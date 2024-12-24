import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { EventManager } from './components/events/EventManager';
import { PositionsPage } from './pages/PositionsPage';
import { CheckInPage } from './pages/CheckInPage';
import { AuthForm } from './components/auth/AuthForm';
import { useAuthStore } from './store/authStore';
import { supabase } from './lib/supabase';

// Protected route wrapper component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuthStore();
  
  if (!user) {
    return <AuthForm />;
  }
  
  return <>{children}</>;
}

function App() {
  const { user, setUser } = useAuthStore();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [setUser]);

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <Routes>
          <Route path="/" element={
            <ProtectedRoute>
              <>
                <Hero />
                <EventManager />
              </>
            </ProtectedRoute>
          } />
          <Route path="/events/:eventId/positions" element={
            <ProtectedRoute>
              <PositionsPage />
            </ProtectedRoute>
          } />
          {/* Check-in page is not protected */}
          <Route path="/checkin/:positionId" element={<CheckInPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;