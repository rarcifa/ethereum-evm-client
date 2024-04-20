export interface JsonRpcResponse<T> {
  jsonrpc: string;
  id: number;
  result?: T;
  error?: JsonRpcError;
}

export interface JsonRpcError {
  code: number;
  message: string;
  data?: any;
}
