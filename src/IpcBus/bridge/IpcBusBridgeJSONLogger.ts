import * as path from 'path';
import * as fs from 'fs';

import * as winston from 'winston';

import { IpcPacketBuffer } from 'socket-serializer';

import * as Client from '../IpcBusClient';
import * as Broker from '../broker/IpcBusBroker';

import { IpcBusCommand } from '../IpcBusCommand';

import { IpcBusBridgeLogger } from './IpcBusBridgeLogger';

// This class ensures the transfer of data between Broker and Renderer/s using ipcMain
/** @internal */
export class IpcBusBridgeJSONLogger extends IpcBusBridgeLogger {
    private _logger: winston.LoggerInstance;

    constructor(logPath: string, processType:  Client.IpcBusProcessType, options: Broker.IpcBusBroker.CreateOptions) {
        super(processType, options);

        !fs.existsSync(logPath) && fs.mkdirSync(logPath);

        this._logger = new (winston.Logger)({
            transports: [
                new (winston.transports.File)({
                    filename: path.join(logPath, 'electron-common-ipcbus-bridge.log')
                })
            ]
        });
    }

    protected addLog(webContents: Electron.WebContents, peer: Client.IpcBusPeer, ipcPacketBuffer: IpcPacketBuffer, ipcBusCommand: IpcBusCommand, args: any[]): any {
        let log: any = { command: ipcBusCommand };
        if (args) {
            for (let i = 0, l = args.length; i < l; ++i) {
                log[`arg${i}`] = args[i];
            }
        }
        log.webContents = { id: webContents.id, url: webContents.getURL(), isLoadingMainFrame: webContents.isLoadingMainFrame() };
        try {
            log.webContents.rid = (webContents as any).getProcessId();
        }
        catch (err) {
        }
        try {
            log.webContents.pid = webContents.getOSProcessId();
        }
        catch (err) {
        }
        this._logger.info(ipcBusCommand.kind, log);
    }
}

