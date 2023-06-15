import * as vscode from "vscode";
import { isCairo1Contract, loadAllCompiledContract } from "../../config/contract";

export class ContractTreeDataProvider implements vscode.TreeDataProvider<Contract> {
  constructor(private workspaceRoot: string | undefined) { }

  getTreeItem(element: Contract): vscode.TreeItem {
    return element;
  }

  async getChildren(element?: Contract): Promise<Contract[]> {
    const contracts = loadAllCompiledContract();

    if (contracts === undefined || contracts.length === 0) {
      vscode.window.showInformationMessage("No Contracts in workspace");
      return [];
    } else {
      const leaves = [];
      for (const file of contracts) {
        leaves.push(new Contract(
          file.slice(0, -5),
          vscode.TreeItemCollapsibleState.None,
          "contract",
          isCairo1Contract(file) ? "file-code" : "file-text"
        ));
      }
      return leaves;
    }
  }

  private _onDidChangeTreeData: vscode.EventEmitter<Contract | undefined> =
    new vscode.EventEmitter<Contract | undefined>();
  readonly onDidChangeTreeData: vscode.Event<Contract | undefined> =
    this._onDidChangeTreeData.event;

  refresh(): void {
    this._onDidChangeTreeData.fire(undefined);
  }
}

export class Contract extends vscode.TreeItem {
  contextValue: string;
  constructor(
    public readonly label: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    public readonly context: string,
    public icon: string
  ) {
    super(label, collapsibleState);
    this.contextValue = context;
  }

  command = {
    title: "Use Contract",
    command: "starkode.useContract",
    arguments: [this],
  };

  iconPath = new vscode.ThemeIcon(this.icon);
}

