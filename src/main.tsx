import ReactDOM from 'react-dom/client';
import { RouterProvider, createRouter } from '@tanstack/react-router';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './theme';

import * as TanStackQueryProvider from './integrations/tanstack-query/root-provider.tsx';
import { getContext } from './integrations/tanstack-query/client.ts';
import './styles.css';
import reportWebVitals from './reportWebVitals.ts';
import { routeTree } from './routeTree.tsx';
import { AuthProvider } from './context/AuthContext.tsx';
import { useAuth } from './hooks/useAuth'; // Import useAuth hook
import { ToastProvider } from './context/ToastContext.tsx';

const TanStackQueryProviderContext = getContext();

// 1. Create Router (Context will be filled at runtime)
const router = createRouter({
  routeTree,
  context: {
    ...TanStackQueryProviderContext,
    auth: undefined!, // Initial undefined, will be injected in App
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

// 2. Create an Inner App Component to Bridge Auth -> Router
export function InnerApp() {
  const auth = useAuth(); // Get current auth state

  return (
    <RouterProvider
      router={router}
      // 3. Inject dynamic Auth context here
      context={{
        auth: {
          isLoggedIn: auth.isLoggedIn,
          user: auth.user,
          isLoadingUser: auth.isLoadingUser,
        },
      }}
      basepath="/bus-booking-system-frontend/"
    />
  );
}

const rootElement = document.getElementById('app');
if (rootElement && !rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <TanStackQueryProvider.Provider {...TanStackQueryProviderContext}>
          <AuthProvider>
            <ToastProvider>
              <InnerApp />
            </ToastProvider>
          </AuthProvider>
        </TanStackQueryProvider.Provider>
      </ThemeProvider>
    </>,
  );
}

reportWebVitals();
