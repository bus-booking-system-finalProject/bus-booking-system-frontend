import ReactDOM from 'react-dom/client';
import { RouterProvider, createRouter } from '@tanstack/react-router';
// 1. IMPORT MUI
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './theme'; // File theme.ts

import * as TanStackQueryProvider from './integrations/tanstack-query/root-provider.tsx';
import { getContext } from './integrations/tanstack-query/client.ts';
import './styles.css';
import reportWebVitals from './reportWebVitals.ts';
import { routeTree } from './routeTree.tsx';
import { AuthProvider } from './context/AuthContext.tsx';

const TanStackQueryProviderContext = getContext();
const router = createRouter({
  routeTree,
  context: {
    ...TanStackQueryProviderContext,
  },
  defaultPreload: 'intent',
  scrollRestoration: true,
  defaultStructuralSharing: true,
  defaultPreloadStaleTime: 0,
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

const rootElement = document.getElementById('app');
if (rootElement && !rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <>
      {/* add theme provider */}
      <ThemeProvider theme={theme}>
        {/* CssBaseline giúp reset CSS trình duyệt và áp dụng nền mặc định từ theme */}
        <CssBaseline />

        <TanStackQueryProvider.Provider {...TanStackQueryProviderContext}>
          <AuthProvider>
            <RouterProvider router={router} />
          </AuthProvider>
        </TanStackQueryProvider.Provider>
      </ThemeProvider>
    </>,
  );
}

reportWebVitals();
