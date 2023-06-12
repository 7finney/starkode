
import * as vscode from 'vscode';
import { Abi } from './AbiTreeItem';
import { logger } from '../../lib';
import path from 'path';

async function search(filePath: string, searchString: string, startLine = 0) {
    const document = await vscode.workspace.openTextDocument(filePath);
    const text = document.getText();
    const start = text.indexOf(searchString, document.offsetAt(new vscode.Position(startLine, 0)));
    const startPosition = document.positionAt(start);
    return startPosition;
}

export const editInput = async (input: Abi, abiTreeDataProvider: any, fileName: string) => {
    let filePath = "";
    if (vscode.workspace.workspaceFolders === undefined) {
        logger.error("Error: Please open your solidity project to vscode");
        return [];
    }
    const path_ = vscode.workspace.workspaceFolders[0].uri.fsPath;
    const file = fileName.substring(0, fileName.length - 5);
    filePath = path.join(path_, "starkode", file, `${file}_abi.json`);

    const document = await vscode.workspace.openTextDocument(filePath);
    const lineNumber = await search(filePath, `"name": "${input.parent?.label}"`);
    const line = await search(filePath, `"name": "${input.abi.name}"`, lineNumber.line);

    const cursorPosition = new vscode.Position(line.line + 2, line.character + 10);
    const editor = await vscode.window.showTextDocument(document);
    editor.selection = new vscode.Selection(cursorPosition, cursorPosition);
    editor.revealRange(new vscode.Range(cursorPosition, cursorPosition));

    abiTreeDataProvider.refresh(input);
};