import { useState } from 'react';
import SplashPage from '../components/Pages/Splash';
import SignInPage from '../components/Pages/SignIn';
import Dashboard from '../components/Pages/Dashboard';

enum Pages {
  Splash,
  SignIn,
  Dashboard,
}

function App() {
  const [page, setPage] = useState(Pages.Dashboard);
  const [token, setToken] = useState('');
  if (page === Pages.Splash) {
    return <SplashPage onClick={() => setPage(Pages.SignIn)} />;
  }

  if (page === Pages.SignIn) {
    return (
      <SignInPage
        onSignIn={({ token }) => {
          setToken(token);
          setPage(Pages.Dashboard);
        }}
      />
    );
  }

  if (page === Pages.Dashboard) {
    return <Dashboard />;
  }

  return null;
}

export default App;
