import request from "superagent";

export const getSlackChannelInfo = async (channelId: string) => {
  const url = "https://slack.com/api/conversations.info";
  const token = "xoxb-1250901093238-2993798261235-TWOsfgXd7ptiO6tyvjjNChfn";

  const response = await request
    .get(url + "channel=" + channelId)
    .set("Authorization", "Bearer " + token);

  return response;
};
