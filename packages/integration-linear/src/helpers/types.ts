// linear
export type Types = 'Comment' | 'Issue';
export type Actions = 'create' | 'update' | 'remove';

export type Issue = {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  number: number;
  title: string;
  description: string;
  priority: number;
  boardOrder: number;
  sortOrder: number;
  teamId: string;
  previousIdentifiers: any[];
  creatorId: string;
  stateId: string;
  priorityLabel: string;
  descriptionData: string;
  subscriberIds: string[];
  labelIds: any[];
  state: {
    id: string;
    name: string;
    color: string;
    type: string;
  };
  team: {
    id: string;
    name: string;
    key: string;
  };
};

export type Comment = {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  body: string;
  issueId: string;
  userId: string;
  reactionData: any[];
  issue: {
    id: string;
    title: string;
  };
  user: {
    id: string;
    name: string;
  };
};

// linen
export type Channel = {
  id: string;
  accountId: string;
};

export type User = {
  id: string;
};
