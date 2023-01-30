import { threadPostSchema, userPostSchema } from '@linen/types';
import { v4 } from 'uuid';
import { issueOpenedMock } from '../mocks/issues';
import Serializer from './serializer';

describe('serializers', () => {
  test('issue created', async () => {
    const result = Serializer.githubIssueToLinenThread(
      issueOpenedMock.payload.issue as any,
      v4(),
      v4(),
      v4(),
      v4()
    );
    expect(threadPostSchema.safeParse(result).success).toBe(true);
  });

  test('user', async () => {
    const result = Serializer.githubUserToLinenUser(
      issueOpenedMock.payload.issue.user,
      v4()
    );
    expect(userPostSchema.safeParse(result).success).toBe(true);
  });
});
