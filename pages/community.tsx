import React from "react";
import posthogConversations from "../posthog_community_conversations.json";

const communities = {
  name: "Posthog",
  description: "The product analytics suite you can host yourself",
};

console.log((posthogConversations as any)[0]);

export const Community = () => {
  return <h1>Posthog</h1>;
};
