import React from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import MerchantDashboard from './index';

/**
 * Wrapper for merchant dashboard routes.
 * Reads the sub-page from the URL params and passes it to the dashboard.
 */
const MerchantDashboardWrapper: React.FC = () => {
  const { page, id, tab } = useParams<{ page?: string; id?: string; tab?: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  // Logic to determine active view based on path
  let activePage = page || 'dashboard';
  const path = location.pathname;

  if (path.includes('/messages')) {
    activePage = 'messages';
  } else if (path.includes('/accommodation/create-apartment')) {
    activePage = 'accommodation-create-apartment';
  } else if (path.includes('/accommodation/create')) {
    activePage = 'accommodation-create';
  } else if (path.includes('/deals/create')) {
    activePage = 'deals-create';
  } else if (path.includes('/deals')) {
    if (path.includes('/manage')) {
      activePage = 'deals-manage';
    } else if (path.includes('/edit')) {
      activePage = 'deals-edit';
    } else {
      activePage = 'deals';
    }
  } else if (path.includes('/accommodation')) {
    if (path.includes('/manage')) {
      activePage = 'accommodation-manage';
    } else {
      activePage = 'accommodation';
    }
  }

  return (
    <MerchantDashboard
      activePage={activePage}
      selectedId={id}
      tab={tab}
      onNavigate={(p) => navigate(p === 'dashboard' ? '/merchant-dashboard' : `/merchant-dashboard/${p}`)}
      onSwitchMode={() => navigate('/')}
    />
  );
};

export default MerchantDashboardWrapper;
