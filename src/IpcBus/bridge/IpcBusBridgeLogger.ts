import { IpcPacketBuffer } from 'socket-serializer';


import * as Client from '../IpcBusClient';
import * as Broker from '../broker/IpcBusBroker';


import { IpcBusCommand } from '../IpcBusCommand';
import { IpcBusBridgeImpl } from './IpcBusBridgeImpl';

// This class ensures the transfer of data between Broker and Renderer/s using ipcMain
/** @internal */
export abstract class IpcBusBridgeLogger extends IpcBusBridgeImpl {
    constructor(processType:  Client.IpcBusProcessType, options: Broker.IpcBusBroker.CreateOptions) {
        super(processType, options);
    }

    protected abstract addLog(webContents: Electron.WebContents, peer: Client.IpcBusPeer, ipcPacketBuffer: IpcPacketBuffer, ipcBusCommand: IpcBusCommand, args: any[]): void;

    protected _onEventReceived(ipcBusCommand: IpcBusCommand, ipcPacketBuffer: IpcPacketBuffer) {
        switch (ipcBusCommand.kind) {
            case IpcBusCommand.Kind.SendMessage:
            case IpcBusCommand.Kind.RequestMessage: {
                let args = ipcPacketBuffer.parseArrayAt(1);
                this._subscriptions.forEachChannel(ipcBusCommand.channel, (connData, channel) => {
                    const webContents = connData.conn;
                    connData.peerIds.forEach((peerId) => {
                        let peer = this._ipcBusPeers.get(peerId.peerId);
                        this.addLog(webContents, peer, ipcPacketBuffer, ipcBusCommand, args);
                    });
                });
                break;
            }
            case IpcBusCommand.Kind.RequestResponse: {
                const webContents = this._requestChannels.get(ipcBusCommand.request.replyChannel);
                if (webContents) {
                    let args = ipcPacketBuffer.parseArrayAt(1);
                    let peerId = this.extractPeerIdFromReplyChannel(ipcBusCommand.request.replyChannel);
                    let peer = this._ipcBusPeers.get(peerId);
                    this.addLog(webContents, peer, ipcPacketBuffer, ipcBusCommand, args);
                }
                break;
            }
        }
        super._onEventReceived(ipcBusCommand, ipcPacketBuffer);
    }

    protected _onRendererMessage(event: any, ipcBusCommand: IpcBusCommand, buffer: Buffer) {
        this._packetIn.decodeFromBuffer(buffer);
        let args = this._packetIn.parseArrayAt(1);
        this.addLog(event.sender, ipcBusCommand.peer, this._packetIn, ipcBusCommand, args);
        // IpcBusUtils.Logger.enable && IpcBusUtils.Logger.info(log);

        super._onRendererMessage(event, ipcBusCommand, buffer);
    }
}

