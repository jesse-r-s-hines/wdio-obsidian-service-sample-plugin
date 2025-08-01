import * as path from "path"
import { parseObsidianVersions, obsidianBetaAvailable } from "wdio-obsidian-service";
import { env } from "process";

// wdio-obsidian-service will download Obsidian versions into this directory
const cacheDir = path.resolve(".obsidian-cache");

// choose Obsidian versions to test
let defaultVersions = "earliest/earliest latest/latest";
if (await obsidianBetaAvailable({cacheDir})) {
    defaultVersions += " latest-beta/latest"
}
const desktopVersions = await parseObsidianVersions(
    env.OBSIDIAN_VERSIONS ?? defaultVersions,
    {cacheDir},
);
const mobileVersions = await parseObsidianVersions(
    env.OBSIDIAN_MOBILE_VERSIONS ?? env.OBSIDIAN_VERSIONS ?? defaultVersions,
    {cacheDir},
);
if (env.CI) {
    // Print the resolved Obsidian versions to use as the workflow cache key
    // (see .github/workflows/test.yaml)
    console.log("obsidian-cache-key:", JSON.stringify([desktopVersions, mobileVersions]));
}

export const config: WebdriverIO.Config = {
    runner: 'local',
    framework: 'mocha',

    specs: ['./test/specs/**/*.e2e.ts'],

    // How many instances of Obsidian should be launched in parallel during testing.
    maxInstances: Number(env.WDIO_MAX_INSTANCES || 4),

    // "matrix" to test your plugin on multiple Obsidian versions and with emulateMobile
    capabilities: [
        ...desktopVersions.map<WebdriverIO.Capabilities>(([appVersion, installerVersion]) => ({
            browserName: 'obsidian',
            'wdio:obsidianOptions': {
                appVersion, installerVersion,
                plugins: ["."],
                // If you need to switch between multiple vaults, you can omit this and
                // use `reloadObsidian` to open vaults during the test.
                vault: "test/vaults/simple",
            },
        })),
        // Test your plugin on the emulated mobile UI. If your plugin "isDesktopOnly",
        // just remove this bit. If you want to test on the real mobile app instead of
        // emulating it on desktop, remove this and enable the android tests in
        // wdio.mobile.conf.mts instead.
        // See https://jesse-r-s-hines.github.io/wdio-obsidian-service/wdio-obsidian-service/README#mobile-emulation
        ...mobileVersions.map<WebdriverIO.Capabilities>(([appVersion, installerVersion]) => ({
            browserName: 'obsidian',
            'wdio:obsidianOptions': {
                appVersion, installerVersion,
                emulateMobile: true,
                plugins: ["."],
                vault: "test/vaults/simple",
            },
            'goog:chromeOptions': {
                mobileEmulation: {
                    // can also set deviceName: "iPad" etc. instead of hard-coding size.
                    // If you have issues getting click events etc. to work properly, try
                    // setting `touch: false` here.
                    deviceMetrics: {width: 390, height: 844},
                },
            },
        })),
    ],

    services: ["obsidian"],
    // You can use any wdio reporter, but they show the Chromium version instead of the
    // Obsidian version a test is running on. obsidian-reporter is just a wrapper around
    // spec-reporter that shows the Obsidian version.
    reporters: ['obsidian'],

    mochaOpts: {
        ui: 'bdd',
        timeout: 60 * 1000,
        // You can set more config here like "retry" to retry flaky tests or "bail" to
        // quit tests after the first failure.
    },
    waitforInterval: 250,
    waitforTimeout: 5 * 1000,
    logLevel: "warn",

    cacheDir: cacheDir,
}
