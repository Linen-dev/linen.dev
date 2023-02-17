import { LinearClient } from '@linear/sdk';
import { parseUser, parseTeam } from './serializers';

export async function fetchUser({
  accessToken,
  userId,
}: {
  accessToken: string;
  userId: string;
}) {
  const linearClient = new LinearClient({ accessToken });
  const response = await linearClient.users({ filter: { id: { eq: userId } } });
  const user = response.nodes.shift();
  return user ? parseUser(user) : null;
}

export async function fetchTeams({
  linearClient,
  accessToken,
}: {
  linearClient?: LinearClient;
  accessToken?: string;
}) {
  if (!linearClient) {
    linearClient = new LinearClient({ accessToken });
  }

  const teams = [];

  let response = await linearClient.teams();
  teams.push(...response.nodes.map(parseTeam));

  let hasMore = response.pageInfo.hasNextPage;
  while (hasMore) {
    response = await linearClient.teams({ after: response.pageInfo.endCursor });
    teams.push(...response.nodes.map(parseTeam));
    hasMore = response.pageInfo.hasNextPage;
  }

  return teams;
}

type createMessageType = {
  accessToken: string;
  issueId: string;
  body: string;
  createAsUser: string;
  displayIconUrl?: string;
};

export async function createMessage({
  accessToken,
  issueId,
  body,
  createAsUser,
  displayIconUrl,
}: createMessageType) {
  const linearClient = new LinearClient({ accessToken });
  return await linearClient.createComment({
    issueId,
    body,
    createAsUser,
    displayIconUrl,
  });
}

type createThreadType = {
  accessToken: string;
  teamId: string;
  title: string;
  description: string;
  createAsUser: string;
  displayIconUrl?: string;
};

export async function createThread({
  accessToken,
  teamId,
  title,
  description,
  createAsUser,
  displayIconUrl,
}: createThreadType) {
  const linearClient = new LinearClient({ accessToken });
  return await linearClient
    .createIssue({
      teamId,
      title,
      description,
      createAsUser,
      displayIconUrl,
    })
    .then((issue) => issue.issue);
}

type updateThreadType = {
  accessToken: string;
  issueId: string;
  title?: string;
  stateId?: string;
};

export async function updateThread({
  accessToken,
  issueId,
  title,
  stateId,
}: updateThreadType) {
  const linearClient = new LinearClient({ accessToken });
  return await linearClient.updateIssue(issueId, {
    title,
    stateId,
  });
}

export async function getStatusId({
  accessToken,
  status,
}: {
  accessToken: string;
  status: 'started' | 'completed';
}) {
  const linearClient = new LinearClient({ accessToken });

  const states = await linearClient
    .workflowStates({
      includeArchived: false,
      filter: { type: { eq: status } },
      first: 1,
    })
    .then((r) => r?.nodes?.shift());

  return states?.id;
}
