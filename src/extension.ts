import * as vscode from "vscode";
import * as fs from "fs";
import path from "path";
import {
  createOZAccount,
  deployAccount,
  selectDeployedAccount,
  selectNotDeployedAccount,
} from "./config/account";
import {
  declareContract,
  deployContract,
  executeContractFunction,
  getContractInfo,
  selectCompiledContract,
  setContract,
} from "./config/contract";
import { updateSelectedNetwork } from "./config/network";
import { logger } from "./lib";
import { ContractTreeDataProvider } from "./treeView/ContractTreeView/ContractTreeDataProvider";
import { editContractAddress, refreshContract } from "./treeView/ContractTreeView/function";

import { Contract as ContractTreeItem } from "./treeView/ContractTreeView/ContractTreeDataProvider";
import { AbiTreeDataProvider } from "./treeView/ABITreeView/AbiTreeDataProvider";


export function activate(context: vscode.ExtensionContext) {
  if (vscode.workspace.workspaceFolders === undefined) {
    logger.error("Error: Please open your solidity project to vscode");
    return;
  }
  const path_ = vscode.workspace.workspaceFolders[0].uri.fsPath;

  const watcher = vscode.workspace.createFileSystemWatcher(`${path_}/starkode/**`);

  watcher.onDidChange((event: vscode.Uri) => {
    const contractName: string | undefined = context.workspaceState.get("selectedContract");
    if (!contractName) {
      abiTreeView.message = "Select a contract and its ABI functions will appear here.";
    } else {
      abiTreeView.message = undefined;
      const contractInfo = getContractInfo(path_, contractName);
      abiTreeView.description = `${contractName.slice(0, -5)} @ ${contractInfo.address}`;
    }
    abiTreeDataProvider.refresh();
  });

  // Contract Tree View
  const contractTreeDataProvider = new ContractTreeDataProvider(
    vscode.workspace.workspaceFolders?.[0].uri.fsPath
  );

  let contractTreeView = vscode.window.createTreeView("starkode.contracts", {
    treeDataProvider: contractTreeDataProvider,
  });

  // ABI Tree View
  const abiTreeDataProvider = new AbiTreeDataProvider(
    context
  );

  const abiTreeView = vscode.window.createTreeView("starkode.abis", {
    treeDataProvider: abiTreeDataProvider,
  });

  context.subscriptions.push(
    vscode.commands.registerCommand("starkode.activate", () => {
      if (!fs.existsSync(path.join(path_, "starkode"))) {
        fs.mkdirSync(path.join(path_, "starkode"));
      }
      vscode.window.showInformationMessage("Starkode activated.");
    }),

    vscode.commands.registerCommand("starkode.refreshContracts", async (node: ContractTreeItem) => {
      contractTreeView = await refreshContract(node, contractTreeDataProvider);
    }),

    vscode.commands.registerCommand("starkode.useContract", async (node: ContractTreeItem) => {
      console.log(node);
      setContract(context, node.label);
      abiTreeView.message = undefined;
      const contractName: string | undefined = context.workspaceState.get("selectedContract");
      if (!contractName) {
        abiTreeView.message = "Select a contract and its ABI functions will appear here.";
      } else {
        abiTreeView.message = undefined;
        const contractInfo = getContractInfo(path_, contractName);
        abiTreeView.description = `${contractName.slice(0, -5)} @ ${contractInfo.address}`;
      }
      abiTreeDataProvider.refresh();
    }),

    vscode.commands.registerCommand("starkode.editContractAddress", async (node: ContractTreeItem) => {
      await editContractAddress(node, context);
    }),

    vscode.commands.registerCommand("starkode.deploycontract", async () => {
      await vscode.commands.executeCommand("starkode.declareContract");
    }),

    vscode.commands.registerCommand("starkode.selectnetwork", async () => {
      await updateSelectedNetwork(context);
    }),
    vscode.commands.registerCommand("starkode.createaccount", async () => {
      createOZAccount(context);
    }),
    vscode.commands.registerCommand("starkode.unDeployedAccount", async () => {
      selectNotDeployedAccount(context);
    }),
    vscode.commands.registerCommand("starkode.declareContract", async () => {
      await declareContract(context);
    }),
    vscode.commands.registerCommand("starkode.deployaccount", async () => {
      await deployAccount(context);
    }),
    vscode.commands.registerCommand("starkode.selectaccount", async () => {
      await selectDeployedAccount(context);
    }),
    vscode.commands.registerCommand("starkode.selectContract", async () => {
      selectCompiledContract(context);
    }),
    vscode.commands.registerCommand("starkode.deployContract", async () => {
      await deployContract(context);
    }),
    vscode.commands.registerCommand("starkode.callFunction", async () => {
      await executeContractFunction(context);
    })
  );
}
