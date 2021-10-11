import axios from "axios";
import * as sdk from "matrix-js-sdk";
import { MatrixEvent, Room, RoomMember } from "matrix-js-sdk";
import { Visibility } from "matrix-js-sdk/lib/@types/partials";
import { Alert, AlertProps } from "react-bootstrap";
import { Variant } from "react-bootstrap/esm/types";
import { BehaviorSubject } from "rxjs";
import { client } from "./App";
import { IncomingFile } from "./types/types";

export type Message = {
    content?: string,
    type?: Variant
}

export class MatrixRemix {
    matrixclient: sdk.MatrixClient
    accessToken: any = ""
    roomId = "";
    username: string = ""
    connected = new BehaviorSubject<boolean>(false);
    message = new BehaviorSubject<Message>({})
    incomingFile = new BehaviorSubject<IncomingFile>({})
    myRooms = new BehaviorSubject<Room[] | undefined>(undefined)

    constructor() {
        this.matrixclient = sdk.createClient("https://matrix.org");
    }

    async searchRooms(query: string) {
        console.log('search', query)
        this.message.next({ content: 'searching', type: 'info' })
        let searchrooms = await this.matrixclient.publicRooms({ filter: { generic_search_term: query } })
        console.log(searchrooms)
        this.message.next({ content: '', type: 'info' })
        return searchrooms
    }

    async setRoomId(id: string) {
        this.roomId = id
        this.incomingFile.next({})

    }

    async createroom(name: string, room_alias_name: string, topic: string, visibility: Visibility) {
        try {
            let room_id = await this.matrixclient.createRoom({
                visibility,
                name,
                room_alias_name,
                topic
            })
            await this.matrixclient.setGuestAccess(room_id.room_id, {
                allowJoin: true,
                allowRead: true
            })
            this.syncrooms()
        } catch (e) {
            this.message.next({
                content: e.message,
                type: 'warning'
            })
        }
    }

    async leaveroom() {
        this.message.next({ content: 'Leaving...', type: 'info' })
        await this.matrixclient.leave(this.roomId)

        this.syncrooms()
    }

    syncrooms() {
        let me = this
        this.message.next({ content: 'Waiting for rooms...', type: 'info' })
        this.matrixclient.once('sync', async function (state, prevState, res) {
            console.log(state); // state will be 'PREPARED' when the client is ready to use
            me.connected.next(true)
            let rooms = me.matrixclient.getRooms()
            me.myRooms.next(rooms)
            try {
                me.roomId = rooms[0].roomId
                console.log('found rooms', rooms)
                me.message.next({})
            } catch (e) {
                me.roomId = ''
                me.message.next({
                    content: 'no rooms found',
                    type: 'warning'
                })
            }
        });
    }

    async joinroom(id: string) {
        try {
            await this.matrixclient.joinRoom(id)
            this.syncrooms()
        } catch (e) {
            console.log(e.message)
            this.message.next({
                content: e.message,
                type: 'warning'
            })
        }
    }

