import * as path from 'path';
import * as fs from 'fs';

const csvWriter = require('csv-write-stream');

import { IpcPacketBuffer } from 'socket-serializer';


import * as Client from '../IpcBusClient';
import * as Broker from '../broker/IpcBusBroker';

import { IpcBusCommand } from '../IpcBusCommand';
import { JSON_stringify } from '../IpcBusUtils';

import { IpcBusBridgeLogger } from './IpcBusBridgeLogger';

// This class ensures the transfer of data between Broker and Renderer/s using ipcMain
/** @internal */
export class IpcBusBridgeCSVLogger extends IpcBusBridgeLogger {
    private _logger: any;
    private _line: number;

    constructor(logPath: string, processType: Client.IpcBusProcessType, options: Broker.IpcBusBroker.CreateOptions) {
        super(processType, options);

        this._line = 0;

        !fs.existsSync(logPath) && fs.mkdirSync(logPath);

        this._logger = csvWriter({ separator: ';', headers: [
            '#',
            'kind',
            'size',
            'peer id',
            'peer process',
            'webContent',
            'from peer id',
            'arg0', 'arg1',
            'arg2',
            'arg3',
            'arg4',
            'arg5'
        ]});
        this._logger.pipe(fs.createWriteStream(path.join(logPath, 'electron-common-ipcbus-bridge.csv')));
    }

    protected addLog(webContents: Electron.WebContents, peer: Client.IpcBusPeer, ipcPacketBuffer: IpcPacketBuffer, ipcBusCommand: IpcBusCommand, args: any[]): any {
        ++this._line;
        let log: string[] = [
            this._line.toString(),
            ipcBusCommand.kind,
            ipcPacketBuffer.packetSize.toString(),
            peer.id, JSON.stringify(peer.process),
            `${webContents.getTitle()}\n${webContents.getURL()}`
        ];
        if (peer.id !== ipcBusCommand.peer.id) {
            log.push(ipcBusCommand.peer.id);
        }
        else {
            log.push('');
        }
        if (args) {
            for (let i = 0, l = args.length; i < l; ++i) {
                log.push(JSON_stringify(args[i], 255));
            }
        }
        this._logger.write(log);
    }
}

