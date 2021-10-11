import { PluginClient } from "@remixproject/plugin";
import { customAction } from '@remixproject/plugin-api/lib/file-system/file-panel'
import { createClient } from "@remixproject/plugin-webview";
import { BehaviorSubject } from "rxjs";
import axios from "axios";
import WalletConnectQRCodeModal from "@walletconnect/qrcode-modal";
import WalletConnectProvider from "@walletconnect/web3-provider";

import WalletConnect from "@walletconnect/client";
import QRCodeModal from "@walletconnect/qrcode-modal";
import CeramicClient from '@ceramicnetwork/http-client'
import { ThreeIdConnect, EthereumAuthProvider } from '@3id/connect'
import { matrixClient } from "./App";
import { type } from "os";

const simpleContract = `pragma solidity >=0.4.22 <0.7.0;
/**
* @title Storage
* @dev Store & retreive value in a variable
*/
contract StorageTestUpdateConfiguration {
  uint256 number;
  /**
   * @dev Store value in variable
   * @param num value to store
   */
  function store(uint256 num) public {
      number = num;
  }
  /**
   * @dev Return value 
   * @return value of 'number'
   */
  function retreive() public view returns (uint256){
      return number;
  }
}
          
          `;

type File = {
  name: string,
  body: string
}

export class WorkSpacePlugin extends PluginClient {
  callBackEnabled: boolean = true;
  feedback = new BehaviorSubject<string>("");
  autoSend: boolean = false
  autoReceive: boolean = false
  files: File[] = []

  constructor() {
    super();
    console.log("CONSTRUCTOR");
    createClient(this);



    this.methods = ["qr", "dismiss", "sendfiletomatrix","senddirtomatrix"];
    this.onload()
      .then(async (x) => {
        //console.log("client loaded", JSON.stringify(this));
        await this.setCallBacks()



      })
      .catch(async (e) => {
        console.log("ERROR CONNECTING", e);
      });
  }

  async sendCurrentFile(){
    let path = await this.call("fileManager", "getCurrentFile")
    let body = await this.call("fileManager", "getFile", path)
    matrixClient.sendFile(path, body)
  }

  async sendFile(path: string) {
    //console.log("file send", path);
    try {
      let body = await this.call("fileManager", "getFile", path)
      let found = false
      for (let file of this.files) {
        if (file.name === path) {
          found = true
          if (file.body !== body) {
            console.log('sending & changing file')
            file.body = body
            matrixClient.sendFile(path, body)
          }
        }
      }
      if (!found) {
        console.log('sending & storing file')
        this.files.push({ name: path, body: body })
        matrixClient.sendFile(path, body)
      }
    } catch (e) {

    }
    //console.log(file)

  }



  async setCallBacks() {


    let cmd: customAction = {
      id: this.name,
      name: "sendfiletomatrix",
      type: ["file"],
      extension: [],
      label: "Send file to Matrix",
      path: [],
      pattern: [],
      //sticky: true
    }

    try {
      /* this.call('filePanel', 'registerContextMenuItem', {
        id: 'dgit',
        name: 'track',
        label: 'Track in dGit',
        type: ['file', 'folder'],
        extension: [],
        path: [],
        pattern: [],
        sticky: true
      }) */
    } catch (e) {

    }

    let cmd2: customAction = {
      id: this.name,
      name: "senddirtomatrix",
      label: "Send directory to Matrix",
      type: ["folder"],
      extension: [],
      path: [],
      pattern: []
    }
    try {
      await this.call("filePanel", "registerContextMenuItem", cmd)
      await this.call("filePanel", "registerContextMenuItem", cmd2)
    }catch(e){

    }

    console.log("set listeners");
    let me = this;
    this.on("fileManager", "currentFileChanged", async function (x) {
      if (me.autoSend) await me.sendFile(x)
    });

    this.on("fileManager", "fileSaved", async function (x: any) {
      if (me.autoSend) await me.sendFile(x)
    })

    this.on("fileManager", "fileAdded", async function (x) {
      //if (me.autoSync) await me.sendFile(x)
    });

    this.on("fileManager", "fileRemoved", function (x) {
      console.log("REMOVE", x);
      me.log(x);
    });

    this.on("fileManager", "fileRemoved", function (x) {
      console.log("REMOVE", x);
      me.log(x);
    });

    this.on(
      "solidity",
      "compilationFinished",
      function (target, source, version, data) {
        console.log("compile finished", target, source, version, data);
      }
    );



    this.on("walletconnect" as any, "displayUri", async function (x: string) {
      await me.qr(x);
    })

    this.on("walletconnect" as any, "accountsChanged", async function (x: string) {
      await me.dismiss()
    })
    this.on("filePanel", "setWorkspace", function (x) {
      me.files = []
    });


    /*     this.on("fileExplorers", "createWorkspace", function (x) {
      console.log("ws create", x);
      me.log(x);
    });

    this.on("fileExplorers", "setWorkspace", function (x) {
      console.log("ws set", x);
      me.log(x);
    });

    this.on("fileExplorers", "deleteWorkspace", function (x) {
      console.log("wS DELETE", x);
      me.log(x);
    });

    this.on("fileExplorers", "renameWorkspace", function (x) {
      console.log("wS rn", x);
      me.log(x);
    }); */
  }

