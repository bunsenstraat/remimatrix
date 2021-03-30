import { PluginClient } from "@remixproject/plugin";
import { createClient } from "@remixproject/plugin-webview";
import { BehaviorSubject } from "rxjs";
import axios from 'axios';

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

export class WorkSpacePlugin extends PluginClient {
  callBackEnabled: boolean = true;
  feedback = new BehaviorSubject<string>("");

  constructor() {
    super();
    console.log("CONSTRUCTOR")
    createClient(this);
    this.onload().then(async (x) => {
      console.log("client loaded", JSON.stringify(this));
      try{
        await this.call("solidityUnitTesting","testFromSource","")
      }catch(e){
        console.log("not available")
      }
      /*
      let acc = await this.call("udapp","getSettings")
      console.log(acc)
      let ac2 = await this.call("udapp","getAccounts")
      console.log(ac2)
      const privateKey = "71975fbf7fe448e004ac7ae54cad0a383c3906055a75468714156a07385e96ce"
      const balance = "0x56BC75E2D63100000"
      let na = await this.call("udapp","createVMAccount",{ privateKey, balance })
      console.log(na)

      this.on('udapp', 'newTransaction', (tx: any) => {
        // Do something
        console.log("new transaction", tx)
      })
  
      this.on("solidity","compilationFinished",function(x){
        console.log("comp fin",x)
      })
      */
      await this.setCallBacks();
    }).catch(async (e)=>{
      console.log("ERROR CONNECTING",e)
    });
  }

  async setCallBacks() {
    console.log("set listeners")
    let me = this;
    this.on("fileManager", "currentFileChanged", function (x) {
      console.log("file changed", x);
      me.log(x);
    });

    this.on("fileManager", "fileRemoved", function (x) {
      console.log("REMOVE", x);
      me.log(x);
    });

    this.on("solidity", "compilationFinished", function (target, source, version, data) {
      console.log("compile finished", target, source, version,  data);
    });

    this.on("fileManager", "fileAdded", function (x) {
      console.log("added file", x);
      me.log(x);
    });

    this.on("fileExplorers", "createWorkspace", function (x) {
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
    });
  }

  async log(message: string) {
    //console.log(message)
  }

  async test(p: string) {}

  async activate(){
    this.call("manager","activatePlugin","remixd")
  }

  async deactivate(){
    this.call("manager","deactivatePlugin","111")
  }

  async getresult(){
    let r = await this.call("solidity","getCompilationResult")
    console.log("RESULT", r)
  }

  async gitbranches(){
    let r = await this.call("dGitProvider","branches")
    console.log("branches", r)
  }
  async gitbranch(dir:string){
    let r = await this.call("dGitProvider","branch",dir)
  }

  async gitcurrentbranch(){
    let r = await this.call("dGitProvider","currentbranch")
    console.log(r)
  }

  async gitcheckout(dir:string){
    let r = await this.call("dGitProvider","checkout",dir)
  }

  async gitinit(dir:string){
    let s = await this.call("fileExplorers","getCurrentWorkspace")
    let r = await this.call("dGitProvider","init")
  }

  async gitstatus(dir:string){
    let r = await this.call("dGitProvider","status",'HEAD')
    console.log("git status ", r)
  }

  async gitadd(dir:string){
    let r = await this.call("dGitProvider","add",dir)
    console.log("git add ", r)
  }

  async gitremove(dir:string){
    let r = await this.call("dGitProvider","rm",dir)
    console.log("git rm ", r)
  }

  async gitlog(){
    let r = await this.call("dGitProvider","log",'HEAD')
    console.log("git log ", r)
  }

  async gitcommit(){
    let r = await this.call("dGitProvider","commit",{})
    console.log("git log ", r)
  }

  async gitlsfiles(){
    let r = await this.call("dGitProvider","lsfiles",'HEAD')
    console.log("git log ", r)
  }

  async gitresolveref(){
    let r = await this.call("dGitProvider","resolveref",'HEAD')
    console.log("git resolve ", r)
  }

  async gitreadblob(file:string){
    let c = await this.call("dGitProvider","log",'HEAD')
    console.log(c[c.length-1].oid)
    let r = await this.call("dGitProvider","readblob",{oid:c[c.length-1].oid, filepath:"README.txt"})
    console.log("git blob ", r)
  }

  async ipfspush()
  {
    await this.call("dGitProvider", "push");
  }

  async ipfspull(cid:string){
    try{
    await this.call("dGitProvider", "pull", cid);
    }catch(e){

    }
  }

  async ipfsConfig(){
    try{
      let r = await this.call("dGitProvider", "setIpfsConfig", {
        host: 'localhost',
        port: 5002,
        protocol: 'http',
        ipfsurl: 'https://ipfsgw.komputing.org/ipfs/'
      });
      console.log(r)
      }catch(e){
        console.log(e)
      } 
  }

  async read(dir: string) {
    let files = await this.call("fileManager", "readdir", dir);
    console.log(files.toString());
    console.log(files);
  }
  async write(dir: string) {
    this.call("fileManager", "setFile", dir, simpleContract);
  }

  async getcurrentfile() {
    var files = await this.call("fileManager", "getCurrentFile");
    console.log(files);
  }

  async switchfile(dir: string) {
    var files = await this.call("fileManager", "switchFile", dir);
  }

  async zip(){
    let r = await this.call("dGitProvider","zip")
  }

  async fetch(dir: string) {
    try {
      var files = await fetch(dir);
      console.log(files)
      console.log(files.toString());
    } catch (e) {
      console.error(e);
    }
  }

  async axios(dir:string){
    try {
      var files = await axios.get(dir);
      console.log(files)
      console.log(files.toString());
    } catch (e) {
      console.error(e);
    }
  }

  async getcompilerconfig(){
    //let config = await this.call("solidity","getCompilerConfig")
    //console.log(config)
  }


  async getWorkSpace(){
    let s = await this.call("fileExplorers","getCurrentWorkspace")
    console.log(s)
  }

  async getWorkSpaces(){
    let s = await this.call("fileExplorers","getWorkspaces")
    console.log(s)
  }

  async createWorkSpace(name: string){
    let s = await this.call("fileExplorers","createWorkspace", name)
    //await this.call("fileExplorers","setWorkspace", name)
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

  async getSettings() {
    let settings = await this.call("udapp", "getSettings");
    console.log(settings);
  }

  async setSettings() {
    let settings = await this.call("udapp", "setEnvironmentMode", "injected");
    await this.getSettings();
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
