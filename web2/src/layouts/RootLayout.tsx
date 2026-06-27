import { Outlet } from 'react-router-dom';

/**
 * Root layout wrapper — provides the app-level container styling.
 * All pages (user, merchant, auth) are rendered inside this layout.
 */
const RootLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-(--app-bg)">
      <Outlet />
    </div>
  );
};

export default RootLayout;
