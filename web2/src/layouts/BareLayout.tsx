import { Outlet } from 'react-router-dom';

/**
 * Bare layout with NO Navbar or Footer.
 * Used for: Login, Register, Deal Locked Success, Confirm Booking, Merchant Dashboard
 */
const BareLayout: React.FC = () => {
  return <Outlet />;
};

export default BareLayout;
