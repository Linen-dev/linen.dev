import axios from 'axios';
import { measure } from './utils/measure';
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
      }>(`https://www.linen.dev/api/ssr/commons?communityName=${communityName}`)
      .then((e) => e.data.currentCommunity)
      .catch((e) => {
        throw new Error(e);
      });
  }
}
