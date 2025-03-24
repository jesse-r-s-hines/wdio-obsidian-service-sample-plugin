<!-- [![Test](https://github.com/ORG/REPO/actions/workflows/test.yaml/badge.svg?branch=main)](https://github.com/ORG/REPO/actions/workflows/test.yaml) -->
# WDIO Obsidian Service Sample Plugin 

This is a sample Obsidian plugin with unit and end-to-end tests set up using
[WebdriverIO](https://webdriver.io/), [Mocha](https://mochajs.org), and
[wdio-obsidian-service](https://jesse-r-s-hines.github.io/wdio-obsidian-service/modules/wdio-obsidian-service.html). It also has
GitHub actions to run the tests.

For more information on how to develop Obsidian plugins and use this template see the
[official obsidian sample plugin](https://github.com/obsidianmd/obsidian-sample-plugin) (which
this template is based on) and the [Obsidian developer docs](https://docs.obsidian.md/Home).

For more info on how to configure and write your e2e tests, see
[wdio-obsidian-service](https://jesse-r-s-hines.github.io/wdio-obsidian-service/modules/wdio-obsidian-service.html).

## Update dependencies
You'll probably want to update the dependencies after you use this template:
```shell
npm run update
```

## Building and running the tests
To build and test just use
```shell
npm install
npm test
```

`wdio-obsidian-service` will automatically download Obsidian and run your tests against a
sandboxed instance of Obsidian so you don't need to worry about your personal Obsidian
configuration affecting the tests.

Use `npm run test:unit` and `npm run test:e2e` to run just the unit or end-to-end tests.

You can manually specify Obsidian versions to test against using the `OBSIDIAN_VERSIONS`
environment variable as a space separated list of appVersion/installerVersion pairs. (See `wdio-obsidian-service` docs for more info on how to set Obsidian versions). E.g.
```shell
OBSIDIAN_VERSIONS='latest/latest 1.8.9/1.7.7' npm run test:e2e
```

You can use `WDIO_MAX_INSTANCES` to increase the number of parallel Obsidian instances that will
be launched during the tests.

## `obsidian-launcher` CLI
You can also use the `obsidian-launcher` command (part of `wdio-obsidian-service`) to download
different versions of Obsidian and run them with sandboxed configuration directories:
```shel
npx obsidian-launcher watch --copy --plugin . test/vaults/simple
```

## GitHub Workflows
This sample also has GitHub workflows already set up so you can end-to-end test your plugin
automatically on PRs!

### Test Workflow
The [test](./.github/workflows/test.yaml) workflow runs the unit and e2e tests on pushes and PRs.

### Check for new Obsidian
The [check_for_new_obsidian](./.github/workflows/check_for_new_obsidian.yaml) workflow checks daily
if there is a new Obsidian version. If so, it re-runs the [test](./.github/workflows/test.yaml)
workflow against the new Obsidian version. If you've set up Obsidian Catalyst credentials (see
below) the workflow will also test against the latest Obsidian beta, letting you catch any issues
early.

GitHub can be a bit finicky about scheduled workflows. If you fork this repo or use it as a
template, you may need to manually enable the `check_for_new_obsidian.yaml` workflow in the Actions tab
before it will actually start the schedule.

### Setting up Secrets
Obsidian insider versions require require authentication to download, so if you want to test beta
versions, you'll need to have an Obsidian account with Catalyst. Just add your credentials to
GitHub secrets as `OBSIDIAN_USERNAME` and `OBSIDIAN_PASSWORD`. 2FA needs to be disabled.

Note that workflows triggered by fork PRs won't have access to GitHub secrets and so only in-repo
PRs and tests triggered by [check_for_new_obsidian](./.github/workflows/check_for_new_obsidian.yaml) will test
against Obsidian beta versions.

### Release Workflow
To create a new plugin release, just run
```
npm version <new-version-number>
git push
git push origin tag <new-version-number>
```
This will trigger the [release](./.github/workflows/release.yaml) workflow and create a draft
release. You can then go into GitHub releases, write your release notes, and publish the release.
