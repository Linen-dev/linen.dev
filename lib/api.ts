import { get } from './requests';

export const getSearchResults = async (query) => {
  const res = await get(`/search?query=${encodeURIComponent(query)}`);
  console.log(res);
  return res;
};
