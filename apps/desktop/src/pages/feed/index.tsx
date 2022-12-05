import 'react';
import Feed from '../../components/Pages/Feed';
import { get } from '../../utilities/http';
import { Scope, ThreadState } from '@linen/types';

function App() {
  const fetchFeed = () => {
    return get(
      `/api/v2/feed?communityName=linen&scope=${Scope.All}&state=${ThreadState.OPEN}&page=1`
    ).then((response) => response.data);
  };

  const fetchThread = () => {
    // TODO add  v2 api
    return get(`/api/v2/todo`);
  };

  const putThread = () => {
    // TODO add v2 api
    return get(`/api/v2/todo`);
  };

  const fetchTotal = () => {
    return get(
      `/api/v2/feed?communityName=linen&state=${ThreadState.OPEN}&scope=${Scope.All}&total=true`
    ).then((response) => response.data);
  };

  return (
    <Feed
      fetchFeed={fetchFeed}
      fetchThread={fetchThread}
      fetchTotal={fetchTotal}
      putThread={putThread}
    />
  );
}

export default App;
