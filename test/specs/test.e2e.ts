import { browser } from '@wdio/globals'
import { obsidianPage } from 'wdio-obsidian-service';

describe('Test my plugin', function() {
    it('test command open-sample-modal-simple', async function() {
        await browser.executeObsidianCommand("sample-plugin:open-sample-modal-simple");

        const modalEl = browser.$(".modal-container .modal-content");
        await expect(modalEl).toExist();
        await expect(modalEl).toHaveText("Woah!");
    })

    it('test status bar element', async function() {
        await expect(browser.$(".status-bar").$("div=Status Bar Text")).toExist();
    })

    it('use workspace layout', async function() {
        // loadWorkspaceLayout lets load a specific workspace layout with whatever files and panels
        // open that you need. You can create these layouts with the core "Workspaces" plugin.
        await obsidianPage.loadWorkspaceLayout("saved-layout");

        // there are helper functions for common tasks, see the API docs for a complete list:
        // https://jesse-r-s-hines.github.io/wdio-obsidian-service/wdio-obsidian-service.html

        // You'll use executeObsidian a lot. It's a wrapper around WDIO's browser.execute that
        // passes in Obsidian variables such as app and the obsidian api.
        const activeFile = await browser.executeObsidian(({app, obsidian}) => {
            // Note, because WDIO's browser.execute serializes the function to send to Obsidian
            // captured variables won't work in browser.executeObsidian. Instead, pass them as
            // arguments to executeObsidian. And, use the passed `obsidian` argument rather than
            // importing `obsidian` at the top level.
            const leaf = app.workspace.getActiveViewOfType(obsidian.MarkdownView)?.leaf;
            if (leaf?.view instanceof obsidian.FileView) {
                return leaf.view.file?.path;
            }
        })

        expect(activeFile).toEqual("Welcome.md");
    })

    it("create a file", async function() {
        await browser.executeObsidian(async ({app}) => {
            await app.vault.create("File1.md", "New Content");
        })
    })

    it("use reload obsidian", async function() {
        // By default the vault specified in wdio.conf.mts is opened, but you can explicitly open
        // vaults using reloadObsidian. This will relaunch Obsidian with a fresh copy of the vault.
        // Avoid calling this too often though or you'll tests will get really slow.
        await browser.reloadObsidian({vault: "test/vaults/simple"});

        await browser.executeObsidian(async ({app}) => {
            await app.vault.create("File2.md", "New Content");
        })

        const fileList = await browser.executeObsidian(async ({app}) => {
            return await app.vault.getMarkdownFiles().map(f => f.path).sort();
        })
        
        // Since we used reloadObsidian, "File1.md" won't exist anymore
        expect(fileList).toEqual(["File2.md", "Welcome.md"]);
    })

    it("use resetVault", async function() {
        // resetVault is a faster alternative reloadObsidian. It resets vault files to their
        // original state in place without rebooting Obsidian. It only resets vault files,
        // not Obsidian configuration etc, but in many cases that's all you need. You'll often
        // want to put this in a beforeEach
        await obsidianPage.resetVault("test/vaults/simple");

        const fileList = await browser.executeObsidian(async ({app}) => {
            return await app.vault.getMarkdownFiles().map(f => f.path).sort();
        })
        expect(fileList).toEqual(["Welcome.md"]);
    })
})
