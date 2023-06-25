import { TreeItem, TreeItemCollapsibleState, ThemeIcon } from 'vscode';

export class Abi extends TreeItem {
  public value: any;
  constructor(
    public readonly label: string,
    public readonly abi: any,
    contextValue: string,
    public parent: Abi | null,
    public children: Abi[],
    public readonly collapsibleState: TreeItemCollapsibleState
  ) {
    super(label, collapsibleState);
    this.contextValue = contextValue;
    if (abi.type === "function") {
      this.iconPath = new ThemeIcon("symbol-method");
    } else {
      this.description = abi.type + " : " + abi.value;
      this.iconPath = new ThemeIcon("symbol-parameter");
    }
  }
}