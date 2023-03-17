import * as vscode from "vscode";
import * as fs from "fs";
import { Account, ec, json, stark, Provider, hash } from "starknet";
import { logger } from "../lib";
import { IAccountQP, JSONAccountType } from "../types";
import { getNetworkProvider } from "./network";

export const createOZAccount = (context: vscode.ExtensionContext) => {
  try {
    const privateKey = stark.randomAddress();
    const starkKeyPair = ec.getKeyPair(privateKey);
    const starkKeyPub = ec.getStarkKey(starkKeyPair);

    const OZaccountClassHash =
      "0x2794ce20e5f2ff0d40e632cb53845b9f4e526ebd8471983f7dbd355b721d5a";
    const OZaccountConstructorCallData = stark.compileCalldata({
      publicKey: starkKeyPub,
    });
    const OZcontractAddress = hash.calculateContractAddressFromHash(
      starkKeyPub,
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
          accountPubKey: starkKeyPub,
          accountAddress: OZcontractAddress,
          privateKey: privateKey,
          isDeployed: false,
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
          accountPubKey: starkKeyPub,
          accountAddress: OZcontractAddress,
          privateKey: privateKey,
          isDeployed: false,
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

const getNotDeployedAccounts = async (context: vscode.ExtensionContext) => {
  if (!fs.existsSync(`${context.extensionPath}/accounts.json`)) {
    logger.log("No account exist.");
    return;
  }
  const fileData = fs.readFileSync(`${context.extensionPath}/accounts.json`, {
    encoding: "utf-8",
  });
  const parsedFileData: Array<JSONAccountType> = JSON.parse(fileData);
  const accounts: Array<JSONAccountType> = parsedFileData.filter(
    (e) => e.isDeployed === false
  );
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

export const deployAccount = async (context: vscode.ExtensionContext) => {
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
  const accountKeyPair = ec.getKeyPair(selectedAccount.privateKey);
  const provider = getNetworkProvider(context);
  console.log(`Account address: ${selectedAccount.accountAddress}`);
  if (provider === undefined) return;
  const account = new Account(
    provider,
    selectedAccount.accountAddress,
    accountKeyPair
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
  const accounts = (await getNotDeployedAccounts(context)) as JSONAccountType[];
  const changeToDeployed = accounts.map((account) => {
    if (account.accountAddress === selectedAccount.accountAddress) {
      return {
        ...account,
        isDeployed: true,
      };
    } else {
      return account;
    }
  });
  fs.writeFileSync(
    `${context.extensionPath}/accounts.json`,
    JSON.stringify(changeToDeployed)
  );
  logger.log(`Account deployed successfully at address: ${contract_address}`);
};

const getDeployedAccounts = (context: vscode.ExtensionContext) => {
  if (!fs.existsSync(`${context.extensionPath}/accounts.json`)) {
    logger.log("No account exist.");
    return;
  }
  const fileData = fs.readFileSync(`${context.extensionPath}/accounts.json`, {
    encoding: "utf-8",
  });
  const parsedFileData: Array<JSONAccountType> = JSON.parse(fileData);
  const accounts: Array<JSONAccountType> = parsedFileData.filter(
    (e) => e.isDeployed === true
  );
  return accounts;
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
