import * as vscode from "vscode";
import * as fs from "fs";
import {
  Account,
  ec,
  json,
  stark,
  Provider,
  hash,
  CallData,
  Signer,
} from "starknet";
import { logger } from "../lib";
import { IAccountQP, JSONAccountType } from "../types";
import { NETWORKS, getNetworkProvider } from "./network";
import { accountDeployStatus } from "../utils/functions";

export const createOZAccount = async (context: vscode.ExtensionContext) => {
  try {
    const privateKey = stark.randomAddress();
    const publicKey = await new Signer(privateKey).getPubKey();

    const OZaccountClassHash =
      "0x06f3ec04229f8f9663ee7d5bb9d2e06f213ba8c20eb34c58c25a54ef8fc591cb";
    const OZaccountConstructorCallData = CallData.compile({
      publicKey: publicKey,
    });
    const OZcontractAddress = hash.calculateContractAddressFromHash(
      publicKey,
      OZaccountClassHash,
      OZaccountConstructorCallData,
      0
    );

    if (fs.existsSync(`${context.extensionPath}/accounts.json`)) {
      const filedata = fs.readFileSync(
        `${context.extensionPath}/accounts.json`,
        {
          encoding: "utf-8",
        }
      );
      const parsedFileData = JSON.parse(filedata);
      const writeNewAccount: Array<JSONAccountType> = [
        ...parsedFileData,
        {
          accountHash: OZaccountClassHash,
          constructorCallData: OZaccountConstructorCallData,
          accountPubKey: publicKey,
          accountAddress: OZcontractAddress,
          privateKey: privateKey,
          isDeployed: {
            gAlpha: false,
            gAlpha2: false,
            mainnet: false,
          },
        },
      ];
      fs.writeFileSync(
        `${context.extensionPath}/accounts.json`,
        JSON.stringify(writeNewAccount)
      );
    } else {
      const writeNewAccount: Array<JSONAccountType> = [
        {
          accountHash: OZaccountClassHash,
          constructorCallData: OZaccountConstructorCallData,
          accountPubKey: publicKey,
          accountAddress: OZcontractAddress,
          privateKey: privateKey,
          isDeployed: {
            gAlpha: false,
            gAlpha2: false,
            mainnet: false,
          },
        },
      ];
      fs.writeFileSync(
        `${context.extensionPath}/accounts.json`,
        JSON.stringify(writeNewAccount)
      );
    }
    logger.log(`created new account ${OZcontractAddress}`);
  } catch (error) {
    logger.error(`Error while creating new account: ${error}`);
  }
};

export const getNotDeployedAccounts = async (context: vscode.ExtensionContext) => {
  const selectedNetwork: any = context.workspaceState.get("selectedNetwork");
  if (selectedNetwork === undefined) {
    logger.log("Network not selected");
    return;
  }
  if (!fs.existsSync(`${context.extensionPath}/accounts.json`)) {
    logger.log("No account exist.");
    return;
  }
  const fileData = fs.readFileSync(`${context.extensionPath}/accounts.json`, {
    encoding: "utf-8",
  });
  const parsedFileData: Array<JSONAccountType> = JSON.parse(fileData);
  const accounts: Array<JSONAccountType> | undefined = accountDeployStatus(
    parsedFileData,
    selectedNetwork,
    false
  );
  if (accounts === undefined || accounts.length === 0) {
    logger.log(`No undeployed account available on ${selectedNetwork}`);
    return;
  }
  return accounts;
};
export const selectNotDeployedAccount = async (
  context: vscode.ExtensionContext
) => {
  const accounts: Array<JSONAccountType> | undefined =
    await getNotDeployedAccounts(context);
  if (accounts === undefined) return;
  const quickPick = vscode.window.createQuickPick<IAccountQP>();

  quickPick.items = accounts.map((account: JSONAccountType) => ({
    label: account.accountAddress,
  }));
  quickPick.onDidChangeActive(() => {
    quickPick.placeholder = "Select account";
  });
  quickPick.onDidChangeSelection((selection: any) => {
    if (selection[0] != null) {
      const { label } = selection[0];
      void context.workspaceState.update("undeployedAccount", label);
      logger.log(`${label} selected`);
      quickPick.dispose();
    }
  });
  quickPick.onDidHide(() => {
    quickPick.dispose();
  });
  quickPick.show();
};

