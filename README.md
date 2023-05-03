<p align="center">
  <a href="https://linen.dev/">
    <img alt="linen-dev" src="https://d2mu86a8belxbg.cloudfront.net/logos/linen-black-logo.svg" width="546">
  </a>
</p>

Linen is a Google-searchable community chat tool. Linen was built as an alternative to closed tools like Slack and Discord.

### Philosophy

Modern communities are built on chat, Slack and Discord is great to get fast realtime answers from teams but it can become a chaotic blackhole of information. Historically these communities existed in forums where they had better structure and search-engine friendliness. We believe the future of communiation is in a hybrid model where you have all the benefits of a real time chat as well as the organizational benefits of a forum.

Linen is free and offers unlimited message retention you can sign up at Linen.community.

Linen cloud edition: https://linen.dev
Join our public community: https://linen.dev/s/linen

Development Philosophy

Ship the smallest functioning feature that makes the users' lives better and then iterate.

### See project roadmap: https://github.com/orgs/Linen-dev/projects/2

### Core Features:

- **Search engine friendly**: Linen communities have over 50,000 pages indexed on Google with over 10,000,000 search impressions. Most chat apps are not search engine friendly because they are very JS heavy. We made Linen search engine friendly by offering a sitemap, conditionally rendering a static version of our page to search engines, and using cursor based pagination so pages will be consistant.
- **Customer support tooling**: Most communities often become a customer support channel. All of our threads have a open close state. We have a feed where you can browse all open/closed conversations in one place instead of having to worry about which channels and conversations your team have missed.
- **Async first**: Chat can be very noisy especially with large communities. By having a feed of conversations that you are participating in you don't have to worry about missing messages. We also repurposed @mentions from a notification to a async notification where it shows up in your feed. We replaced it with !mention which will send a push notification to you.
- **Import communities**: Linen support imports from all of your public Slack/Discord conversations, attachments, emojis, and members.
- **Single account across multiple communities**: Linen let's you join multiple communities with a single login without multiple emails and passwords
- **Private communities**: In addition to public communities we also support private communities that require a password login to access the content. We use this feature for internal team discussions.
- **Move threads and messages**: Linen let's you drag and drop messages and merge them into a single thread as well as move threads between channels.
- **Discord Forum Support**: Linen will sync Discord and make the search engine friendly

### Roadmap:

- **Github integration**: Most open source communities use github issues to manage their tickets. We want to let you tag a conversation with a github issue and it will auto post a message when the ticket is closed or has an update.
- **Improved search**: Currently search is done via full text search with postgres. There are a lot more improvements to be made here we are considering hosting a separate search service
- **Desktop/Mobile client**: We want to support a desktop and mobile client for Linen so you can get push notifications for when there are urgent things.
- **Botting**: We want to support botting and automation where you can build and add your custom bots
- **Private Channels**: Channels that are invite only within the community
- **Direct messages**: Direct messages within the community

## Feedback:

Linen is in it's early stages of development so we are looking for a ton of feedback.

### Misc Features:

1. Markdown message support
2. Custom community branding
3. Custom domain hosting for Cloud edition
4. Attachments support
5. Emoji support

Our documentation is divided into several sections:

#### Development

- [Monorepo](./docs/monorepo.md)
- [NextJs](./docs/nextjs.md)

#### Data source

- [Database](./docs/database.md)
- [Cache](./docs/cache.md)

#### Others

- [Sitemap](./docs/sitemap.md)
- [SlackBot](./docs/slack-app.md)
