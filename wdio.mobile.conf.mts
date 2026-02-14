import * as path from "path"
import { parseObsidianVersions } from "wdio-obsidian-service";
import { env } from "process";

// Use this wdio configuration to test Obsidian against the real Obsidian Android app.
// You'll need to set up Android Studio and Appium for this to work, see
// https://jesse-r-s-hines.github.io/wdio-obsidian-service/wdio-obsidian-service/README#android
// If your plugin "isDesktopOnly", or if you only want to use the desktop "emulateMobile"
// testing, just delete this file.

const cacheDir = path.resolve(".obsidian-cache");

// choose Obsidian versions to test
// note: beta versions aren't available for the Android app
let defaultVersions = "earliest/earliest latest/latest";
const versions = await parseObsidianVersions(
    env.OBSIDIAN_MOBILE_VERSIONS ?? env.OBSIDIAN_VERSIONS ?? defaultVersions,
    {cacheDir},
);
if (env.CI) {
    console.log("obsidian-cache-key:", JSON.stringify(versions));
}

export const config: WebdriverIO.Config = {
    runner: 'local',
    framework: 'mocha',

    specs: ['./test/specs/**/*.e2e.ts'],

    maxInstances: 1, // Parallel tests don't work under appium
    hostname: env.APPIUM_HOST || 'localhost',
    port: parseInt(env.APPIUM_PORT || "4723"),

    // (installerVersion isn't relevant for the mobile app)
    capabilities: versions.map<WebdriverIO.Capabilities>(([appVersion]) => ({
        browserName: "obsidian",
        browserVersion: appVersion,
        platformName: 'Android',
        'appium:automationName': 'UiAutomator2',
        'appium:avd': "obsidian_test",
        // set noReset to true for faster tests, wdio-obsidian-service will handle resetting Obsidian when needed
        'appium:noReset': true,
        'appium:adbExecTimeout': 60 * 1000,
        'wdio:obsidianOptions': {
            plugins: ["."],
            vault: "test/vaults/simple",
        },
    })),

    services: [
        "obsidian",
        ["appium", {
            args: { allowInsecure: "*:chromedriver_autodownload,*:adb_shell" },
        }],
    ],
    reporters: ["obsidian"],

    mochaOpts: {
        ui: 'bdd',
        timeout: 60 * 1000,
    },
    waitforInterval: 250,
    waitforTimeout: 5 * 1000,
    logLevel: "warn",

    cacheDir: cacheDir,

    injectGlobals: false, // import describe/expect etc explicitly to make eslint happy
}
