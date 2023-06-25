# Readme

## Starkode: Starknet IDE - Cairo smart contracts development and execution interface.
[![Discord chat](https://img.shields.io/discord/722971683388129290?color=7389D8&logo=discord&logoColor=ffffff)](https://discord.gg/Y93cYr6u)

Starkode is an advanced development environment and execution interface tailor-made for the thriving Starknet developers community. Integrated into the popular VScode platform, this robust tool empowers developers with a comprehensive suite of components, streamlining account creation and facilitating Cairo smart contract deployment and execution. By leveraging Starkode, users can effortlessly interact with the Starknet network, ensuring a seamless and intuitive experience.

## Features

- Create & deploy account
- Declare & deploy cairo smart contracts
- Interaction with cairo smart contracts: Call mutable & immutable functions
- Supports **cairo 0** and **cairo 1.0** contracts
- Network support: Goerli-alpha, Goerli-alpha-2, Mainnet-alpha

## Installation

[VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=7finney.starkode)

## Starkode usage instruction

1. **Open Starkode Extension:**
    - Select the extension from left side pannel.

![Group 8 (4).png](https://github.com/7finney/starkode/assets/13261372/17114d59-3da9-4400-a165-1ab4284536f6)

2. **Select Starknet Network:**
    - Select the network on which you want to deploy account and interact with the cairo smart contracts.
    
    ![Group 10 (1).png](https://github.com/7finney/starkode/assets/13261372/2a3a20d3-c3a2-405e-8398-ce547dfa09a6)

**Available Networks:**

- Goerli-alpha
- Goerli-alpha-2
- Mainnet-alpha

3. **Create new account:**
    - Create new undeployed account in the selected network
    
    ![create-acc](https://github.com/7finney/starkode/assets/13261372/f988719c-552a-41c9-81a3-c1ffb9bb0cb1)
    

4. **Fund Account**
    
    [Goerli-alpha Faucet](https://faucet.goerli.starknet.io/)
    
5. **Deploy Selected Account:**
    - Deploy the selected undeployed account on the selected network.
    
    ![deploy account.gif](https://github.com/7finney/starkode/assets/13261372/671423c5-cd41-42de-8977-4fc20ea2abbe)
    

6. **Select Cairo Contract:**
    - The .json file should be present in root directory of the project.
    - A folder containing two files will be created inside Starkode folder.
        - `starkode/fileName/fileName_address.json` stores the address and classHash info of the cairo contract.
        - `starkode/fileName/fileName_abi.json` contains abi of selected Cairo contract for contract interaction.
        
        ![select-contract.gif](https://github.com/7finney/starkode/assets/13261372/9f150ec6-4905-4b8d-8578-378c7848a714)
        

7. **Declare  & Deploy Cairo Contract:**
    - Declare and deploy selected cairo contract on-chain.
    
    **Note - Cairo 0:** Before deploying the contract,
    
    - In case of **cairo 0** contract the classHash of the selected contract must be present in the `starkode/fileName/fileName_address.json.` classHash field.
    
    **Note - Cairo 1.0:** Before declaring the contract
    
    - For **cairo 1.0** contract the associated `.casm` file of the selected contract must be present in root directory of the project with same name.
    - Declare the contract by clicking the “Play Button”, Paste the *class_hash* and *deplyed_contract_address* inside `starkode/fileName/fileName_address.json`
    
    ![declare-and-deploy-contract.gif](https://github.com/7finney/starkode/assets/13261372/a2947e99-98e8-48a4-a501-fbeaf243dad6)
    

8. **Call contact method (Cairo 1.0):**
    - Call contract methods present in cairo contract.
    - Immutable functions can be called by just selecting the contract.
    - Mutable functions can be called by entering values in the JSON file `starkode/fileName/fileName_abi.json`.
    
    ![function-call.gif](https://github.com/7finney/starkode/assets/13261372/d7e000c5-ca3c-4f41-8ad5-30fdb3082ad1)