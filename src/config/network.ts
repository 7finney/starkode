import * as vscode from "vscode";
import { logger } from "../lib";
import { INetworkQP } from "../types";
import { Provider } from "starknet";

const NETWORKS = ["goerli-alpha", "goerli-alpha-2", "mainnet-alpha"];

export const updateSelectedNetwork = async (
  context: vscode.ExtensionContext
) => {
  const quickPick = vscode.window.createQuickPick<INetworkQP>();

  quickPick.items = NETWORKS.map((name: string) => ({
    label: name,
  }));
  quickPick.onDidChangeActive(() => {
    quickPick.placeholder = "Select network";
  });
  quickPick.onDidChangeSelection((selection: any) => {
    if (selection[0] != null) {
      const { label } = selection[0];
      void context.workspaceState.update("selectedNetwork", label);
      quickPick.dispose();

      logger.success(`Selected network is ${label}`);
    }
  });
  quickPick.onDidHide(() => {
    quickPick.dispose();
  });
  quickPick.show();
};

export const getNetworkProvider = (
  context: vscode.ExtensionContext
): Provider | undefined => {
  const selectedNetwork: any = context.workspaceState.get("selectedNetwork");
  if (selectedNetwork === undefined) {
    logger.log("No network selected.");
    return;
  }
  const provider = new Provider({
    sequencer: { network: selectedNetwork },
  });
  return provider;
};
