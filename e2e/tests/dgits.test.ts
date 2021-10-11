import { Selector, RequestLogger } from 'testcafe';
import { Profile, LocationProfile, ExternalProfile } from '@remixproject/plugin-utils'

const logger = RequestLogger();

fixture`DGIT production tests`
    .page(process.env.TEST_URL)
    .beforeEach( async t => {

        // exists doesn't wait with timeouts, this is a hack but it works, it will wait for buttons to appear  
        // https://testcafe.io/documentation/402829/guides/basic-guides/select-page-elements#selector-timeout      
        await Selector('Button',{timeout:120000}).innerText
        if(await Selector('Button').withText('Sure').exists){
            await t.click(Selector('Button').withText('Sure'))
        }
        await t.click('.introjs-skipbutton')

        await installPlugin(t, {
            name: 'matrixtest',
            displayName: 'matrix',
            location: 'sidePanel',
            url: 'http://localhost:3000',
            canActivate: [
                'dGitProvider'
            ]
        })
    });

let hash = '';
let randomInput: string = Math.random().toString()

const openPlugin = async(t: TestController, plugin: string) => {
    await t.click(`#icon-panel div[plugin="${plugin}"]`)
}

const installPlugin = async(t: TestController, profile: Profile & LocationProfile & ExternalProfile) =>{
    await t.click('*[plugin="pluginManager"]')
    .click(`*[data-id="pluginManagerComponentPluginSearchButton`)
    //cy.get(`*[data-id="pluginManagerLocalPluginModalDialogModalDialogModalTitle-react`).should('be.visible')
    .typeText(`*[data-id="localPluginName`, profile.name)
    .typeText(`*[data-id="localPluginDisplayName`, profile.displayName)
    .typeText(`*[data-id="localPluginUrl`, profile.url)
    .typeText(`*[data-id="localPluginCanActivate`, profile.canActivate && profile.canActivate.join(','))
    .click(`*[data-id="pluginManagerLocalPluginModalDialog-modal-footer-ok-react"`).click('*[plugin="pluginManager"]')
}

