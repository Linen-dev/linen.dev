import Toast from '@linen/ui/Toast';
import { SessionProvider } from '@linen/auth/client';
import { baseAuth } from './config';
import { UsersContext } from '@linen/contexts/Users';
import Router from './Router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

function App() {
  return (
    <>
      <QueryClientProvider client={queryClient}>
        <SessionProvider basePath={baseAuth}>
          <UsersContext>
            <Toast.ToastContext
              containerStyle={{ bottom: '2rem', left: '2rem' }}
              position="bottom-left"
            />
            <Router />
          </UsersContext>
        </SessionProvider>
      </QueryClientProvider>
    </>
  );
}

export default App;
