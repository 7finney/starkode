import * as vscode from "vscode";
import * as fs from "fs";
import path from "path";
import { logger } from "../lib";
import { IContractQP } from "../types";
import { createABIFile, createAddressFile } from "../utils/functions";
import { getAccountInfo } from "./account";
import { Account, ec, Provider } from "starknet";
import { getNetworkProvider } from "./network";

const loadAllCompiledContract = () => {
  if (vscode.workspace.workspaceFolders === undefined) {
    logger.error("Error: Please open your solidity project to vscode");
    return;
  }
  const path_ = vscode.workspace.workspaceFolders[0].uri.fsPath;
  const compiledCairoContract = fs
    .readdirSync(path_)
    .filter((file) => exportPathOfJSONfiles(path_, file));

  return compiledCairoContract;
};

const exportPathOfJSONfiles = (path_: string, file: string) => {
  const filePath = path.join(path_, file);
  if (path.extname(filePath) === ".json") {
    console.log(filePath);
    const fileData = fs.readFileSync(filePath, {
      encoding: "utf-8",
    });
    console.log("file readed");
    if (JSON.parse(fileData).program) return filePath;
  }
};

export const selectCompiledContract = (context: vscode.ExtensionContext) => {
  const contracts = loadAllCompiledContract();
  if (contracts === undefined) {
    logger.log("No Contract available.");
    return;
  }
  const quickPick = vscode.window.createQuickPick<IContractQP>();

  quickPick.items = contracts.map((contract: string) => ({
    label: contract.substring(0, contract.length - 5),
  }));
  quickPick.onDidChangeActive(() => {
    quickPick.placeholder = "Select Contract";
  });
  quickPick.onDidChangeSelection((selection: any) => {
    if (selection[0] != null) {
      const { label } = selection[0];
      void context.workspaceState.update("selectedContract", `${label}.json`);
      logger.log(`${label} contract selected`);
      createABIFile(`${label}.json`);
      createAddressFile(`${label}.json`);
      quickPick.dispose();
    }
  });
  quickPick.onDidHide(() => {
    quickPick.dispose();
  });
  quickPick.show();
};

const getContractInfo = (path_: string, fileName: string) => {
  const file = fileName.substring(0, fileName.length - 5);
  const fileData = fs.readFileSync(
    path.join(path_, "starkex", file, `${file}_address.json`),
    { encoding: "utf-8" }
  );
  const parsedFileData = JSON.parse(fileData);
  return parsedFileData;
};

export const declareContract = async (context: vscode.ExtensionContext) => {
  try {
    if (vscode.workspace.workspaceFolders === undefined) {
      logger.error("Error: Please open your solidity project to vscode");
      return;
    }
    const path_ = vscode.workspace.workspaceFolders[0].uri.fsPath;
    const provider = getNetworkProvider(context) as Provider;
    const selectedContract: string = context.workspaceState.get(
      "selectedContract"
    ) as string;
    const selectedAccount = context.workspaceState.get("account") as string;
    if (selectedAccount === undefined) {
      logger.log("No account selected.");
      return;
    }
    const accountInfo = getAccountInfo(context, selectedAccount);
    const keyPair = ec.getKeyPair(accountInfo.privateKey);
    logger.log("Declaring contract...");
    const account = new Account(provider, accountInfo.accountAddress, keyPair);
    const contractInfo = getContractInfo(path_, selectedContract);
    if (contractInfo.classHash === "") {
      logger.log("No classHash available for selected contract.");
      return;
    }
    const compiledContract = fs.readFileSync(
      path.join(path_, selectedContract),
      {
        encoding: "ascii",
      }
    );
    const declareResponse = await account.declare({
      contract: compiledContract,
      classHash: contractInfo.classHash,
    });

    logger.log(`transaction hash: ${declareResponse.transaction_hash}`);

    await provider.waitForTransaction(declareResponse.transaction_hash);
    logger.log(`contract classHash: ${declareResponse.class_hash}`);
  } catch (error) {
    logger.log(`Error while contract declaration: ${error}`);
  }
};
