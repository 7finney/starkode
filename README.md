# Starkode: A vscode plugin for cairo smart contracts

A Vscode plugin for **[Starknet](https://www.starknet.io/en) Developers Community** in which smart contract developers can perform the following features:

## It now supports cairo 1.0 smart contracts.

## Installation

Download the vsix file from our [internal release](https://github.com/7finney/starkode/releases/tag/v0.0.1) and install on vscode.

## Features

- Create account
- Deploy account
- Compile cairo smart contracts
- Declare & deploy cairo smart contracts
- Deploy cairo smart contracts
- Interaction with cairo smart contracts

# Starkode usage instruction

1. **activate Starkode extension:**
   - A new folder with the title `starkode` will generate in the current working directory to store contract logs.
2. **Select starknet network:**
   - Select the network on which you want to interact with the cairo smart contracts.
3. **Create new account:**
   - Creates new undeployed account for contract interaction.
   ![account-creation](https://github.com/7finney/starkode/assets/87822922/df2f53ea-750d-4310-97b4-059c35366666)
4. **Select undeployed account**
   - Select undeployed account for the deployment on the selected network.
5. **Deploy selected account:**

   - It will deploy the selected undeployed account on the selected network.

   ![deploy-account](https://github.com/7finney/starkode/assets/87822922/3c71f68b-33bc-4336-9111-a0af6481c4e7)

6. **Select account:**
   - Select an on-chain deployed account for contract interaction.
   - on-chain deployed accounts are used for contract interaction.
7. **Select cairo contract:**
   - Select compiled cairo contract.
   - The .json file should be present in root directory of the project.
   - After selecting the contact a folder containing two files will be generated in Starkode folder.
     - `starkode/fileName/fileName_address.json` stores the address and classHash info of the cairo contract.
     - `starkode/fileName/fileName_abi.json` contains abi of selected Cairo contract for contract interaction.
8. **Declare cairo contract:**

   - Declare and deploy selected cairo contract on-chain.

   **Note:** Before declaring and deploying the contract,

   - In case of cairo 0 contract the classHash of the selected contract must be present in the `starkode/fileName/fileName_address.json.` classHash field.
   - For cairo 1.0 contract the associated `.casm` file of the selected contract must be present in root directory of the project with same name.

   **Note:**

   - In case of cairo 0 contracts deploy the contract by calling `Deploy cairo contract` command.
   - In case of cairo 1.0 contract if associated `.casm` file is not present but if classHash is available then directly deploy the contract by calling `Deploy cairo contract` command after pasting the classHash inside `starkode/fileName/fileName_address.json` file.

   ![declare-contract](https://github.com/7finney/starkode/assets/87822922/99554060-ef3d-4eb0-9539-c06a0e0215af)

9. **Call contact method:**

   - paste deployed contract address into file `starkode/fileName/fileName_address.json.` address field.
   - Call contract methods present in cairo contract.
   - The view type function can be called by just selecting the contract.
   - other functions can be called by entering values in the JSON file `starkode/fileName/fileName_abi.json`.

   ![call-contract](https://github.com/7finney/starkode/assets/87822922/80ebb236-c663-4f65-90f6-d4719ee30e6c)
