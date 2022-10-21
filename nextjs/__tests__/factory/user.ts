import { SerializedUser } from 'serializers/user';

export default function createUser(options?: object): SerializedUser {
  return {
    id: '1',
    authsId: '1',
    username: 'john.doe',
    displayName: 'John Doe',
    profileImageUrl: 'https://foo.com/assets/images/john_doe.svg',
    externalUserId: null,
    ...options,
  };
}
