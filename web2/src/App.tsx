import { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';

// ─── Layouts (keep static for faster initial render of frame) ───
import RootLayout from './layouts/RootLayout';
import UserLayout from './layouts/UserLayout';
import BareLayout from './layouts/BareLayout';

// ─── Context ───
import { LockedDealProvider } from './context/locked-deal.context';
import { ChatProvider } from './features/Chat/ChatContext';
import ScrollToTop from './components/ScrollToTop';

// ─── Page Components (Lazy Loaded) ───
const HomePage = lazy(() => import('./pages/User/Home/HomePage'));
const ExplorePage = lazy(() => import('./pages/User/Explore/ExplorePage'));
const MyDealsPage = lazy(() => import('./pages/User/MyDeals/MyDeals'));
const LockedDealDetailPage = lazy(() => import('./pages/User/MyDeals/LockedDealDetailPage'));
const LockedAccommodationDetailPage = lazy(() => import('./pages/User/MyDeals/LockedAccommodationDetailPage'));
const BookingsPage = lazy(() => import('./pages/User/Bookings/BookingsPage'));
const DealDetailPage = lazy(() => import('./pages/User/DealDetails/DealDetailPage'));
const PropertyDetailsPage = lazy(() => import('./pages/User/PropertyDetails/PropertyDetailsPage'));
const ProfilePage = lazy(() => import('./pages/User/Profile/Profile'));
const IslandsPage = lazy(() => import('./pages/User/Islands/IslandsPage'));
const IslandDetailsPage = lazy(() => import('./pages/User/Islands/IslandDetailsPage'));
const TermsPage = lazy(() => import('./pages/User/Terms/TermsPage'));
const LoginPage = lazy(() => import('./pages/User/Login/LoginPage'));
const RegisterPage = lazy(() => import('./pages/User/Register/RegisterPage'));
const MerchantRegisterPage = lazy(() => import('./pages/Merchant/Register'));
const AuthCallback = lazy(() => import('./pages/AuthCallback'));
const UserOnboardingPage = lazy(() => import('./pages/User/Onboarding/UserOnboardingPage'));
const MerchantOnboardingPage = lazy(() => import('./pages/Merchant/Onboarding'));
const DealLockedSuccessPage = lazy(() => import('./pages/User/DealLockedSuccess/DealLockedSuccessPage'));
const ConfirmBookingPage = lazy(() => import('./pages/User/ConfirmBooking/ConfirmBookingPage'));
const BookingAddOnsPage = lazy(() => import('./pages/User/BookingAddOns/BookingAddOnsPage'));
const MerchantDashboardWrapper = lazy(() => import('./pages/Merchant/MerchantDashboardWrapper'));
const CommunityFeedPage = lazy(() => import('./pages/User/Community').then(m => ({ default: m.CommunityFeedPage })));

const MessagesPage = lazy(() => import('./pages/User/Chat/MessagesPage').then(m => ({ default: m.MessagesPage })));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage/NotFoundPage'));

// ─── Local Guide Components ───
const LocalGuidePage = lazy(() => import('./pages/User/Islands/LocalGuidePage'));
const BuildedGuidePage = lazy(() => import('./pages/User/Islands/BuildedGuidePage'));
const AllIslandsPage = lazy(() => import('./pages/User/Islands/AllIslandsPage'));
const LocalIslandDetailsPage = lazy(() => import('./pages/User/Islands/LocalIslandDetailsPage'));
const ComparisonPage = lazy(() => import('./pages/User/Islands/ComparisonPage'));

// ─── Admin Components ───
const AdminLayout = lazy(() => import('./features/Admin/components/AdminLayout'));
const AdminDashboardPage = lazy(() => import('./pages/Admin/AdminDashboardPage'));
const AdminMerchantsPage = lazy(() => import('./pages/Admin/AdminMerchantsPage'));
const AdminMerchantDetailsPage = lazy(() => import('./pages/Admin/AdminMerchantDetailsPage'));
const AdminUsersPage = lazy(() => import('./pages/Admin/AdminUsersPage'));
const AdminUserDetailsPage = lazy(() => import('./pages/Admin/AdminUserDetailsPage'));
const AdminDealRequestsPage = lazy(() => import('./pages/Admin/AdminDealRequestsPage'));
const AdminModerationPage = lazy(() => import('./pages/Admin/AdminModerationPage'));
const AdminDealsPage = lazy(() => import('./pages/Admin/AdminDealsPage'));
const AdminDealDetailPage = lazy(() => import('./pages/Admin/AdminDealDetailPage'));
const AdminDealReviewsPage = lazy(() => import('./pages/Admin/AdminDealReviewsPage'));
const AdminMessagesPage = lazy(() => import('./pages/Admin/AdminMessagesPage'));

// ─── Admin Islands Components ───
const AdminIslandsList = lazy(() => import('./pages/Admin/Islands/AdminIslandsList'));
const AdminCreateIsland = lazy(() => import('./pages/Admin/Islands/AdminCreateIsland'));

import './App.css';
import {
  AdminRouteGuard,
  MerchantRouteGuard,
  NonAdminAuthSetupGuard,
  NonAdminRouteGuard,
  UserRouteGuard,
  RouteLoadingScreen,
} from './routes/RoleGuards';

function App() {
  return (
    <LockedDealProvider>
      <ChatProvider>
        <ScrollToTop />
        <Suspense fallback={<RouteLoadingScreen />}>
          <Routes>
            <Route element={<RootLayout />}>

              <Route element={<NonAdminRouteGuard />}>
                {/* ─── User Layout: Pages WITH Navbar + Footer ─── */}
                <Route element={<UserRouteGuard />}>
                  <Route element={<UserLayout />}>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/explore" element={<ExplorePage />} />
                    <Route path="/islands" element={<IslandsPage />} />
                    <Route path="/islands/:islandName" element={<IslandDetailsPage />} />
                    <Route path="/community" element={<CommunityFeedPage />} />
                    <Route path="/my-deals" element={<MyDealsPage />} />
                    <Route path="/my-deals/:id/details" element={<LockedDealDetailPage />} />
                    <Route path="/my-deals/accommodation/:id/details" element={<LockedAccommodationDetailPage />} />
                    <Route path="/bookings" element={<BookingsPage />} />
                    <Route path="/deals/:id" element={<DealDetailPage />} />
                    <Route path="/accommodations/:id" element={<PropertyDetailsPage />} />
                    <Route path="/messages" element={<MessagesPage />} />
                    <Route path="/messages/:chatId" element={<MessagesPage />} />
                    <Route path="/profile" element={<ProfilePage />} />
                    <Route path="/terms" element={<TermsPage />} />

                    {/* ─── Local Guide (LushWare) ─── */}
                    <Route path="/local-guide" element={<LocalGuidePage />} />
                    <Route path="/local-guide/results" element={<BuildedGuidePage />} />
                    <Route path="/local-guide/islands" element={<AllIslandsPage />} />
                    <Route path="/local-guide/island/:id" element={<LocalIslandDetailsPage />} />
                    <Route path="/local-guide/compare" element={<ComparisonPage />} />
                  </Route>
                </Route>

                {/* ─── Auth Pages: Login & Registration ─── */}
                <Route element={<BareLayout />}>
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/auth/callback" element={<AuthCallback />} />
                </Route>

                {/* ─── Register + Onboarding (non-admin only) ─── */}
                <Route element={<NonAdminAuthSetupGuard />}>
                  <Route element={<BareLayout />}>
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/register/merchant" element={<MerchantRegisterPage />} />
                    <Route path="/onboarding/user" element={<UserOnboardingPage />} />
                    <Route path="/onboarding/merchant" element={<MerchantOnboardingPage />} />
                  </Route>
                </Route>

                {/* ─── Bare Pages: Booking flows ─── */}
                <Route element={<BareLayout />}>
                  <Route path="/deal-locked-success" element={<DealLockedSuccessPage />} />
                  <Route path="/booking-add-ons" element={<BookingAddOnsPage />} />
                  <Route path="/confirm-booking" element={<ConfirmBookingPage />} />
                </Route>

                {/* ─── Merchant Layout: Dashboard with sidebar ─── */}
                <Route element={<MerchantRouteGuard />}>
                  <Route element={<BareLayout />}>
                    <Route path="/merchant-dashboard" element={<MerchantDashboardWrapper />} />
                    <Route path="/merchant-dashboard/:page" element={<MerchantDashboardWrapper />} />
                    <Route path="/merchant-dashboard/deals/create" element={<MerchantDashboardWrapper />} />
                    <Route path="/merchant-dashboard/deals/:id/manage/:tab?" element={<MerchantDashboardWrapper />} />
                    <Route path="/merchant-dashboard/deals/:id/edit" element={<MerchantDashboardWrapper />} />
                    <Route path="/merchant-dashboard/accommodation" element={<MerchantDashboardWrapper />} />
                    <Route path="/merchant-dashboard/accommodation/create" element={<MerchantDashboardWrapper />} />
                    <Route path="/merchant-dashboard/accommodation/create-apartment" element={<MerchantDashboardWrapper />} />
                    <Route path="/merchant-dashboard/accommodation/:id/manage/:tab?" element={<MerchantDashboardWrapper />} />
                  </Route>
                </Route>
              </Route>

              {/* ─── Admin Layout: System owner panel ─── */}
              <Route element={<AdminRouteGuard />}>
                <Route element={<AdminLayout />}>
                  <Route path="/admin" element={<AdminDashboardPage />} />
                  <Route path="/admin/merchants" element={<AdminMerchantsPage />} />
                  <Route path="/admin/merchants/:id" element={<AdminMerchantDetailsPage />} />
                  <Route path="/admin/merchants/:id/deals" element={<AdminDealsPage />} />
                  <Route path="/admin/deals/:dealId" element={<AdminDealDetailPage />} />
                  <Route path="/admin/users" element={<AdminUsersPage />} />
                  <Route path="/admin/users/:id" element={<AdminUserDetailsPage />} />
                  <Route path="/admin/deal-requests" element={<AdminDealRequestsPage />} />
                  <Route path="/admin/moderation" element={<AdminModerationPage />} />
                  <Route path="/admin/messages" element={<AdminMessagesPage />} />
                  <Route path="/admin/messages/:chatId" element={<AdminMessagesPage />} />
                  <Route path="/admin/merchants/:merchantId/deals/:dealId/reviews" element={<AdminDealReviewsPage />} />

                  {/* ─── Admin Islands ─── */}
                  <Route path="/admin/islands" element={<AdminIslandsList />} />
                  <Route path="/admin/islands/create" element={<AdminCreateIsland />} />
                  <Route path="/admin/islands/:id/edit" element={<AdminCreateIsland />} />
                </Route>
              </Route>

              {/* ─── 404 Route ─── */}
              <Route path="*" element={<NotFoundPage />} />

            </Route>
          </Routes>
        </Suspense>
      </ChatProvider>
    </LockedDealProvider>
  );
}

export default App;
