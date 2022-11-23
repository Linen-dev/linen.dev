## How to add a new package?

New package requires a:

- package.json file
- `build` and `dev` scripts in package.json

## How to use a package?

Add it add a dependency of your app/package, you can use a wildcard to avoid having to update versions manually.

For example:

```
"@linen/ui": "*"
```
