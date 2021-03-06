import * as IpcBusUtils from './IpcBus/IpcBusUtils';

export * from './IpcBus/IpcBusClient';
export * from './IpcBus/IpcBusClient-factory';
export * from './IpcBus/broker/IpcBusBroker';
export * from './IpcBus/broker/IpcBusBroker-factory';
export * from './IpcBus/bridge/IpcBusBridge';
export * from './IpcBus/bridge/IpcBusBridge-factory';
export * from './IpcBus/service/IpcBusService';
export * from './IpcBus/service/IpcBusService-factory';

export function ActivateIpcBusTrace(enable: boolean): void {
    IpcBusUtils.Logger.enable = enable;
}

export function ActivateServiceTrace(enable: boolean): void {
    IpcBusUtils.Logger.service = enable;
}
