const user = {
  login: 'random-owner',
  id: 999999999,
  node_id: 'random-node-id',
  avatar_url: 'https://avatars.githubusercontent.com/u/999999999?v=4',
  gravatar_id: '',
  url: 'https://api.github.com/users/random-owner',
  html_url: 'https://github.com/random-owner',
  followers_url: 'https://api.github.com/users/random-owner/followers',
  following_url:
    'https://api.github.com/users/random-owner/following{/other_user}',
  gists_url: 'https://api.github.com/users/random-owner/gists{/gist_id}',
  starred_url:
    'https://api.github.com/users/random-owner/starred{/owner}{/repo}',
  subscriptions_url: 'https://api.github.com/users/random-owner/subscriptions',
  organizations_url: 'https://api.github.com/users/random-owner/orgs',
  repos_url: 'https://api.github.com/users/random-owner/repos',
  events_url: 'https://api.github.com/users/random-owner/events{/privacy}',
  received_events_url:
    'https://api.github.com/users/random-owner/received_events',
  type: 'User' as 'Bot' | 'User' | 'Organization',
  site_admin: false,
};

const repository = {
  id: 99999999999,
  node_id: 'random-id',
  name: 'random-project',
  full_name: 'random-owner/random-project',
  private: false,
  owner: user,
  html_url: 'https://github.com/random-owner/random-project',
  description: null,
  fork: false,
  url: 'https://api.github.com/repos/random-owner/random-project',
  forks_url: 'https://api.github.com/repos/random-owner/random-project/forks',
  keys_url:
    'https://api.github.com/repos/random-owner/random-project/keys{/key_id}',
  collaborators_url:
    'https://api.github.com/repos/random-owner/random-project/collaborators{/collaborator}',
  teams_url: 'https://api.github.com/repos/random-owner/random-project/teams',
  hooks_url: 'https://api.github.com/repos/random-owner/random-project/hooks',
  issue_events_url:
    'https://api.github.com/repos/random-owner/random-project/issues/events{/number}',
  events_url: 'https://api.github.com/repos/random-owner/random-project/events',
  assignees_url:
    'https://api.github.com/repos/random-owner/random-project/assignees{/user}',
  branches_url:
    'https://api.github.com/repos/random-owner/random-project/branches{/branch}',
  tags_url: 'https://api.github.com/repos/random-owner/random-project/tags',
  blobs_url:
    'https://api.github.com/repos/random-owner/random-project/git/blobs{/sha}',
  git_tags_url:
    'https://api.github.com/repos/random-owner/random-project/git/tags{/sha}',
  git_refs_url:
    'https://api.github.com/repos/random-owner/random-project/git/refs{/sha}',
  trees_url:
    'https://api.github.com/repos/random-owner/random-project/git/trees{/sha}',
  statuses_url:
    'https://api.github.com/repos/random-owner/random-project/statuses/{sha}',
  languages_url:
    'https://api.github.com/repos/random-owner/random-project/languages',
  stargazers_url:
    'https://api.github.com/repos/random-owner/random-project/stargazers',
  contributors_url:
    'https://api.github.com/repos/random-owner/random-project/contributors',
  subscribers_url:
    'https://api.github.com/repos/random-owner/random-project/subscribers',
  subscription_url:
    'https://api.github.com/repos/random-owner/random-project/subscription',
  commits_url:
    'https://api.github.com/repos/random-owner/random-project/commits{/sha}',
  git_commits_url:
    'https://api.github.com/repos/random-owner/random-project/git/commits{/sha}',
  comments_url:
    'https://api.github.com/repos/random-owner/random-project/comments{/number}',
  issue_comment_url:
    'https://api.github.com/repos/random-owner/random-project/issues/comments{/number}',
  contents_url:
    'https://api.github.com/repos/random-owner/random-project/contents/{+path}',
  compare_url:
    'https://api.github.com/repos/random-owner/random-project/compare/{base}...{head}',
  merges_url: 'https://api.github.com/repos/random-owner/random-project/merges',
  archive_url:
    'https://api.github.com/repos/random-owner/random-project/{archive_format}{/ref}',
  downloads_url:
    'https://api.github.com/repos/random-owner/random-project/downloads',
  issues_url:
    'https://api.github.com/repos/random-owner/random-project/issues{/number}',
  pulls_url:
    'https://api.github.com/repos/random-owner/random-project/pulls{/number}',
  milestones_url:
    'https://api.github.com/repos/random-owner/random-project/milestones{/number}',
  notifications_url:
    'https://api.github.com/repos/random-owner/random-project/notifications{?since,all,participating}',
  labels_url:
    'https://api.github.com/repos/random-owner/random-project/labels{/name}',
  releases_url:
    'https://api.github.com/repos/random-owner/random-project/releases{/id}',
  deployments_url:
    'https://api.github.com/repos/random-owner/random-project/deployments',
  created_at: '2023-01-25T15:18:42Z',
  updated_at: '2023-01-25T15:18:42Z',
  pushed_at: '2023-01-24T17:40:16Z',
  git_url: 'git://github.com/random-owner/random-project.git',
  ssh_url: 'git@github.com:random-owner/random-project.git',
  clone_url: 'https://github.com/random-owner/random-project.git',
  svn_url: 'https://github.com/random-owner/random-project',
  homepage: null,
  size: 2,
  stargazers_count: 0,
  watchers_count: 0,
  language: null,
  has_issues: true,
  has_projects: true,
  has_downloads: true,
  has_wiki: true,
  has_pages: false,
  has_discussions: false,
  forks_count: 0,
  mirror_url: null,
  archived: false,
  disabled: false,
  open_issues_count: 2,
  license: {
    key: 'mit',
    name: 'MIT License',
    spdx_id: 'MIT',
    url: 'https://api.github.com/licenses/mit',
    node_id: 'random-id',
  },
  allow_forking: true,
  is_template: false,
  web_commit_signoff_required: false,
  topics: [],
  visibility: 'public',
  forks: 0,
  open_issues: 2,
  watchers: 0,
  default_branch: 'main',
};

