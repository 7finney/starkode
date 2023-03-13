import { Calldata } from "starknet";
import { QuickPickItem } from "vscode";

export interface INetworkQP extends QuickPickItem {
  label: string;
}
export interface JSONAccountType {
  accountHash: string;
  constructorCallData: Calldata;
  accountPubKey: string;
  accountAddress: string;
  privateKey: string;
  isDeployed: boolean;
}

export interface IAccountQP extends QuickPickItem {
  label: string;
}