  async customAction(o: customAction) {
    console.log("custom action called", o)
  }

  async sendfiletomatrix(o: customAction) {
    await this.sendFile(o.path[0])
  }

  async senddirtomatrix(o: customAction) {
    //await this.sendFile(o.path[0])
  }

  async qr(uri: string) {
    console.log("QR ", uri);
    WalletConnectQRCodeModal.open(uri, function () {
      console.log("qr modal done");
    });
  }

  async dismiss() {
    WalletConnectQRCodeModal.close();
  }

  async dapp(uri: string) {
    console.log("DAPP ", uri)
    await this.call("walletconnect" as any, "connect")


  }

  async connect() {
    // Create a connector
    const connector = new WalletConnect({
      bridge: "https://static.225.91.181.135.clients.your-server.de/", // Required
      qrcodeModal: QRCodeModal,
    });

    // Check if connection is already established
    if (!connector.connected) {
      // create new session
      connector.createSession().then(() => {
        console.log(connector);
      });
    }

    // Subscribe to connection events
    connector.on("connect", (error, payload) => {
      if (error) {
        throw error;
      }
      console.log("CONNECT", payload);
      // Get provided accounts and chainId
      const { accounts, chainId } = payload.params[0];
    });

    connector.on("session_update", (error, payload) => {
      if (error) {
        throw error;
      }
      console.log("SESSUPDATE", payload);
      // Get updated accounts and chainId
      const { accounts, chainId } = payload.params[0];
    });

    connector.on("disconnect", (error, payload) => {
      if (error) {
        throw error;
      }
      console.log("DISCONNEDT", payload);
      // Delete connector
    });
  }

  async wallet() {
    console.log("connect");
    const provider = new WalletConnectProvider({
      infuraId: "83d4d660ce3546299cbe048ed95b6fad",
      bridge: "https://static.225.91.181.135.clients.your-server.de/",
      qrcode: false,
    });

    provider.connector.on("display_uri", (err, payload) => {
      const uri = payload.params[0];
      console.log(uri);
      this.call("walletconnect" as any, "qr", uri);
    });

    // Subscribe to accounts change
    provider.on("accountsChanged", (accounts: string[]) => {
      console.log(accounts);
      this.call("walletconnect" as any, "dismiss");
      provider.disconnect();
    });

    // Subscribe to chainId change
    provider.on("chainChanged", (chainId: number) => {
      console.log(chainId);
    });

    // Subscribe to session disconnection
    provider.on("disconnect", (code: number, reason: string) => {
      console.log(code, reason);
    });

    await provider.enable();
  }

  async log(message: string) {
    //console.log(message)
    this.call('terminal' as any, 'log', { type: 'info', value: 'Name\r\nAniket' })
    this.call('terminal' as any, 'log', { type: 'html', value: '<div>test</div><ul><li>test</li></ul>' })
  }

  async changetoinjected() {
    this.call('udapp', 'setEnvironmentMode', 'injected')
  }

  async test(p: string) { }

  async activate() {
    this.call("manager", "activatePlugin", "remixd");
  }

  async writetoCeramic() {
    const API_URL = "http://135.181.91.225:7007/"
    const ceramic = new CeramicClient(API_URL)
    const eth = window as any
    const addresses = await eth.ethereum.enable()
    const threeIdConnect = new ThreeIdConnect()
    const authProvider = new EthereumAuthProvider(eth.ethereum, addresses[0])
    await threeIdConnect.connect(authProvider)
    const provider = await threeIdConnect.getDidProvider()
    await ceramic.setDIDProvider(provider)
    console.log(provider)

  }

