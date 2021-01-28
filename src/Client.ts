import { PluginClient } from "@remixproject/plugin";
import { createClient } from "@remixproject/plugin-webview";

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

  constructor() {
    super();
    createClient(this);
    this.onload().then(async () => {
      //console.log("workspace client loaded", this);
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
      //await this.setCallBacks();

      this.on("fileManager","fileRemoved",function(x){
        console.log("REMOVE")
      })


      this.on("fileManager","fileAdded",function(x){
        console.log("added")
      })
    });

  }

  async setCallBacks() {}

  async test(p: string) {}

  async read(dir:string){
    this.call("fileManager","readdir",dir).then((x)=>{
      console.log(x)
    })
  }
  async write(dir:string){
    this.call("fileManager","setFile",dir, simpleContract).then((x)=>{
      console.log(x)
    })
  }

  async disableCallBacks() {
    this.callBackEnabled = false;
  }
  async enableCallBacks() {
    this.callBackEnabled = true;
  }
}
