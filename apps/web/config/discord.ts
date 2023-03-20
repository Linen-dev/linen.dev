// const permissions = '17179878400';
const permissions = '326417591296';
const scope = ['guilds.members.read', 'guilds', 'bot', 'messages.read'];

export const botV1 = () => {
  return {
    PUBLIC_CLIENT_ID: process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID!,
    PRIVATE_TOKEN: process.env.DISCORD_TOKEN!,
    PRIVATE_CLIENT_SECRET: process.env.DISCORD_CLIENT_SECRET!,
    PRIVATE_SCOPE: 'linen-bot-1',
    scope,
    permissions,
  };
};

export const botV2 = () => {
  return {
    PUBLIC_CLIENT_ID: process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID_2!,
    PRIVATE_TOKEN: process.env.DISCORD_TOKEN_2!,
    PRIVATE_CLIENT_SECRET: process.env.DISCORD_CLIENT_SECRET_2!,
    PRIVATE_SCOPE: 'linen-bot-2',
    scope,
    permissions,
  };
};

export const getAllBots = () => {
  return [
    { ...botV1(), botNum: 1 },
    { ...botV2(), botNum: 2 },
  ];
};

export const getCurrentConfig = () => {
  return {
    ...botV2(),
    PUBLIC_REDIRECT_URI: encodeURI(
      process.env.NEXT_PUBLIC_DISCORD_REDIRECT_URI!
    ),
  };
};
