# What is Linen

Linen is a Google searchable communities platform. We support two way syncs with different communities like Slack/Discord and now Matrix.

# Getting Started

In this guide we will setup the bridge connected to your homeserver. This guide will walk through the most common settings, other options are documented in the `config.sample.yaml` file.

## Installation from source

These instructions assume you are using Synapse 1.4.0+. They should work for older releases and other homeservers, but configuration may vary.

```sh
git clone https://github.com/Linen-dev/linen.dev.git
cd linen.dev
yarn install
yarn tb matrix
```

## How it works

The bridge listens to events using the Linen API over webhook, and to Matrix events on a port that the homeserver sends events to. This tutorial will walk you through configuring your homeserver and Linen to send messages to this bridge and setting up the api so this bridge can relay those message (all messages) to the other bridged channel. For the sake of this tutorial, we will assume your homeserver is hosted on the same server as this bridge at the port `8008` (http://localhost:8008).

If you've set up other bridges, you're probably familiar with the link used to reach your homeserver, the "homeserver url". This is the same URL. This is the same port. No problem! Multiple bridges can plug into the same homeserver url without conflicting with each other.

NOTE: If your bridge and homeserver run on different machines, you will need to introduce proxying into the mix, which is beyond the scope of these docs. There are some really awesome and kind people in the Matrix community. If you're ever stuck, you can post a question in the [Matrix Bridging room](https://matrix.to/#/#bridges:matrix.org).

## Setup

1. Decide on a spare two local TCP port number to use.

   - One will listen for messages from Matrix and needs to be visible to the homeserver. This port will be notated as `$BRIDGE_PORT` in the remaining instructions. By default, this is 9000.
   - The other will listen for messages from Linen and needs to be visible to the internet. This port will be notated as `$WEBHOOK_PORT` in the remaining instructions. By default, this is 9001.

   Take care to configure firewalls appropriately.

2. Create a `config.yaml` file for global configuration. There is a sample one to begin with in `config.sample.yaml`. You should copy and edit as appropriate. The required and optional values are flagged in the config.

3. For `matrix.domain`, enter the matrix server name, e.g. `my.example.com` or `localhost`.

4. For `matrix.homeserverUrl`, enter the matrix server host, defaults to `http://localhost:8008`.

5. For `bridge.port`, enter the value of `$BRIDGE_PORT`, unless it is `9000`, which is the default.

6. For `linen.apikey`, visit your Linen community configurations page. Go to `https://www.linen.dev/getting-starred`, open the community you want to bridge. In your community, on the left menu under the settings, click on "Configurations", under "Api Key", click on "Manage". Create a new api key, use the new token as `linen.apikey`.

7. For `webhook.port`, enter the value of `$WEBHOOK_PORT`, unless it is `9001`, which is the default.

8. The key `webhook.apikey`, used for security. It will validate that webhooks has authentication header with this value. Needs to be generated, [how to generate a secret](../../docs/getting-started.md#how-to-generate-a-secret).

9. Go to `https://www.linen.dev/s/$YOUR_COMMUNITY_PATH/matrix` and create a matrix integration. For "bridge server", use the host you will be running this bridge. Needs to be visible to the internet. For "bridge api key", use key recent created for `webhook.apikey`. Toggle the enabled button.

10. Generate the appservice registration file. This will be used by the Matrix homeserver. Here, you must specify the direct link the **Matrix Homeserver** can use to access the bridge, including the Matrix port it will send messages through (if this bridge runs on the same machine you can use `localhost` as the `$HOST` name):

    ```sh
    cd packages/integration-matrix
    yarn start -r -c config.yaml -u "http://$HOST:$BRIDGE_PORT"
    ```

11. Start the actual application service:

    ```sh
    # under packages/integration-matrix
    yarn start -c config.yaml
    ```

12. Copy the newly-generated `linen-registration.yaml` file to your Matrix homeserver. Add the registration file to your homeserver config (default `homeserver.yaml`):

    ```yaml
    app_service_config_files:
      - ...
      - '/path/to/linen-registration.yaml'
    ```

    Don't forget - it has to be a YAML list of strings, not just a single string.

    Restart your homeserver to have it reread the config file and establish a connection to the bridge.

13. The bridge itself should now be running. Congrats!

The bridge bot will stay offline for most of the time. This is normal. You will know if the bridge is working (and that your homeserver is properly connected) if it joins a public room after a message is sent. You can expect the bot to join within 45 seconds after the message was sent. If it never joins the room, check your bridge's logs and review the above steps.

Sending a message on any public channel will create a new channel on Linen and start to sync all new messages in both ways Matrix -> Linen and Linen -> Matrix.

For private channels, you will need to invite the Linen bot into the channel. The bot will have the name similar to: `@linen:matrix.domain`

## Upgrading

1. Build the latest version of the application service. [Follow the Installation section instructions.](#installation)
1. Restart the application service.

Note: You do NOT need to regenerate an appservice registration file.

## Proxying

If you want to host this bridge on a different server than your homeserver, you will have to proxy the bridge so both the Matrix port (specified when creating your registration file through the -u property) and the Webhook port (specified by the `webhook.port` prefix in your config file) can be reached. This way both the Matrix homeserver and the Linen Server can reach your bridge.

## Roadmap

- [ ] reactions
- [ ] editions
- [ ] deletions
- [ ] datastore
- [ ] queue
- [ ] historic sync
