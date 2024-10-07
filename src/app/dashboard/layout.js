'use client';

import PropTypes from 'prop-types';
// auth
// components
import DashboardLayout from 'src/layouts/dashboard';
import { SearchFilterProvider } from 'src/context/SearchFilterContext';

// ----------------------------------------------------------------------

export default function Layout({ children }) {
  return (
    // <AuthGuard>
    <SearchFilterProvider>
      <DashboardLayout>{children}</DashboardLayout>
    </SearchFilterProvider>
    // </AuthGuard>
  );
}

Layout.propTypes = {
  children: PropTypes.node,
};
