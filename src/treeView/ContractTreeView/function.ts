
import * as vscode from "vscode";
import { Contract as ContractTreeItem } from "./ContractTreeDataProvider";
export const refreshContract = async (node: ContractTreeItem, contractTreeDataProvider: any): Promise<vscode.TreeView<ContractTreeItem>> => {
    return vscode.window.createTreeView("starkode.contracts", { treeDataProvider: contractTreeDataProvider, });
};
