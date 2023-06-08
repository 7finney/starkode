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
  selectCompiledContract,
  setContract,
} from "./config/contract";
import { updateSelectedNetwork } from "./config/network";
import { logger } from "./lib";
import { ContractTreeDataProvider } from "./treeView/ContractTreeView/ContractTreeDataProvider";
import { refreshContract } from "./treeView/ContractTreeView/function";

import { Contract as ContractTreeItem } from "./treeView/ContractTreeView/ContractTreeDataProvider";


export function activate(context: vscode.ExtensionContext) {
  if (vscode.workspace.workspaceFolders === undefined) {
    logger.error("Error: Please open your solidity project to vscode");
    return;
  }
  const path_ = vscode.workspace.workspaceFolders[0].uri.fsPath;
  
  // Contract Tree View
  const contractTreeDataProvider = new ContractTreeDataProvider(
    vscode.workspace.workspaceFolders?.[0].uri.fsPath
  );

  let contractTreeView = vscode.window.createTreeView("starkode.contracts", {
    treeDataProvider: contractTreeDataProvider,
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
      setContract(context,node.label);
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
