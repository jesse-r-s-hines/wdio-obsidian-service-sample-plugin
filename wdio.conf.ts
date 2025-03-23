import * as path from "path"
import { obsidianBetaAvailable, resolveObsidianVersions } from "wdio-obsidian-service";

const cacheDir = path.resolve(".obsidian-cache");

let versions: [string, string][]; // [appVersion, installerVersion][]
if (process.env.OBSIDIAN_VERSIONS) {
    // Space separated list of appVersion/installerVersion, e.g. "1.7.7/latest latest/earliest"
    versions = process.env.OBSIDIAN_VERSIONS.split(/[ ,]+/).map(v => {
        const [app, installer = "earliest"] = v.split("/"); // default to earliest installer
        return [app, installer];
    })
} else if (process.env.CI) {
    // Running in GitHub workflow.
    // You can use RUNNER_OS to select different versions on different platforms in the workflow matrix if you want
    versions = [["earliest", "earliest"], ["latest", "latest"]];
    if (await obsidianBetaAvailable(cacheDir)) {
        versions.push(["latest-beta", "latest"]);
    }

    // Print the resolved Obsidian versions for use as the workflow cache key (see test_e2e.yaml)
    for (let [app, installer] of versions) {
        [app, installer] = await resolveObsidianVersions(app, installer, cacheDir);
        console.log(`${app}/${installer}`);
    }
} else {
    versions = [["latest", "latest"], ["earliest", "earliest"]];
}

export const config: WebdriverIO.Config = {
    runner: 'local',

    specs: [
        './test/specs/**/*.e2e.ts'
    ],

    // How many instances of Obsidian should be launched in parallel during testing.
    maxInstances: Number(process.env["WDIO_MAX_INSTANCES"] || 4),

    capabilities: versions.map(([appVersion, installerVersion]) => ({
        browserName: 'obsidian',
        browserVersion: appVersion,
        'wdio:obsidianOptions': {
            installerVersion: installerVersion,
            plugins: ["."],
            // If you need to switch between multiple vaults, you can omit this and use
            // `reloadObsidian` to open vaults during the test.
            vault: "test/vaults/simple",
        },
    })),

    framework: 'mocha',
    services: ["obsidian"],
    // You can use any wdio reporter, but by default they show the chromium version instead of the Obsidian version a
    // test is running on. obsidian-reporter is just a wrapper around spec-reporter that shows the Obsidian version.
    reporters: ['obsidian'],

    mochaOpts: {
        ui: 'bdd',
        timeout: 60000,
        // You can set more config here like "retry" to retry flaky tests
        // or "bail" to quit tests after the first failure.
    },

    waitforInterval: 250,
    waitforTimeout: 5 * 1000,

    cacheDir: cacheDir,

    logLevel: "warn",
}
