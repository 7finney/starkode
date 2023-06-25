
import * as vscode from "vscode";
import { Contract as ContractTreeItem } from "./ContractTreeDataProvider";
import { logger } from "../../lib";
import path = require("path");
export const refreshContract = async (node: ContractTreeItem, contractTreeDataProvider: any): Promise<vscode.TreeView<ContractTreeItem>> => {
    return vscode.window.createTreeView("starkode.contracts", { treeDataProvider: contractTreeDataProvider, });
};

export const editContractAddress = async (input : any,context: vscode.ExtensionContext) => {
    if (vscode.workspace.workspaceFolders === undefined) {
        logger.error("Error: Open or Create a cairo project.");
        return;
    }
    const path_ = vscode.workspace.workspaceFolders[0].uri.fsPath;
    const filePath = path.join(path_, "starkode", input.label, `${input.label}_address.json`);
    const document = await vscode.workspace.openTextDocument(filePath);
    const editor = await vscode.window.showTextDocument(document);
};

