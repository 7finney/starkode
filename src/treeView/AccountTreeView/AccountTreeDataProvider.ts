import * as vscode from "vscode";
import { loadAllCompiledContract } from "../../config/contract";
import { JSONAccountType } from "../../types";
import { getDeployedAccounts, getNotDeployedAccounts } from "../../config/account";
import { getNetworkProvider } from "../../config/network";

export class AccountTreeDataProvider
  implements vscode.TreeDataProvider<Account>
{
  constructor(public context: vscode.ExtensionContext) { }

  getTreeItem(element: Account): vscode.TreeItem {
    return element;
  }

  async getChildren(element?: Account): Promise<Account[]> {
    const accounts: Array<JSONAccountType> | undefined = getDeployedAccounts(this.context);
    const undeployedAccounts: Array<JSONAccountType> | undefined = await getNotDeployedAccounts(this.context);
    if ((accounts === undefined && undeployedAccounts === undefined)){
      return [];
    } else {
      const leaves = [];
      if (accounts !== undefined) {
        for (const account of accounts) {
          leaves.push(new Account(
            account.accountAddress.slice(0, 5) + "..." + account.accountAddress.slice(-5),
            vscode.TreeItemCollapsibleState.None,
            "deployedAccount",
            account,
            "verified"
          ));
        }
      }
      if (undeployedAccounts !== undefined) {
        for (const account of undeployedAccounts) {
          leaves.push(new Account(
            account.accountAddress.slice(0, 5) + "..." + account.accountAddress.slice(-5),
            vscode.TreeItemCollapsibleState.None,
            "undeployedAccount",
            account,
            "unverified"
          ));
        }
      }
      return leaves;
    }
  }

  private _onDidChangeTreeData: vscode.EventEmitter<Account | undefined> =
    new vscode.EventEmitter<Account | undefined>();
  readonly onDidChangeTreeData: vscode.Event<Account | undefined> =
    this._onDidChangeTreeData.event;

  refresh(): void {
    this._onDidChangeTreeData.fire(undefined);
  }
}

export class Account extends vscode.TreeItem {
  contextValue: string;
  constructor(
    public readonly label: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    public readonly context: string,
    public account: JSONAccountType | undefined,
    public readonly icon: string
  ) {
    super(label, collapsibleState);
    this.contextValue = context;
  }

  command = {
    title: "Use Account",
    command: "starkode.useAccount",
    arguments: [this],
  };

  iconPath = new vscode.ThemeIcon(this.icon);
}


