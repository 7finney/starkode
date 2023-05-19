import * as vscode from "vscode";
import * as fs from "fs";
import path, { resolve } from "path";
import { logger } from "../lib";
import { ABIFragment, IContractQP, IFunctionQP } from "../types";
import { createABIFile, createAddressFile } from "../utils/functions";
import { getAccountInfo } from "./account";
import { Account, Contract, ec, Provider } from "starknet";
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
    if (JSON.parse(fileData).program) return filePath;
    if (JSON.parse(fileData).contract_class_version) {
      console.log("found cairo1 program");
      return filePath;
    }
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
    path.join(path_, "starkode", file, `${file}_address.json`),
    { encoding: "utf-8" }
  );
  const parsedFileData = JSON.parse(fileData);
  return parsedFileData;
};

const getContractABI = (path_: string, fileName: string) => {
  const file = fileName.substring(0, fileName.length - 5);
  const fileData = fs.readFileSync(
    path.join(path_, "starkode", file, `${file}_abi.json`),
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

export const deployContract = async (context: vscode.ExtensionContext) => {
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
    console.log(`selectedaAccount first: ${selectedAccount}`);
    if (selectedAccount === undefined) {
      logger.log("No account selected.");
      return;
    }
    const accountInfo = getAccountInfo(context, selectedAccount);
    const keyPair = ec.getKeyPair(accountInfo.privateKey);
    logger.log("Deploying contract...");
    const account = new Account(provider, accountInfo.accountAddress, keyPair);
    const contractInfo = getContractInfo(path_, selectedContract);
    if (contractInfo.classHash === "") {
      logger.log("No classHash available for selected contract.");
      return;
    }
    const deployResponse = await account.deployContract({
      classHash: contractInfo.classHash,
    });

    logger.log(`transaction hash: ${deployResponse.transaction_hash}`);

    logger.log("waiting for transaction success...");

    await provider.waitForTransaction(deployResponse.transaction_hash);

    const { abi: testAbi } = await provider.getClassAt(
      deployResponse.contract_address
    );
    if (testAbi === undefined) {
      throw new Error("no abi.");
    }
    const myTestContract = new Contract(
      testAbi,
      deployResponse.contract_address,
      provider
    );

    await provider.waitForTransaction(myTestContract.transaction_hash);
    logger.log(`contract deployed successfully: ${myTestContract.address}`);
  } catch (error) {
    logger.log(`Error while contract deployment: ${error}`);
  }
};

export const executeContractFunction = async (
  context: vscode.ExtensionContext
) => {
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
    const account = new Account(provider, accountInfo.accountAddress, keyPair);
    const functionABI = await getSelectedFunction(path_, selectedContract);
    const contractInfo = getContractInfo(path_, selectedContract);

    const params_: Array<any> = functionABI.inputs.map((e) => {
      return e.value;
    });

    const params: Array<any> = params_ !== undefined ? params_ : [];

    console.log(`params: ${params}`);

    console.log(`stateMutability: ${functionABI.state_mutability}`);

    if (
      functionABI.stateMutability === "view" ||
      functionABI.state_mutability === "view"
    ) {
      const Abi = getContractABI(path_, selectedContract).abi;
      const contract = new Contract(Abi, contractInfo.address, provider);
      logger.log(`calling function: ${functionABI.name}`);
      let functionCall: any;
      if (getContractABI(path_, selectedContract).isCairo1 === true) {
        functionCall = await contract[functionABI.name];
      } else {
        functionCall = await contract.call(`${functionABI.name}`);
      }
      logger.log(`result: ${functionCall.res.toString()}`);
    } else {
      const Abi = getContractABI(path_, selectedContract).abi;

      const contract = new Contract(Abi, contractInfo.address, provider);
      contract.connect(account);
      logger.log(`calling function: ${functionABI.name}`);

      let result: any;
      if (getContractABI(path_, selectedContract).isCairo1 === true) {
        logger.log("cairo 1 block executed.");
        // result = await contract[functionABI.name as string](...params);
        result = await contract[functionABI.name as string](...params);
      } else {
        logger.log("cairo 0.1 block executed.");
        result = await contract.invoke(functionABI.name, params);
      }

      logger.log(`transaction hash: ${result.transaction_hash}`);

      logger.log("waiting for transaction success...");

      await provider.waitForTransaction(result.transaction_hash);

      logger.log("transaction successfull");
    }
  } catch (error) {
    logger.log(error);
  }
};

const getSelectedFunction = (
  path_: string,
  selectedContract: string
): Promise<ABIFragment> => {
  return new Promise((resolve, reject) => {
    try {
      const contractInfo: Array<ABIFragment> = getContractABI(
        path_,
        selectedContract
      ).abi;

      if (contractInfo === undefined) return;
      const quickPick = vscode.window.createQuickPick<IFunctionQP>();

      quickPick.items = contractInfo.map((account: ABIFragment) => ({
        label: account.name,
      }));
      quickPick.onDidChangeActive(() => {
        quickPick.placeholder = "Select Function";
      });
      quickPick.onDidChangeSelection((selection: any) => {
        if (selection[0] != null) {
          const { label } = selection[0];
          quickPick.dispose();
          const functionItem = contractInfo.filter(
            (i: ABIFragment) => i.name === label
          );
          if (functionItem.length === 0)
            throw new Error("No function is selected");
          resolve(functionItem[0]);
        }
      });
      quickPick.onDidHide(() => {
        quickPick.dispose();
      });
      quickPick.show();
    } catch (error) {
      reject(error);
    }
  });
};
