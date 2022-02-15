import prisma from "../../client";
import { createMessage, findOrCreateChannel } from "../../lib/slack";

beforeEach(async () => {
  await Promise.all([
    prisma.message.deleteMany(),
    prisma.slackThread.deleteMany(),
    prisma.channel.deleteMany(),
  ]);
});

describe("When a message belongs to a thread", () => {
  it("creates new thread object", async () => {
    const slackChannelId = "someChannelID";
    const channelName = "someChannelName";
    const channel = await findOrCreateChannel(slackChannelId, channelName);
    const channelId = channel.id;
    const threadTs = Date.now();

    const firstMessage = {
      body: "First message",
      sentAt: new Date(threadTs),
      channelId,
      slackThreadTs: (threadTs / 1000).toString(),
    };

    await createMessage(firstMessage);

    const responseMessage = {
      body: "creating a new thread",
      sentAt: new Date(),
      channelId,
      slackThreadTs: threadTs.toString(),
    };

    await createMessage(responseMessage);
    const slackThread = await prisma.slackThread.findUnique({
      where: { slackThreadTs: threadTs.toString() },
    });

    expect(slackThread).not.toBeNull;
  });

  describe("when the root message already exist", () => {
    it("creates a thread", () => {});
  });
  describe("when the root message doens't exist", () => {
    it("creates a thread without a root message", () => {});
    describe("when creating the root message after child messages has been created", () => {});
  });
});
