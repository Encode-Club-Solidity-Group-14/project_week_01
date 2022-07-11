import { ethers } from "hardhat";
import * as ballotJson from "../../artifacts/contracts/Ballot.sol/Ballot.json";
import { buildWallet } from "./utils/Wallet";

//Convert Strings to Bytes32 to save gas fee
function convertStringArrayToBytes32(array: string[]) {
  const bytes32Array = [];
  for (let index = 0; index < array.length; index++) {
    bytes32Array.push(ethers.utils.formatBytes32String(array[index]));
  }
  return bytes32Array;
}

export async function deploy(proposals: string[]) {
  const signer = await buildWallet();
  console.log("Deploying Ballot contract");
  console.log("Proposals: ");
  //If length is under 2 no proposal is provided
  if (proposals.length < 2) {
    throw new Error("Not enough proposals provided");
  }
  //For each proposal display proposal name and index position
  proposals.forEach((element, index) => {
    console.log(`Proposal N. ${index + 1}: ${element}`);
  });
  //Deploy contract to blockchain obtaining abi and bytecode from ballot.json
  const ballotFactory = new ethers.ContractFactory(
    ballotJson.abi,
    ballotJson.bytecode,
    signer
  );
  //Create contract instance and pass proposals parameter in
  const ballotContract = await ballotFactory.deploy(
    convertStringArrayToBytes32(proposals)
  );
  console.log("Awaiting confirmations");
  //Contract deployed
  await ballotContract.deployed();
  //Display ballot contract address
  console.log("Completed");
  console.log(`Contract deployed at ${ballotContract.address}`);
}
