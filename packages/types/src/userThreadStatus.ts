export type userThreadStatus = {
  userId: string;
  threadId: string;
  createdAt: Date;
  updatedAt: Date;
  muted: boolean;
  read: boolean;
  reminder: boolean;
  remindAt: Date | null;
};
