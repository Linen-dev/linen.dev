export type slackAuthorizations = {
  id: string;
  createdAt: Date;
  accessToken: string;
  botUserId: string;
  scope: string;
  userScope: string | null;
  authedUserId: string | null;
  userAccessToken: string | null;
  joinChannel: boolean;
  syncFrom: Date | null;
  accountsId: string | null;
};
