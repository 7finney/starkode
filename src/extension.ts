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
} from "./config/contract";
import { updateSelectedNetwork } from "./config/network";
import { logger } from "./lib";

export function activate(context: vscode.ExtensionContext) {
  if (vscode.workspace.workspaceFolders === undefined) {
    logger.error("Error: Please open your solidity project to vscode");
    return;
  }
  const path_ = vscode.workspace.workspaceFolders[0].uri.fsPath;
  context.subscriptions.push(
    vscode.commands.registerCommand("starknet.activate", () => {
      if (!fs.existsSync(path.join(path_, "starkex"))) {
        fs.mkdirSync(path.join(path_, "starkex"));
      }
      vscode.window.showInformationMessage("StarkEx activated.");
    }),
    vscode.commands.registerCommand("starknet.selectnetwork", async () => {
      await updateSelectedNetwork(context);
    }),
    vscode.commands.registerCommand("starknet.createaccount", async () => {
      createOZAccount(context);
    }),
    vscode.commands.registerCommand("starknet.unDeployedAccount", async () => {
      selectNotDeployedAccount(context);
    }),
    vscode.commands.registerCommand("starknet.deployaccount", async () => {
      await deployAccount(context);
    }),
    vscode.commands.registerCommand("starknet.selectaccount", async () => {
      await selectDeployedAccount(context);
    }),
    vscode.commands.registerCommand("starknet.selectContract", async () => {
      selectCompiledContract(context);
    }),
    vscode.commands.registerCommand("starknet.declareContract", async () => {
      await declareContract(context);
    }),
    vscode.commands.registerCommand("starknet.deployContract", async () => {
      await deployContract(context);
    }),
    vscode.commands.registerCommand("starknet.callFunction", async () => {
      await executeContractFunction(context);
    })
  );
}
