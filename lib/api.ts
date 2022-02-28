import { get } from './requests';

export const getSearchResults = async (query) => {
  const res = await get(
    `https://papercups-io.linen.dev/api/search?query=${encodeURIComponent(
      query
    )}`
  );
  console.log(res);
  return res;
};