const sender = {
  login: 'random-owner',
  id: 999999999,
  node_id: 'random-node-id',
  avatar_url: 'https://avatars.githubusercontent.com/u/999999999?v=4',
  gravatar_id: '',
  url: 'https://api.github.com/users/random-owner',
  html_url: 'https://github.com/random-owner',
  followers_url: 'https://api.github.com/users/random-owner/followers',
  following_url:
    'https://api.github.com/users/random-owner/following{/other_user}',
  gists_url: 'https://api.github.com/users/random-owner/gists{/gist_id}',
  starred_url:
    'https://api.github.com/users/random-owner/starred{/owner}{/repo}',
  subscriptions_url: 'https://api.github.com/users/random-owner/subscriptions',
  organizations_url: 'https://api.github.com/users/random-owner/orgs',
  repos_url: 'https://api.github.com/users/random-owner/repos',
  events_url: 'https://api.github.com/users/random-owner/events{/privacy}',
  received_events_url:
    'https://api.github.com/users/random-owner/received_events',
  type: 'User',
  site_admin: false,
};

const installation = {
  id: 999999999,
  node_id: 'random-id',
};

export const issueOpenedMock = {
  id: '8dcc36c0-9cc3-11ed-91ce-6eeed4c7c479',
  name: 'issue_opened',
  payload: {
    action: 'opened',
    issue: {
      url: 'https://api.github.com/repos/random-owner/random-project/issues/2',
      repository_url:
        'https://api.github.com/repos/random-owner/random-project',
      labels_url:
        'https://api.github.com/repos/random-owner/random-project/issues/2/labels{/name}',
      comments_url:
        'https://api.github.com/repos/random-owner/random-project/issues/2/comments',
      events_url:
        'https://api.github.com/repos/random-owner/random-project/issues/2/events',
      html_url: 'https://github.com/random-owner/random-project/issues/2',
      id: 1556796709,
      node_id: 'random-id',
      number: 2,
      title: 'hello',
      user,
      labels: [],
      state: 'open',
      locked: false,
      assignee: null,
      assignees: [],
      milestone: null,
      comments: 0,
      created_at: '2023-01-25T15:18:42Z',
      updated_at: '2023-01-25T15:18:42Z',
      closed_at: null,
      author_association: 'OWNER',
      active_lock_reason: null,
      body: 'world',
      reactions: {
        url: 'https://api.github.com/repos/random-owner/random-project/issues/2/reactions',
        total_count: 0,
        '+1': 0,
        '-1': 0,
        laugh: 0,
        hooray: 0,
        confused: 0,
        heart: 0,
        rocket: 0,
        eyes: 0,
      },
      timeline_url:
        'https://api.github.com/repos/random-owner/random-project/issues/2/timeline',
      performed_via_github_app: null,
      state_reason: null,
    },
    repository,
    sender,
    installation,
  },
};

export const issueCommentMock = {
  id: '8dcc36c0-9cc3-11ed-91ce-6eeef4c7c479',
  name: 'issue_comment',
  payload: {
    action: 'created',
    issue: {
      ...issueOpenedMock.payload.issue,
      comments: 1,
    },
    comment: {
      url: 'https://api.github.com/repos/random-owner/random-project/issues/comments/88888888888',
      html_url:
        'https://github.com/random-owner/random-project/issues/2#issuecomment-88888888888',
      issue_url:
        'https://api.github.com/repos/random-owner/random-project/issues/2',
      id: 88888888888,
      node_id: 'random-id',
      user: { ...user },
      created_at: '2023-01-25T15:18:42Z',
      updated_at: '2023-01-25T15:18:42Z',
      author_association: 'OWNER',
      body: 'reply',
      reactions: {
        url: 'https://api.github.com/repos/random-owner/random-project/issues/comments/88888888888/reactions',
        total_count: 0,
        '+1': 0,
        '-1': 0,
        laugh: 0,
        hooray: 0,
        confused: 0,
        heart: 0,
        rocket: 0,
        eyes: 0,
      },
      performed_via_github_app: null,
    },
    repository,
    sender,
    installation,
  },
};
