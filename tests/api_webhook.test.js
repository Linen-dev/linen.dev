import { createSlackMessage } from "../pages/api/webhook";

const slackNewMessageEvent = {
  token: "vDJW8zxjB280BnHi84Z19YfU",
  team_id: "T017CSH2R70",
  api_app_id: "A0306BRR6AD",
  event: {
    client_msg_id: "d7f1a339-3dc5-4698-b183-1d4527ab2839",
    type: "message",
    text: "more thread",
    user: "U0174S5F9E3",
    ts: "1644442986.718559",
    team: "T017CSH2R70",
    blocks: [
      {
        type: "rich_text",
        block_id: "nRN",
        elements: [
          {
            type: "rich_text_section",
            elements: [
              {
                type: "text",
                text: "more thread",
              },
            ],
          },
        ],
      },
    ],
    thread_ts: "1644440885.347779",
    parent_user_id: "U0174S5F9E3",
    channel: "C030HFK836C",
    event_ts: "1644442986.718559",
    channel_type: "channel",
  },
  type: "event_callback",
  event_id: "Ev032GNDD3MJ",
  event_time: 1644442986,
  authorizations: [
    {
      enterprise_id: null,
      team_id: "T017CSH2R70",
      user_id: "U0174S5F9E3",
      is_bot: false,
      is_enterprise_install: false,
    },
  ],
  is_ext_shared_channel: false,
  event_context:
    "4-eyJldCI6Im1lc3NhZ2UiLCJ0aWQiOiJUMDE3Q1NIMlI3MCIsImFpZCI6IkEwMzA2QlJSNkFEIiwiY2lkIjoiQzAzMEhGSzgzNkMifQ",
};

test("Creates a message when Slack sends a slack event", async () => {
  const sentAt = new Date(parseFloat(slackNewMessageEvent.event.ts) * 1000);
  await expect(createSlackMessage(slackNewMessageEvent)).resolves.toMatchObject(
    {
      body: slackNewMessageEvent.event.text,
      sentAt: sentAt,
    }
  );
  expect();
});
