import axios from "axios";
import * as sdk from "matrix-js-sdk";
import { MatrixEvent, RoomMember } from "matrix-js-sdk";
import { BehaviorSubject } from "rxjs";
import { client } from "./App";
import { IncomingFile } from "./types/types";

export class MatrixRemix {
    matrixclient: sdk.MatrixClient
    accessToken: any = ""
    roomId = "!FaLewgrNoxRxrSPmWM:matrix.org";
    username: string = ""
    connected = new BehaviorSubject<boolean>(false);
    message = new BehaviorSubject<string>("")
    incomingFile = new BehaviorSubject<IncomingFile>({})

    constructor() {
        this.matrixclient = sdk.createClient("https://matrix.org");
        
        
    }

    async startClient(){
        let me = this
        this.matrixclient.startClient({});
        this.matrixclient.once('sync', function(state, prevState, res) {
            console.log(state); // state will be 'PREPARED' when the client is ready to use
            me.connected.next(true)
        });
        this.matrixclient.on("Room.timeline", async function(event: MatrixEvent, room, toStartOfTimeline) {
            //console.log(event)
            // we know we only want to respond to messages
            if (event.getType() !== "m.room.message") {
                return;
            }
        
            // we are only intested in messages from the test room, which start with "!"
            if (event.getRoomId() === me.roomId) {
                const member:RoomMember = event.sender
                
                if(member.userId !== me.username) {
                    console.log(event)
                    //console.log(event.event.content && event.event.content.body)
                    //console.log(event.getType())
                    if(event.event.content && me.accessToken){
                        if(event.event.content.msgtype === 'm.file'){
                            let parsed: string | null = await me.matrixclient.mxcUrlToHttp(event.event.content.url)
                            console.log(parsed);
                            if(parsed) { 
                                const data = await axios.get(parsed) 
                                ///console.log(data.data)
                                if(!client.autoReceive){
                                    me.incomingFile.next({
                                        fileName: event.event.content.body,
                                        body: data.data,
                                        url: event.event.content.url
                                    })
                                }else{
                                    client.write(event.event.content.body, data.data)
                                }
                                
                            }
                        }
                    }
                    //    client.write(event.event.content.filename, event.event.content.body)
                }
            }
        });
    }

    async disconnect(){
        await this.matrixclient.stopClient()
        this.accessToken = null
        this.connected.next(false)
    }

    async connect(username: string, password: string) {
        console.log('connecting')
        const response = await this.matrixclient.login("m.login.password", { "user": username, "password": password })
        console.log(response)
        this.accessToken = response
        console.log(this.accessToken)
        client.feedback.next(this.accessToken)
        this.username = username
        await this.startClient()
    }

    async sendFile(path: string, body: string){
        console.log(this.accessToken)
        if(!this.accessToken) return
        console.log('send file', path)
        const content:sdk.IContent = {
            "body": body,
            "filename": path,
            "msgtype": "m.file",
        }
        const mcxUrl:string = await this.matrixclient.uploadContent(body, {name: path})
        console.log(mcxUrl)

        const fileObject = {
            "body": path,
            "filename": path,
            "msgtype": "m.file",
            "url": mcxUrl
        }
        
        this.matrixclient.sendEvent(this.roomId, "m.room.message", fileObject, "").then((res) => {
            // message sent successfully
        }).catch((err) => {
            console.log(err);
        });
    }   
}