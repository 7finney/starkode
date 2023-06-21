import * as vscode from "vscode";
import * as fs from "fs";
import path from "path";
import {
  createOZAccount,
  deleteAccount,
  deployAccount,
  selectDeployedAccount,
  selectNotDeployedAccount,
} from "./config/account";
import {
  declareContract,
  deployContract,
  executeContractFunction,
  executeContractFunctionFromTreeView,
  getContractInfo,
  isCairo1Contract,
  loadAllCompiledContract,
  selectCompiledContract,
  setContract,
} from "./config/contract";
import { updateSelectedNetwork } from "./config/network";
import { logger } from "./lib";
import { ContractTreeDataProvider } from "./treeView/ContractTreeView/ContractTreeDataProvider";
import { editContractAddress, refreshContract } from "./treeView/ContractTreeView/function";

import { Contract as ContractTreeItem } from "./treeView/ContractTreeView/ContractTreeDataProvider";
import { AbiTreeDataProvider } from "./treeView/ABITreeView/AbiTreeDataProvider";
import { editInput } from "./treeView/ABITreeView/functions";
import { AccountTreeDataProvider } from "./treeView/AccountTreeView/AccountTreeDataProvider";


export function activate(context: vscode.ExtensionContext) {

  if (vscode.workspace.workspaceFolders === undefined) {
    logger.error("Error: Please open your solidity project to vscode");
    return;
  }

  const path_ = vscode.workspace.workspaceFolders[0].uri.fsPath;
  const watcher = vscode.workspace.createFileSystemWatcher(`${path_}/starkode/**`);

  watcher.onDidChange((event: vscode.Uri) => {
    const contractName: string | undefined = context.workspaceState.get("selectedContract");
    if (contractName === undefined) {
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

  // if contract tree view is empty
  const contracts = loadAllCompiledContract();
  if (contracts === undefined || contracts.length === 0) {
    contractTreeView.message = "No contract found. Please compile your contract.";
  }

  contractTreeView.onDidChangeSelection(event => {
    const selectedNodes = event.selection;
    if (selectedNodes && selectedNodes.length > 0) {
      console.log('Selected nodes:', selectedNodes[0].label);
    }
  });

  // Account Tree View
  const accountTreeDataProvider = new AccountTreeDataProvider(
    context
  );

  const accountTreeView = vscode.window.createTreeView("starkode.account", {
    treeDataProvider: accountTreeDataProvider,
  });

  const selectedNetwork: any = context.workspaceState.get("selectedNetwork");

  const selectedAccount: string | undefined = context.workspaceState.get("account") as string;

  accountTreeView.message = selectedAccount ? `Account : ${selectedAccount.slice(0, 5) + "..." + selectedAccount.slice(-5)} | ${selectedNetwork}` : "Select a deployed account , or create an account and deploy it";

  // ABI Tree View
  const abiTreeDataProvider = new AbiTreeDataProvider(
    context
  );

  const abiTreeView = vscode.window.createTreeView("starkode.abis", {
    treeDataProvider: abiTreeDataProvider,
  });
  const contractName: string | undefined = context.workspaceState.get("selectedContract");
  if (!contractName || contractName === undefined) {
    abiTreeView.message = "Select a contract and its ABI functions will appear here.";
  }
  else {
    const contractInfo = getContractInfo(path_, contractName);
    if (contractInfo !== undefined) {
      abiTreeView.description = `${contractName.slice(0, -5)} @ ${contractInfo.address}`;
    } else {
      abiTreeView.message = "Select a contract and its ABI functions will appear here.";
    }
  }
  context.subscriptions.push(
    vscode.commands.registerCommand("starkode.activate", () => {
      try {
        if (!fs.existsSync(path.join(path_, "starkode"))) {
          fs.mkdirSync(path.join(path_, "starkode"));
        }
        vscode.window.showInformationMessage("Starkode activated.");
      } catch (error) {
        console.log(error);
      }
    }),

    vscode.commands.registerCommand("starkode.refreshContracts", async (node: ContractTreeItem) => {
      contractTreeView = await refreshContract(node, contractTreeDataProvider);
      contractTreeView.message = undefined;
    }),

    vscode.commands.registerCommand("starkode.useContract", async (node: ContractTreeItem) => {
      console.log(node);
      setContract(context, node.label);
      abiTreeView.message = undefined;

      const contractInfo = getContractInfo(path_, `${node.label}.json`);
      if (contractInfo !== undefined) {
        abiTreeView.description = `${node.label} @ ${contractInfo.address}`;
      }
      abiTreeDataProvider.refresh();
    }),

    vscode.commands.registerCommand("starkode.useAccount", async (node: any) => {
      console.log(node);
      if (node.context === "deployedAccount") {
        void context.workspaceState.update("account", node.account.accountAddress);
        logger.log(`${node.account.accountAddress} selected`);
        const selectedNetwork: any = context.workspaceState.get("selectedNetwork");
        const selectedAccount = context.workspaceState.get("account") as string;
        if (selectedAccount !== undefined) {
          accountTreeView.message = `Account : ${selectedAccount.slice(0, 5) + "..." + selectedAccount.slice(-5)} | ${selectedNetwork}`;
        }
        abiTreeDataProvider.refresh();
      } else {
        vscode.window.showErrorMessage("Please deploy the account first.");
      }
    }),

    vscode.commands.registerCommand("starkode.createAccountTreeView", async () => {
      console.log("createAccountTreeView");
      createOZAccount(context);
      accountTreeDataProvider.refresh();
    }),

    vscode.commands.registerCommand("starkode.selectNetwork", async () => {
      console.log("selectNetwork");
      await updateSelectedNetwork(context, accountTreeView, accountTreeDataProvider);
    }),

    vscode.commands.registerCommand("starkode.deployAccountTreeView", async (node: any) => {
      console.log("deployAccountTreeView");
      void context.workspaceState.update("undeployedAccount", node.account.accountAddress);
      logger.log(`${node.account.accountAddress} selected`);
      await deployAccount(context, accountTreeDataProvider);
    }),

    vscode.commands.registerCommand("starkode.copyAccountAddress", async (node: any) => {
      vscode.env.clipboard.writeText(node.account.accountAddress);
    }),

    vscode.commands.registerCommand("starkode.deleteAccount", async (node: any) => {
      console.log("deleteAccount");
      console.log("node", node);
      await deleteAccount(context, node);
      accountTreeDataProvider.refresh();
    }),

    vscode.commands.registerCommand("starkode.editContractAddress", async (node: ContractTreeItem) => {
      await editContractAddress(node, context);
    }),

    vscode.commands.registerCommand("starkode.editInput", async (node: any) => {
      const selectedContract: string = context.workspaceState.get(
        "selectedContract"
      ) as string;
      await editInput(node, abiTreeDataProvider, selectedContract);
    }),

    vscode.commands.registerCommand("starkode.deploycontract", async (node: any) => {
      console.log("deploycontract");
      console.log(node);
      const selectedContract: string = context.workspaceState.get(
        "selectedContract"
      ) as string;
      console.log(selectedContract);
      if (selectedContract === undefined) {
        logger.log("No Contract selected");
        return;
      }
      if (selectedContract.slice(0, -5) !== node.label) {
        logger.log("Please select the contract first.");
      } else {
        if (isCairo1Contract(selectedContract)) {
          await vscode.commands.executeCommand("starkode.declareContract");
        } else {
          await vscode.commands.executeCommand("starkode.deployContract");
        }
      }
    }),

    vscode.commands.registerCommand("starkode.selectnetwork", async () => {
      await updateSelectedNetwork(context, accountTreeView, accountTreeDataProvider);
    }),

    vscode.commands.registerCommand("starkode.createaccount", async () => {
      createOZAccount(context);
      contractTreeDataProvider.refresh();
    }),

    vscode.commands.registerCommand("starkode.unDeployedAccount", async () => {
      selectNotDeployedAccount(context);
    }),

    vscode.commands.registerCommand("starkode.declareContract", async () => {
      await declareContract(context);
    }),

    vscode.commands.registerCommand("starkode.deployaccount", async () => {
      await deployAccount(context, accountTreeDataProvider);
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
    }),

    vscode.commands.registerCommand("starkode.callContract", async (node: any) => {
      console.log("Call", node.abi);
      await executeContractFunctionFromTreeView(context, node.abi);
    })

  );
}
