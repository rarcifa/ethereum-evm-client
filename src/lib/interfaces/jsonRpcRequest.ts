import { HttpMessages } from './httpEnums.js';

export interface JsonRpcRequestPayload {
  jsonrpc: string;
  method: string;
  params: [{}, string];
  id: number;
}

export type RpcParams = { to: string; data: string } | string;

export interface QueryParams {
  accountAddress?: string;
  contractAddress?: string;
}

export interface HealthCheck {
  uptime: number;
  responsetime: [number, number];
  message: HttpMessages;
  timestamp: number;
}