    async startClient() {
        let me = this
        this.matrixclient.startClient({});
        this.syncrooms()
        this.matrixclient.on("Room.timeline", async function (event: MatrixEvent, room, toStartOfTimeline) {
            console.log(event)
            console.log(event.getRoomId(), me.roomId)
            // we know we only want to respond to messages
            if (event.getType() !== "m.room.message") {
                return;
            }
            //if (rooms.findIndex((r:Room) => r.roomId === event.getRoomId())>-1) {
            const member: RoomMember = event.sender
            const event_id: string = event.getId()

            if (member.userId !== me.username || true) {

                //console.log(event.event.content && event.event.content.body)
                //console.log(event.getType())
                if (event.event.content && me.accessToken) {
                    if (event.event.content.msgtype === 'm.file') {
                        let parsed: string | null = await me.matrixclient.mxcUrlToHttp(event.event.content.url)
                        console.log(parsed);
                        if (parsed) {
                            const data = await axios.get(parsed)
                            ///console.log(data.data)
                            if (!client.autoReceive) {
                                me.incomingFile.next({
                                    fileName: event.event.content.body,
                                    body: data.data,
                                    url: event.event.content.url,
                                    userId: member.userId,
                                    event_id: event_id,
                                    type: event.event.content.msgtype,
                                    timestamp: event.event.origin_server_ts || 0,
                                    roomId: event.getRoomId()
                                })
                            } else {
                                client.write(event.event.content.body, data.data)
                            }

                        }
                    }

                }
                //    client.write(event.event.content.filename, event.event.content.body)
            }
            if (event && event.event && event.event.content && event.event.content.msgtype === 'm.text') {


                me.incomingFile.next({
                    fileName: '',
                    body: '',
                    url: '',
                    userId: member.userId,
                    event_id: event_id,
                    type: event.event.content.msgtype,
                    timestamp: event.event.origin_server_ts || 0,
                    message: event.getContent().body,
                    roomId: event.getRoomId()
                })
            }
            if (event && event.event && event.event.content && event.event.content.membership === 'join') {


                me.incomingFile.next({
                    fileName: '',
                    body: '',
                    url: '',
                    userId: member.userId,
                    event_id: event_id,
                    type: "m.text",
                    timestamp: event.event.origin_server_ts || 0,
                    message: event.event.content.displayname + " joined",
                    roomId: event.getRoomId()
                })
            }
            //}
        });

    }

    async disconnect() {
        await this.matrixclient.stopClient()
        this.accessToken = null
        this.connected.next(false)
        this.roomId = ''
        this.myRooms.next([])
        this.message.next({ content: 'disconnected', type: 'info' })
    }

    async guestlogin(){
        this.matrixclient = sdk.createClient("https://matrix.org");
        const { user_id, device_id, access_token } = await this.matrixclient.registerGuest({});
        this.matrixclient = sdk.createClient({
           baseUrl: "https://matrix.org",
           accessToken: access_token,
           userId: user_id,
           deviceId: device_id,
        })
        this.matrixclient.setGuest(true);
        this.accessToken = access_token
        this.username = user_id
        console.log(access_token, user_id)
        //this.username = this.matrixclient.getUser(user_id).displayName
        await this.startClient()
    }

    async connect(username: string, password: string) {
        this.matrixclient = sdk.createClient("https://matrix.org");
        try {
            this.roomId = ''
            this.myRooms.next([])
            this.message.next({ content: 'connecting', type: 'info' })
            console.log('connecting')
            const response = await this.matrixclient.login("m.login.password", { "user": username, "password": password })
            console.log(response)
            this.accessToken = response
            console.log(this.accessToken)
            client.feedback.next(this.accessToken)
            this.username = username
            await this.startClient()
        } catch (e) {
            this.message.next({
                content: e.message,
                type: 'warning'
            })
        }
    }

    async connectToken(username: string, token: string) {
        this.matrixclient = sdk.createClient("https://matrix.org");
        try {
            this.roomId = ''
            this.myRooms.next([])
            this.message.next({ content: 'connecting', type: 'info' })
            console.log('connecting')
            const response = await this.matrixclient.loginWithToken(token)   //.login("m.login.token", { "user": username, "token": token })
            console.log(response)
            this.accessToken = response
            console.log(this.accessToken)
            client.feedback.next(this.accessToken)
            this.username = response.user_id
            await this.startClient()
        } catch (e) {
            console.log(e.message)
            this.message.next({
                content: e.message,
                type: 'warning'
            })
        }
    }

    async sendAlert(msg: Message){
        this.message.next(msg)
    }

    async sendmessage(body: string) {
        if (!this.accessToken) return
        const content: sdk.IContent = {
            "body": body,
            "msgtype": "m.text",
        }
        this.matrixclient.sendEvent(this.roomId, "m.room.message", content, "").then((res) => {
            // message sent successfully
        }).catch((err) => {
            console.log(err);
        });
    }

    async sendFile(path: string, body: string) {
        console.log(this.accessToken)
        if (!this.accessToken) return
        console.log('send file', path)
        const mcxUrl: string = await this.matrixclient.uploadContent(body, { name: path })
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