export const deployAccount = async (context: vscode.ExtensionContext , accountTreeDataProvider: any) => {
  const presentAccounts: Array<JSONAccountType> | undefined =
    await getNotDeployedAccounts(context);

  const unDeployedAccount = await context.workspaceState.get(
    "undeployedAccount"
  );
  if (presentAccounts === undefined) return;
  const isAccountPresent: any = presentAccounts.filter(
    (account) => account.accountAddress === unDeployedAccount
  );
  const selectedAccount: JSONAccountType = isAccountPresent[0];

  const selectedNetwork = context.workspaceState.get("selectedNetwork");
  const provider = getNetworkProvider(context);
  console.log(`Account address: ${selectedAccount.accountAddress}`);
  if (provider === undefined) return;
  const account = new Account(
    provider,
    selectedAccount.accountAddress,
    selectedAccount.privateKey,
    "1"
  );
  logger.log(
    `deploying account ${selectedAccount.accountAddress} on ${selectedNetwork}`
  );
  const { contract_address, transaction_hash } = await account.deployAccount({
    classHash: selectedAccount.accountHash,
    constructorCalldata: selectedAccount.constructorCallData,
    addressSalt: selectedAccount.accountPubKey,
  });

  logger.log(`transaction hash: ${transaction_hash}`);
  await provider.waitForTransaction(transaction_hash);
  await updateAccountJSON( context, `${context.extensionPath}/accounts.json`, selectedAccount);
  logger.log(`Account deployed successfully at address: ${contract_address}`);
  accountTreeDataProvider.refresh();

};

const updateAccountJSON = async ( context: vscode.ExtensionContext , path: string, selectedAccount:JSONAccountType ) => {
  const selectedNetwork = context.workspaceState.get("selectedNetwork");
  fs.readFile(path, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading file:', err);
      return;
    }
  
    const accounts = JSON.parse(data);
  
    const indexToUpdate = accounts.findIndex((account: { accountAddress: string; }) => account.accountAddress === selectedAccount.accountAddress);
  
    if (indexToUpdate !== -1) {
      accounts[indexToUpdate].isDeployed = {
        gAlpha: selectedNetwork === NETWORKS[0] ? true : false,
        gAlpha2: selectedNetwork === NETWORKS[1] ? true : false,
        mainnet: selectedNetwork === NETWORKS[2] ? true : false,
      };
  
      fs.writeFile(path, JSON.stringify(accounts, null, 2), 'utf8', (err) => {
        if (err) {
          console.error('Error writing file:', err);
          return;
        }
        console.log('JSON file successfully updated.');
      });
    } else {
      console.error('Element not found in JSON file.');
    }
  });
};

export const getDeployedAccounts = (context: vscode.ExtensionContext) => {
  const selectedNetwork: any = context.workspaceState.get("selectedNetwork");
  if (selectedNetwork === undefined){
    // logger.log("Network not selected");
    return;
  }
  if (!fs.existsSync(`${context.extensionPath}/accounts.json`)) {
    logger.log("No deployed account exist.");
    return;
  }
  const fileData = fs.readFileSync(`${context.extensionPath}/accounts.json`, {
    encoding: "utf-8",
  });
  const parsedFileData: Array<JSONAccountType> = JSON.parse(fileData);
  const accounts: Array<JSONAccountType> | undefined = accountDeployStatus(
    parsedFileData,
    selectedNetwork,
    true
  );
  if (accounts === undefined || accounts.length === 0) {
    logger.log(`No deployed account available on ${selectedNetwork}`);
    return;
  }
  return accounts;
};

export const deleteAccount = async (context: vscode.ExtensionContext,node: any) => {
  const fileData = fs.readFileSync(`${context.extensionPath}/accounts.json`, {
    encoding: "utf-8",
  });
  const parsedFileData: Array<JSONAccountType> = JSON.parse(fileData);
  const filteredData = parsedFileData.filter(obj => obj.accountAddress !== node.account.accountAddress);
  fs.writeFileSync(`${context.extensionPath}/accounts.json`, JSON.stringify(filteredData, null, 2));
};

export const selectDeployedAccount = async (
  context: vscode.ExtensionContext
) => {
  const accounts: Array<JSONAccountType> | undefined =
    await getDeployedAccounts(context);
  if (accounts === undefined) return;
  const quickPick = vscode.window.createQuickPick<IAccountQP>();

  quickPick.items = accounts.map((account: JSONAccountType) => ({
    label: account.accountAddress,
  }));
  quickPick.onDidChangeActive(() => {
    quickPick.placeholder = "Select account";
  });
  quickPick.onDidChangeSelection((selection: any) => {
    if (selection[0] != null) {
      const { label } = selection[0];
      void context.workspaceState.update("account", label);
      logger.log(`${label} selected`);
      quickPick.dispose();
    }
  });
  quickPick.onDidHide(() => {
    quickPick.dispose();
  });
  quickPick.show();
};

export const getAccountInfo = (
  context: vscode.ExtensionContext,
  accountAddress: string
) => {
  const accounts = getDeployedAccounts(context) as JSONAccountType[];
  const selectedAccountInfo = accounts.filter(
    (account) => account.accountAddress === accountAddress
  );
  return selectedAccountInfo[0];
};
