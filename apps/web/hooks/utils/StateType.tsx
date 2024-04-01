export type StateType = {
  [state: string]: UserType;
};

export type DiffType = {
  joins: {
    [state: string]: UserType;
  };
  leaves: {
    [state: string]: UserType;
  };
};

type UserType = {
  metas: {
    typing?: boolean;
    username?: string;
  }[];
};
