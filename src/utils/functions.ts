import * as vscode from "vscode";
import * as fs from "fs";
import path from "path";
import { logger } from "../lib";

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

    if (!fs.existsSync(path.join(path_, "starkex", fileName))) {
      fs.mkdirSync(path.join(path_, "starkex", fileName));
    }

    fs.writeFileSync(
      path.join(path_, "starkex", fileName, `${fileName}_abi.json`),
      JSON.stringify(JSON.parse(fileData).abi)
    );
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

    fs.writeFileSync(
      path.join(path_, "starkex", fileName, `${fileName}_address.json`),
      JSON.stringify({
        name: fileName,
        address: "",
        classHash: "",
      })
    );
    logger.log("Address file created successfully.");
  } catch (error) {
    logger.log(`Error while writing to file: ${error}`);
  }
};
