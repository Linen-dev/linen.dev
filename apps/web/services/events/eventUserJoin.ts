// import { createUserJoinJob } from 'queue/jobs';
import { userJoinTask } from 'queue/tasks/user-join';

export type UserJoin = {
  userId: string;
};

export async function eventUserJoin(event: UserJoin) {
  await Promise.allSettled([
    userJoinTask(event), // run it synchronously
  ]);
}
