import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import FloatingActionButton from '../components/FloatingActionButton';
import { DealRequestModal } from '../features/DealRequests';

/**
 * Layout for user-facing pages that include Navbar and Footer.
 * Used for: Home, Community, My Deals, Bookings, Package Detail, Booking Detail
 */
const UserLayout: React.FC = () => {
  const [isDealRequestOpen, setIsDealRequestOpen] = useState(false);
  const [requestToast, setRequestToast] = useState<string | null>(null);

  const location = useLocation();
  const isMessagesRoute = location.pathname.startsWith('/messages');

  useEffect(() => {
    if (!requestToast) return;
    const timeout = window.setTimeout(() => setRequestToast(null), 3200);
    return () => window.clearTimeout(timeout);
  }, [requestToast]);

  return (
    <>
      {requestToast && (
        <div className="fixed top-5 left-1/2 z-70 -translate-x-1/2 px-4">
          <div className="rounded-xl border border-[#2dd4af]/40 bg-white px-4 py-3 text-sm font-semibold text-[#0e2a47] shadow-xl shadow-[#2dd4af]/15">
            {requestToast}
          </div>
        </div>
      )}
      <Navbar />
      <main className={`flex-1 relative z-10 ${isMessagesRoute ? 'h-[100dvh] overflow-hidden flex flex-col' : ''}`}>
        <Outlet />
      </main>
      {!isMessagesRoute && <Footer />}
      {!isMessagesRoute && <FloatingActionButton mode="modal" onClick={() => setIsDealRequestOpen(true)} />}
      <DealRequestModal
        isOpen={isDealRequestOpen}
        onClose={() => setIsDealRequestOpen(false)}
        onRequestSuccess={(message) => setRequestToast(message)}
      />
    </>
  );
};

export default UserLayout;
