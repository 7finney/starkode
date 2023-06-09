import { Calldata } from "starknet";
import { QuickPickItem } from "vscode";

export interface INetworkQP extends QuickPickItem {
  label: string;
}

export interface TIsAccountDeployed {
  gAlpha: boolean;
  gAlpha2: boolean;
  mainnet: boolean;
}
export interface JSONAccountType {
  accountHash: string;
  constructorCallData: Calldata;
  accountPubKey: string;
  accountAddress: string;
  privateKey: string;
  isDeployed: TIsAccountDeployed;
}

export interface IAccountQP extends QuickPickItem {
  label: string;
}

export interface IContractQP extends QuickPickItem {
  label: string;
}

export interface IFunctionQP extends QuickPickItem {
  label: string;
}

interface inputType {
  name: string;
  type: string;
  value: string;
}
interface outputType {
  name: string;
  type: string;
}
export interface ABIFragment {
  inputs: Array<inputType>;
  name: string;
  stateMutability: string;
  type: string;
  outputs: Array<outputType>;
  state_mutability?: string;
}
