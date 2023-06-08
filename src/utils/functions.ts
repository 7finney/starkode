import * as vscode from "vscode";
import * as fs from "fs";
import path from "path";
import { logger } from "../lib";
import { ABIFragment, JSONAccountType, TIsAccountDeployed } from "../types";

export const createABIFile = (file: string) => {
  try {
    if (vscode.workspace.workspaceFolders === undefined) {
      logger.error("Error: Please open your solidity project to vscode");
      return;
    }
    const path_ = vscode.workspace.workspaceFolders[0].uri.fsPath;
    const fileName = file.substring(0, file.length - 5);

    if (!fs.existsSync(path.join(path_, "starkode", fileName))) {
      fs.mkdirSync(path.join(path_, "starkode", fileName));
    }

    if (
      !fs.existsSync(
        path.join(path_, "starkode", fileName, `${fileName}_abi.json`)
      )
    ) {
      const filePath = path.join(path_, file);
      const fileData = fs.readFileSync(filePath, { encoding: "utf-8" });

      const isCairo1Contract =
        JSON.parse(fileData).contract_class_version === "0.1.0" ? true : false;

      const abi: Array<ABIFragment> = JSON.parse(fileData).abi;

      const abiFunctions = abi.filter((e) => e.type === "function");

      const functionsValue = abiFunctions.map((func) => {
        return {
          type: func.type,
          name: func.name,
          inputs: func.inputs.map((e) => {
            return { ...e, value: "" };
          }),
          stateMutability: func.stateMutability
            ? func.stateMutability
            : func.state_mutability,
          outputs: func.outputs,
        };
      });

      fs.writeFileSync(
        path.join(path_, "starkode", fileName, `${fileName}_abi.json`),
        JSON.stringify({ isCairo1: isCairo1Contract, abi: functionsValue }, null, 2)
      );
      logger.log("ABI file created successfully.");
    } else {
      logger.log(`${fileName}_abi.json already exist.`);
    }
  } catch (error) {
    logger.log(`Error while writing to file: ${error}`);
  }
};

export const createAddressFile = (file: string) => {
  try {
    if (vscode.workspace.workspaceFolders === undefined) {
      logger.error("Error: Please open your solidity project to vscode");
      return;
    }
    const path_ = vscode.workspace.workspaceFolders[0].uri.fsPath;
    const fileName = file.substring(0, file.length - 5);

    if (
      !fs.existsSync(
        path.join(path_, "starkode", fileName, `${fileName}_address.json`)
      )
    ) {
      fs.writeFileSync(
        path.join(path_, "starkode", fileName, `${fileName}_address.json`),
        JSON.stringify({
          name: fileName,
          address: "",
          classHash: "",
        }, null, 2)
      );
      logger.log("Address file created successfully.");
    } else {
      logger.log(`${fileName}_address.json already exist.`);
    }
  } catch (error) {
    logger.log(`Error while writing to file: ${error}`);
  }
};

export const accountDeployStatus = (
  accounts: Array<JSONAccountType>,
  selectedNetwork: string,
  status: boolean
) => {
  const networks = ["goerli-alpha", "goerli-alpha-2", "mainnet-alpha"];
  let result: Array<JSONAccountType> | undefined;
  switch (selectedNetwork) {
    case networks[0]: {
      result = accounts.filter((e) => e.isDeployed.gAlpha === status);
      break;
    }
    case networks[1]: {
      result = accounts.filter((e) => e.isDeployed.gAlpha2 === status);
      break;
    }
    case networks[2]: {
      result = accounts.filter((e) => e.isDeployed.mainnet === status);
      break;
    }
    default:
      break;
  }
  return result;
};
