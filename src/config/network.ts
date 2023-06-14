import * as vscode from "vscode";
import { logger } from "../lib";
import { INetworkQP } from "../types";
import { Provider, SequencerProviderOptions } from "starknet";
import { Account } from "../treeView/AccountTreeView/AccountTreeDataProvider";

export const NETWORKS = ["goerli-alpha", "goerli-alpha-2", "mainnet-alpha"];

export const updateSelectedNetwork = async (
  context: vscode.ExtensionContext,
  accountTreeView: vscode.TreeView<Account>,
  accountTreeDataProvider: any
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
      const selectedNetwork: any = context.workspaceState.get("selectedNetwork");
      const selectedAccount = context.workspaceState.get("account") as string;
      accountTreeView.message = `Network : ${selectedNetwork} | Account : ${selectedAccount.slice(0, 5) + "..." + selectedAccount.slice(-5)}`;
      accountTreeDataProvider.refresh();
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
  let networkBaseUrl: string | undefined = undefined;

  switch (selectedNetwork) {
    case NETWORKS[0]: {
      networkBaseUrl = "https://alpha4.starknet.io";
      break;
    }
    case NETWORKS[1]: {
      networkBaseUrl = "https://alpha4-2.starknet.io";
      break;
    }
    case NETWORKS[2]: {
      networkBaseUrl = "https://alpha-mainnet.starknet.io";
      break;
    }
    default: {
      break;
    }
  }
  if (networkBaseUrl === undefined) {
    logger.log("No network selected.");
    return;
  }

  const provider = new Provider({
    sequencer: { baseUrl: networkBaseUrl },
  });
  return provider;
};
