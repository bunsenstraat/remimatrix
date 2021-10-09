import { Selector } from 'testcafe';

fixture`DGIT tests`
    .page('https://remix.ethereum.org')
    .beforeEach( async t => {
        await t.click(Selector('Button').withText('Sure'))
        .click('.introjs-skipbutton')
    });

let hash = '';

test('stage files and export', async t => {
    await t
        .click('#verticalIconsKindpluginManager')
        .click('[data-id="pluginManagerComponentActivateButtondgit"]')
        .click('[data-id="verticalIconsKinddgit"]')
        .switchToIframe("#plugin-dgit").click('.navbutton')
        .click(Selector('[data-id="fileChangesREADME.txt"'))
        .switchToMainWindow()
        .click('[data-id="editorInput"').typeText('.ace_text-input','testing')
        .switchToIframe("#plugin-dgit")
        .click('[data-id="stageAll"]')
        .expect(Selector('[data-id="fileChangesREADME.txt"').exists).notOk()
        .expect(Selector('[data-id="fileStagedREADME.txt"').exists).ok()
        .typeText('[data-id="commitMessage"]', 'testing')
        .click('[data-id="commitButton"]')
        .click(Selector('.navbutton').withText('Log')).expect(Selector('div').withText('testing').exists).ok()
        .click(Selector('.navbutton').withText('IPFS Settings')).click('#btncheckipfs')
        .expect(Selector('#ipfschecksuccess').exists).ok()
        .click(Selector('.navbutton').withText('IPFS Export')).click('#addtocustomipfs')
        .expect(Selector('#ipfshashresult').exists).ok()

    hash = await Selector('#ipfshashresult').textContent;
})

test('import with hash', async t => {
    console.log('import ', hash)
    await t
        .click('#verticalIconsKindpluginManager')
        .click('[data-id="pluginManagerComponentActivateButtondgit"]')
        .click('[data-id="verticalIconsKinddgit"]')
        .switchToIframe("#plugin-dgit")
        .click(Selector('.navbutton').withText('IPFS Import'))
        //.typeText('.form-control', hash)
        //.click('#clone-btn')
})


test('github import', async t => {
    await t
        .click('#verticalIconsKindpluginManager')
        .click('[data-id="pluginManagerComponentActivateButtondgit"]')
        .click('[data-id="verticalIconsKinddgit"]')
        .switchToIframe("#plugin-dgit")
        .click(Selector('.navbutton').withText('GitHub'))
        .typeText(Selector('[name="cloneurl"]'), 'https://github.com/bunsenstraat/empty')
        .click('[data-id="clonebtn"]').click(Selector('.btn').withText('Yes'))
        .switchToMainWindow()
        .click('#remember')
        .click(Selector('span').withText('Accept'))
        .click('[data-id="verticalIconsKindfilePanel"')
        .click('[data-id="treeViewLitreeViewItem.git"]')
        .click('[data-id="treeViewLitreeViewItem.git/config"]')
        .expect(Selector('.ace_content').withText('url = https://github.com/bunsenstraat/empty').exists).ok()
})