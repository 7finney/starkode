import vscode, { TreeDataProvider, TreeItem, TreeItemCollapsibleState, EventEmitter, Event } from 'vscode';
import { Abi } from './AbiTreeItem';
import { ABIFragment } from '../../types';
import { getContractABI } from '../../config/contract';
import { logger } from '../../lib';
export class AbiTreeDataProvider implements TreeDataProvider<Abi> {

  context: vscode.ExtensionContext;

  constructor(context: vscode.ExtensionContext) {
    this.context = context;
  }

  getTreeItem(element: Abi): TreeItem {
    return element;
  }

  async getChildren(element?: Abi): Promise<Abi[] | undefined> {
    const leaves: Abi[] = [];
    if (vscode.workspace.workspaceFolders === undefined) {
      logger.error("Error: Please open your solidity project to vscode");
      return undefined;
    }
    const path_ = vscode.workspace.workspaceFolders[0].uri.fsPath;
    const selectedContract: string | undefined = this.context.workspaceState.get("selectedContract") as string;
    console.log(selectedContract);
    const data = getContractABI(path_,selectedContract);
    const inputFunction: Array<ABIFragment> | undefined = selectedContract !== undefined ? data === undefined ? undefined : data.abi :
      [];
    if (inputFunction === undefined) {
      return undefined;
    } 
    else {
      console.log(inputFunction);
      if (!element) {
        for (const entry of inputFunction) {
          if (entry.type === "function") {
            const colapse = (entry.inputs && entry.inputs.length > 0)
              ? TreeItemCollapsibleState.Expanded
              : TreeItemCollapsibleState.None;
            leaves.push(
              new Abi(
                entry.name,
                entry,
                entry.stateMutability === "view" || entry.stateMutability === "external" ? "abiReadFunction" : "abiFunction",
                null,
                [],
                colapse
              )
            );
          }
        }
      } else if (element.abi.type === "function") {
        const value: any = inputFunction.find((i: any) => i.name === element.abi.name);
        for (const input of value.inputs) {
          leaves.push(
            new Abi(
              input.name,
              input,
              "abiInput",
              element,
              [],
              TreeItemCollapsibleState.None
            )
          );
        }
        element.children = leaves;
      }
    }
    return leaves;
  }

  private _onDidChangeTreeData: EventEmitter<Abi | undefined> = new EventEmitter<Abi | undefined>();
  readonly onDidChangeTreeData: Event<Abi | undefined> = this._onDidChangeTreeData.event;

  refresh(item?: Abi): void {
    this._onDidChangeTreeData.fire(item);
  }
}
