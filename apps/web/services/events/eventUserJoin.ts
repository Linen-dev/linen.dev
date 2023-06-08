import { createUserJoinJob } from 'queue/jobs';

export type UserJoin = {
  userId: string;
};

export async function eventUserJoin(event: UserJoin) {
  await Promise.allSettled([
    // it should dispatch messages to our queue system
    createUserJoinJob(event),
  ]);
}