  async deactivate() {
    this.call("manager", "deactivatePlugin", "111");
  }

  async getresult() {
    let r = await this.call("solidity", "getCompilationResult");
    console.log("RESULT", r);
  }

  async gitbranches() {
    //let r = await this.call("dGitProvider","branches")
    //console.log("branches", r)
  }
  async gitbranch(dir: string) {
    //let r = await this.call("dGitProvider","branch",dir)
  }

  async gitcurrentbranch() {
    //let r = await this.call("dGitProvider","currentbranch")
    // console.log(r)
  }

  async gitcheckout(dir: string) {
    //let r = await this.call("dGitProvider","checkout",dir)
  }

  async gitinit(dir: string) {
    // let s = await this.call("fileExplorers","getCurrentWorkspace")
    // let r = await this.call("dGitProvider","init")
  }

  async gitstatus(dir: string) {
    //  let r = await this.call("dGitProvider","status",'HEAD')
    // console.log("git status ", r)
  }

  async gitadd(dir: string) {
    // let r = await this.call("dGitProvider","add",dir)
    // console.log("git add ", r)
  }

  async gitremove(dir: string) {
    //  let r = await this.call("dGitProvider","rm",dir)
    //  console.log("git rm ", r)
  }

  async gitlog() {
    //  let r = await this.call("dGitProvider","log",'HEAD')
    // console.log("git log ", r)
  }

  async gitcommit() {
    //  let r = await this.call("dGitProvider","commit",{})
    //  console.log("git log ", r)
  }

  async gitlsfiles() {
    //  let r = await this.call("dGitProvider","lsfiles",'HEAD')
    // console.log("git log ", r)
  }

  async gitresolveref() {
    //  let r = await this.call("dGitProvider","resolveref",'HEAD')
    //  console.log("git resolve ", r)
  }

  async gitreadblob(file: string) {
    //  let c = await this.call("dGitProvider","log",'HEAD')
    //  console.log(c[c.length-1].oid)
    //  let r = await this.call("dGitProvider","readblob",{oid:c[c.length-1].oid, filepath:"README.txt"})
    //  console.log("git blob ", r)
  }

  async ipfspush() {
    console.log(await this.call("dGitProvider", "push"));
  }

  async pinatapush() {
    try {
      let r = await this.call("dGitProvider" as any, "pin", '124def6d9115e0c2c521', '130c1a8b18fd0c77f9ee8c1614146d277c3def661506dbf1c78618325cc53c8b');
      console.log(r)
    } catch (err) {
      console.log(err)
    }
  }

  async pinlist() {
    try {
      let r = await this.call("dGitProvider" as any, "pinList", '124def6d9115e0c2c521', '130c1a8b18fd0c77f9ee8c1614146d277c3def661506dbf1c78618325cc53c8b');
      console.log(r)
    } catch (err) {
      console.log(err)
    }
  }
  async ipfspull(cid: string) {
    try {
      await this.call("dGitProvider", "pull", cid);
    } catch (e) { }
  }

  async ipfsConfig() {
    /* try{
      let r = await this.call("dGitProvider", "setIpfsConfig", {
        host: 'localhost',
        port: 5002,
        protocol: 'http',
        ipfsurl: 'https://ipfsgw.komputing.org/ipfs/'
      });
      console.log(r)
      }catch(e){
        console.log(e)
      }  */
  }

  async read(dir: string) {
    let files = await this.call("fileManager", "readdir", dir);
    console.log(files.toString());
    console.log(files);
  }
  async write(path: string, content: string) {
    await this.call("fileManager", "setFile", path, content);
    await this.call("fileManager","open", path)
  }

  async getcurrentfile() {
    var files = await this.call("fileManager", "getCurrentFile");
    console.log(files);
  }

  async switchfile(dir: string) {
    var files = await this.call("fileManager", "switchFile", dir);
  }

  async zip() {
    // let r = await this.call("dGitProvider","zip")
  }

  async fetch(dir: string) {
    try {
      var files = await fetch(dir);
      console.log(files);
      console.log(files.toString());
    } catch (e) {
      console.error(e);
    }
  }

  async axios(dir: string) {
    try {
      var files = await axios.get(dir);
      console.log(files);
      console.log(files.toString());
    } catch (e) {
      console.error(e);
    }
  }

