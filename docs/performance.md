### Client side performance

Client side loading time is heavily influenced by the size of the bundle that's being delivered to the browser.

To analyze the current client/server bundle you can run.

```bash
ANALYZE=true yarn build
```

It should open two html files in your browser. The smaller it is, the better the app is going to work on a variety on devices.
