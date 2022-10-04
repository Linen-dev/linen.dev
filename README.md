<p align="center">
  <a href="https://linen.dev/">
    <img alt="linen-dev" src="https://d2mu86a8belxbg.cloudfront.net/logos/linen-black-logo.svg" width="546">
  </a>
</p>

## Linen.dev

Linen is a Google-searchable community chat tool. Linen was built as an alternative to closed tools like Slack and Discord.

Linen is free and offers unlimited message retention you can sign up at Linen.community.

### Philosphy:

There are a few problems with chat communities today:

1. Slack and Discord are not accessible by the internet and archivable. Slack and Discord becomes blackhole for information.
   1. We designed linen to be Google Searchable by rendering a static version of our page based on whether if it is a bot. Search engines do not crawl javascript well which is why most other chat tools aren’t getting indexed.
2. These communities often becomes a customer support channel and it is often overwhelming for the community maintainers.
   1. We treat threads very similarly to Github issues and support tickets so that the team can manage their conversations better.
3. Chat is very noisy and too many notifications are stressful.
   1. We redesigned the notification system around the concept of a feed. @mentions show up in your feed instead of sending you a push notification. We add a !mention for when you want a real time notification system

### Features:

1. Slack/Discord Import: We can import all of your public Slack/Discord conversations, attachments, emojis, and members
2. Sitemap generation to help search engines crawl your community
3. Markdown message support
4. Join multiple communities with a single account (only works on cloud edition)
5. Custom domain hosting for Cloud edition
6. Anonymize member’s display names
7. Custom community branding
8. Attachments support
9. Drag and drop messages in to threads
10. Open close state on all threads
11. Drag and drop messages in to different channels

### Near term Roadmap:

- Improved search: Right now search is based on postgres full text search. We plan on introducing a separate search service to manage this
- Desktop client
- Mobile app
- Github issues integration

Our documentation is divided into several sections:

#### Development

- [NextJs](./docs/nextjs.md)

#### Data source

- [Database](./docs/database.md)
- [Cache](./docs/cache.md)

#### Infrastructure

- [CDK](./docs/cdk.md)

#### Others

- [Sitemap](./docs/sitemap.md)
- [SlackBot](./docs/slack-app.md)
