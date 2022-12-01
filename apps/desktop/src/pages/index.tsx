import { useState } from 'react';
import SplashPage from '../components/Pages/Splash';
import SignInPage from '../components/Pages/SignIn';
import Dashboard from '../components/Pages/Dashboard';
import { get } from '../utilities/http';
import { Scope, ThreadState } from '@linen/types';

enum Pages {
  Splash,
  SignIn,
  Dashboard,
}

function App() {
  const [page, setPage] = useState(Pages.Splash);
  const [token, setToken] = useState('');
  const [refreshToken, setRefreshToken] = useState('');

  const fetchFeed = () => {
    return get(
      `/api/v2/feed?communityName=linen&scope=${Scope.All}&state=${ThreadState.OPEN}&page=1`,
      token
    ).then((response) => response.data);
  };

  const fetchThread = () => {
    // TODO add  v2 api
    return get(`/api/v2/todo`, token);
  };

  const putThread = () => {
    // TODO add v2 api
    return get(`/api/v2/todo`, token);
  };

  const fetchTotal = () => {
    return get(
      `/api/v2/feed?communityName=linen&state=${ThreadState.OPEN}&scope=${Scope.All}&total=true`,
      token
    ).then((response) => response.data);
  };

  if (page === Pages.Splash) {
    return <SplashPage onClick={() => setPage(Pages.SignIn)} />;
  }

  if (page === Pages.SignIn) {
    return (
      <SignInPage
        onSignIn={({ token, refreshToken }) => {
          setToken(token);
          setRefreshToken(refreshToken);
          setPage(Pages.Dashboard);
        }}
      />
    );
  }

  if (page === Pages.Dashboard) {
    return (
      <Dashboard
        fetchFeed={fetchFeed}
        fetchThread={fetchThread}
        fetchTotal={fetchTotal}
        putThread={putThread}
      />
    );
  }

  return null;
}

export default App;
