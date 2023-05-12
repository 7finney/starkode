# Starkode

A Vscode plugin for **[Starknet](https://www.starknet.io/en) Developers Community** in which smart contract developers can perform the following features:

## Installation

## Features

- Create account
- Deploy account
- Compile cairo smart contracts
- Declare cairo smart contracts
- Deploy cairo smart contracts
- Interaction with cairo smart contracts

# Starkode usage instruction

## Account Creation
![account-creation](https://user-images.githubusercontent.com/13261372/229073284-b790c667-6f3e-4899-96f6-d53f36d9cf06.gif)




## Contract Deployment & Interaction
![contract-deploy-and-interaction](https://user-images.githubusercontent.com/9979182/229073433-3f6b4c7c-48dd-414b-bbe5-c52f03764a0d.gif)



1. **activate starkode extension:** 
    - A new folder with the title `starkode` is generated in the current working directory to store contract logs.
    
2. **Select starknet network:**
    - Currently, the extension only supports `goerli-alpha` network. **(only select `goerli-alpha` network for contract execution).**
3. **Create new starknet account:**
    - Creates new undeployed account for contract interaction.
    - It uses openzeppelin account standards.
4. **Select starknet undeployed account:**
    - Selected undeployed account for deployment.
5. **Deploy starknet new account:**
    - Deploy selected undeployed account on-chain.
6. **Select starknet account:**
    - Select an on-chain deployed account for contract interaction.
    - on-chain deployed accounts are used for contract interaction.
7. **Select cairo contract:**
    - Select compiled cairo contract.
    - The .json file should be present in root directory of the project.
    - After selecting the contact a folder containing two files will be generated in `starkode` directory.
        - `starkode/fileName/fileName_address.json` stores the address and classHash info of the cairo contract.
        - `starkode/fileName/fileName_abi.json` contains abi of selected Cairo contract for contract interaction.
8. **Declare cairo contract:**
    - Declare selected cairo contract on-chain. (**Note:** before declaring and deploying the contract, the classHash of the selected contract must be present in the `starkode/fileName/fileName_address.json.` classHash field.
9. **Deploy cairo contract:**
    - Deploy selected cairo contract on-chain.
    - paste deployed contract address into file `starkode/fileName/fileName_address.json.`  address field.
10. **Call contact method:**
    - Call contract methods present in cairo contract.
    - The view type function can be called by just selecting the contract.
    - other functions can be called by entering values in the JSON file.
        
        `starkode/fileName/fileName_abi.json`
