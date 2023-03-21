import * as vscode from "vscode";
import * as fs from "fs";
import path from "path";
import { logger } from "../lib";
import { ABIFragment } from "../types";

export const createABIFile = (file: string) => {
  try {
    if (vscode.workspace.workspaceFolders === undefined) {
      logger.error("Error: Please open your solidity project to vscode");
      return;
    }
    const path_ = vscode.workspace.workspaceFolders[0].uri.fsPath;
    const filePath = path.join(path_, file);
    const fileData = fs.readFileSync(filePath, { encoding: "utf-8" });
    const fileName = file.substring(0, file.length - 5);

    const abi: Array<ABIFragment> = JSON.parse(fileData).abi;

    const abiFunctions = abi.filter((e) => e.type === "function");

    const functionsValue = abiFunctions.map((func) => {
      return {
        ...func,
        inputs: func.inputs.map((e) => {
          return { ...e, value: "" };
        }),
      };
    });

    if (!fs.existsSync(path.join(path_, "starkex", fileName))) {
      fs.mkdirSync(path.join(path_, "starkex", fileName));
    }

    if (
      !fs.existsSync(
        path.join(path_, "starkex", fileName, `${fileName}_abi.json`)
      )
    ) {
      fs.writeFileSync(
        path.join(path_, "starkex", fileName, `${fileName}_abi.json`),
        JSON.stringify(functionsValue)
      );
    } else {
      logger.log(`${fileName}_abi.json already exist.`);
    }

    logger.log("ABI file created successfully.");
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

    if (!fs.existsSync(path.join(path_, "starkex", fileName))) {
      fs.mkdirSync(path.join(path_, "starkex", fileName));
    }

    if (
      !fs.existsSync(
        path.join(path_, "starkex", fileName, `${fileName}_address.json`)
      )
    ) {
      fs.writeFileSync(
        path.join(path_, "starkex", fileName, `${fileName}_address.json`),
        JSON.stringify({
          name: fileName,
          address: "",
          classHash: "",
        })
      );
    } else {
      logger.log(`${fileName}_address.json already exist.`);
    }

    logger.log("Address file created successfully.");
  } catch (error) {
    logger.log(`Error while writing to file: ${error}`);
  }
};
