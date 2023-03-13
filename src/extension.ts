import * as vscode from "vscode";
import {
  createOZAccount,
  deployAccount,
  selectNotDeployedAccount,
} from "./config/account";
import { updateSelectedNetwork } from "./config/network";

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand("starknet.helloWorld", () => {
      vscode.window.showInformationMessage("Hello World!");
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
    })
  );
}
