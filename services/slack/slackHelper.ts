import request from 'superagent';
// import { SlackSearchResponseBody } from '../../types/slackResponses/slackSearchInterface';
import {
  UserInfo,
  UserInfoResponseBody,
} from '../../types/slackResponses/slackUserInfoInterface';

// FIXME: possible dead code
// const getSlackChannelInfo = async (channelId: string, token: string) => {
//   const url = 'https://slack.com/api/conversations.info';

//   const response = await request
//     .get(url + 'channel=' + channelId)
//     .set('Authorization', 'Bearer ' + token);

//   return response;
// };

// FIXME: possible dead code
//Search only accepts user tokens
// const slackSearch = async ({
//   query,
//   token,
// }: {
//   query: string;
//   token: string;
// }): Promise<SlackSearchResponseBody> => {
//   const url = 'https://slack.com/api/search.messages?';

//   const response = await request
//     .get(url + 'query=' + query)
//     .set('Authorization', 'Bearer ' + token);

//   return response.body as SlackSearchResponseBody;
// };

export const getSlackUser = async (
  userId: string,
  token: string
): Promise<UserInfo> => {
  const url = 'https://slack.com/api/users.info?';

  const response = await request
    .get(url + 'user=' + userId)
    .set('Authorization', 'Bearer ' + token);

  const responseBody = response.body as UserInfoResponseBody;
  return responseBody.user;
};

// example response:

export const getSlackChannels = async (teamId: string, token: string) => {
  const url = 'https://slack.com/api/conversations.list?exclude_archived=true&';

  const response = await request
    .get(url + 'team_id=' + teamId)
    .set('Authorization', 'Bearer ' + token);

  return response;
};

// {
//   "ok": true,
//   "channels": [
//       {
//           "id": "C017J7MAH7X",
//           "name": "papercups",
//           "is_channel": true,
//           "is_group": false,
//           "is_im": false,
//           "is_mpim": false,
//           "is_private": false,
//           "created": 1595456410,
//           "is_archived": false,
//           "is_general": false,
//           "unlinked": 0,
//           "name_normalized": "papercups",
//           "is_shared": false,
//           "is_org_shared": false,
//           "is_pending_ext_shared": false,
//           "pending_shared": [],
//           "parent_conversation": null,
//           "creator": "U0174S5F9E3",
//           "is_ext_shared": false,
//           "shared_team_ids": [
//               "T017CSH2R70"
//           ],
//           "pending_connected_team_ids": [],
//           "is_member": true,
//           "topic": {
//               "value": "",
//               "creator": "",
//               "last_set": 0
//           },
//           "purpose": {
//               "value": "",
//               "creator": "",
//               "last_set": 0
//           },
//           "previous_names": [],
//           "num_members": 2
//       },
//       {
//           "id": "C017NTUKX9B",
//           "name": "github",
//           "is_channel": true,
//           "is_group": false,
//           "is_im": false,
//           "is_mpim": false,
//           "is_private": false,
//           "created": 1595632563,
//           "is_archived": false,
//           "is_general": false,
//           "unlinked": 0,
//           "name_normalized": "github",
//           "is_shared": false,
//           "is_org_shared": false,
//           "is_pending_ext_shared": false,
//           "pending_shared": [],
//           "parent_conversation": null,
//           "creator": "U0174S5F9E3",
//           "is_ext_shared": false,
//           "shared_team_ids": [
//               "T017CSH2R70"
//           ],
//           "pending_connected_team_ids": [],
//           "is_member": false,
//           "topic": {
//               "value": "",
//               "creator": "",
//               "last_set": 0
//           },
//           "purpose": {
//               "value": "",
//               "creator": "",
//               "last_set": 0
//           },
//           "previous_names": [],
//           "num_members": 3
//       },
//       {
//           "id": "C017RQQ6QS0",
//           "name": "help",
//           "is_channel": true,
//           "is_group": false,
//           "is_im": false,
//           "is_mpim": false,
//           "is_private": false,
//           "created": 1595457338,
//           "is_archived": false,
//           "is_general": false,
//           "unlinked": 0,
//           "name_normalized": "help",
//           "is_shared": false,
//           "is_org_shared": false,
//           "is_pending_ext_shared": false,
//           "pending_shared": [],
//           "parent_conversation": null,
//           "creator": "U0174S5F9E3",
//           "is_ext_shared": false,
//           "shared_team_ids": [
//               "T017CSH2R70"
//           ],
//           "pending_connected_team_ids": [],
//           "is_member": false,
//           "topic": {
//               "value": "",
//               "creator": "",
//               "last_set": 0
//           },
//           "purpose": {
//               "value": "",
//               "creator": "",
//               "last_set": 0
//           },
//           "previous_names": [],
//           "num_members": 5
//       },
//       {
//           "id": "C017Y7JJK8R",
//           "name": "general",
//           "is_channel": true,
//           "is_group": false,
//           "is_im": false,
//           "is_mpim": false,
//           "is_private": false,
//           "created": 1595456410,
//           "is_archived": false,
//           "is_general": true,
//           "unlinked": 0,
//           "name_normalized": "general",
//           "is_shared": false,
//           "is_org_shared": false,
//           "is_pending_ext_shared": false,
//           "pending_shared": [],
//           "parent_conversation": null,
//           "creator": "U0174S5F9E3",
//           "is_ext_shared": false,
//           "shared_team_ids": [
//               "T017CSH2R70"
//           ],
//           "pending_connected_team_ids": [],
//           "is_member": false,
//           "topic": {
//               "value": "<https://github.com/papercups-io/papercups>",
//               "creator": "U017KJKNJ58",
//               "last_set": 1596218514
//           },
//           "purpose": {
//               "value": "This channel is for workspace-wide communication and announcements. All members are in this channel.",
//               "creator": "U0174S5F9E3",
//               "last_set": 1595456410
//           },
//           "previous_names": [],
//           "num_members": 3
//       },
