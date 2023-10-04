import axios from 'axios';
import { measure } from './utils/measure';
import env from './utils/env';
// import { memo } from './utils/memo';

export default class Linen {
  // @memo()
  @measure
  static async getCommunityInfo(communityName: string) {
    return axios
      .get<{
        currentCommunity: {
          name: string;
          id: string;
          search: {
            apiKey: string;
          };
        };
      }>(
        `${env.AUTH_SERVICE_URL}/api/ssr/commons?communityName=${communityName}`
      )
      .then((e) => e.data.currentCommunity)
      .catch((e) => {
        throw new Error(e);
      });
  }
}
