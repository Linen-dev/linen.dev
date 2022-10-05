<p align="center">
  <a href="https://linen.dev/">
    <img alt="linen-dev" src="https://d2mu86a8belxbg.cloudfront.net/logos/linen-black-logo.svg" width="546">
  </a>
</p>

Linen is a Google-searchable community chat tool. Linen was built as an alternative to closed tools like Slack and Discord.

Linen is free and offers unlimited message retention you can sign up at Linen.community.

### Core Features:

1. Linen is search engine friendly. We have over 50,000 pages indexed on Google. Most chat apps are not search engine friendly because they are very JS heavy. We made Linen search engine friendly by offering a sitemap, conditionally rendering a static version of our page to search engines, and using cursor based pagination so pages will be consistant.
2. Linen is designed with customer support in mind. Most communities often become a customer support channel. All of our threads have a open close state. We have a feed where you can browse all open/closed conversations in one place instead of having to worry about which channels and conversations your team have missed.
3. Linen is designed to be async first. Chat can be very noisy especially with large communities. By having a feed of conversations that you are participating in you don't have to worry about missing messages. We also repurposed @mentions from a notification to a async notification where it shows up in your feed. We replaced it with !mention which will send a push notification to you. 
4. Linen support imports from all of your public Slack/Discord conversations, attachments, emojis, and members.

### Features:
1. Drag and drop messages in to different channels
2. Sitemap generation to help search engines crawl your community
3. Markdown message support
4. Join multiple communities with a single account
5. Custom domain hosting for Cloud edition
6. Anonymize member’s display names
7. Custom community branding
8. Attachments support
9. Drag and drop messages in to threads
10. Open close state on all threads

### Near term Roadmap:

- Improved search
- Desktop client
- Mobile app
- Github issues integration
- Improve self deployment flows

Our documentation is divided into several sections:

#### Development

- [NextJs](./docs/nextjs.md)

#### Data source

- [Database](./docs/database.md)
- [Cache](./docs/cache.md)

#### Others

- [Sitemap](./docs/sitemap.md)
- [SlackBot](./docs/slack-app.md)