  async getcompilerconfig() {
    //let config = await this.call("solidity","getCompilerConfig")
    //console.log(config)
  }

  async getWorkSpace() {
    //  let s = await this.call("fileExplorers","getCurrentWorkspace")
    //  console.log(s)
  }

  async getWorkSpaces() {
    //  let s = await this.call("fileExplorers","getWorkspaces")
    //  console.log(s)
  }

  async createWorkSpace(name: string) {
    await this.call('filePanel' as any, 'createWorkspace', `workspace_${Date.now()}`, false)
    //await this.call("filePanel","setWorkspace", name)
  }

  async sendWorkSpace() {
    let hash:string = await this.call('dGitProvider' as any, 'export', {
      host: 'ipfs.remixproject.org',
      port: 443,
      protocol: 'https',
      ipfsurl: 'https://ipfs.remixproject.org/ipfs/'
    })
    console.log(hash)
    return hash
    //await this.call("filePanel","setWorkspace", name)
  }

  async importcontent(dir: string) {
    console.log("import content");
    var content = await this.call(
      "contentImport",
      "resolve",
      "ipfs://Qmd1gr9VeQaYNA8wVDq86RwdeMZkfF93JZhhWgfCVewYtc"
    );
    console.log("content", content);
  }
  async open(dir: string) {
    await this.call("fileManager", "open", dir);
  }

  async highlight(f: string) {
    this.call(
      "editor",
      "highlight",
      {
        start: {
          line: 0,
          column: 1,
        },
        end: {
          line: 1,
          column: 10,
        },
      },
      f,
      "#ffffff"
    );
  }

  async addAnnotation(f: string) {
    this.call("editor", "addAnnotation", {
      row: 1,
      column: 1,
      text: "annotation",
      type: "error",
    });
    this.call("editor", "addAnnotation", {
      row: 10,
      column: 2,
      text: "annotation",
      type: "info",
    });
    this.call("editor", "addAnnotation", {
      row: 12,
      column: 1,
      text: "annotation",
      type: "warning",
    });
  }

  async clearAnnotations(f: string) {
    this.call("editor", "clearAnnotations");
  }

  async activatePlugin(f: string) {
    await this.call('manager', 'activatePlugin', f)
    console.log(await this.call('manager', 'isActive', f))
  }

  async deActivatePlugin(f: string) {
    await this.call('manager', 'deactivatePlugin', f)
    console.log(await this.call('manager', 'isActive', f))
  }

  async getSettings() {
    let settings = await this.call("udapp", "getSettings");
    console.log(settings);
  }

  async setSettings() {
    let settings = await this.call("udapp", "setEnvironmentMode", "injected");
    await this.getSettings();
  }

  async debug(hash: string) {
    let settings = await this.call("remixdprovider" as any, "debug", hash);
  }

  async getAccounts() {
    let settings = await this.call("udapp", "getAccounts");
    console.log(settings);
    return settings;
  }

  async soltest() {
    const f = `pragma solidity >=0.4.0 <0.7.0;

    contract SimpleStorage {
        uint storedData;
        
        // a public function named set that returns a uint goes here
        function set(uint _p1) public returns (uint) {
            storedData = _p1;
        }
        
       function get() public view returns (uint) {
            return storedData;
        }
    }
    `;

    const t = `pragma solidity >=0.4.0 <0.7.0;
    import "remix_tests.sol"; // this import is automatically injected by Remix.
    import "./modifyVariable.sol";
    
    contract test3 {
    
        SimpleStorage storageToTest;
        function beforeAll () public {
           storageToTest = new SimpleStorage();
        }
    
        function checkSetFunction () public {
            storageToTest.set(12345);
            Assert.equal(storageToTest.get(), uint(12345), "the contract should contain the function set");
        }
    }
    `;

    console.log(f);
    console.log(t);

    await this.call("fileManager", "setFile", "/modifyVariable.sol", f);
    await this.call("fileManager", "switchFile", "/modifyVariable.sol");
    await this.call("fileManager", "setFile", "/modifyVariable_test.sol", t);
    const result = await this.call(
      "solidityUnitTesting",
      "testFromPath",
      "modifyVariable_test.sol"
    );
    return result.errors;
  }

  async disableCallBacks() {
    this.callBackEnabled = false;
  }
  async enableCallBacks() {
    this.callBackEnabled = true;
  }
}
