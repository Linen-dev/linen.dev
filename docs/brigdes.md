## Bridgebot-based bridges

The simplest way to exchange messages with a remote network is to have the bridge log into the network using one or more predefined users called bridge bots - typically called LinenBot or LinenBot[123] etc. These relay traffic on behalf of the users on the other side, but it’s a terrible experience as all the metadata about the messages and senders is lost.

- github

## Bot-API (aka Virtual user) based bridges

Some remote systems support the idea of injecting messages from ‘fake’ or ‘virtual’ users, which can be used to represent the Matrix-side users as unique entities in the remote network. For instance, Slack’s inbound webhooks lets remote bots be created on demand, letting Matrix users be shown cosmetically correctly in the timeline as virtual users. However, the resulting virtual users aren’t real users on the remote system, so don’t have presence/profile and can’t be tab-completed or direct-messaged etc. They also have no way to receive typing notifs or other richer info which may not be available via bot APIs.

- linear
- slack
- discord (one-way)

## One-way bridging

One-way bridging is rare, but can be used to represent a bridge that is bridging from the remote system into Linen. This is common when the remote system does not permit message posting, or is simply not capable of handling posting outside their system. The users bridged from the remote system often appear as virtual users in Linen.

- email
