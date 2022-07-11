import { Contract, ethers } from "ethers";
import "dotenv/config";
import * as ballotJson from "../../artifacts/contracts/Ballot.sol/Ballot.json";
import { Ballot } from "../../typechain";
import { buildWallet } from "./utils/Wallet";

export async function delegateVote(ballotAddress: string, delegatedAddress: string) {
  //Create wallet object
  const signer = await buildWallet();
  //Check for ballotAddress parameter
  if (ballotAddress === undefined || ballotAddress === "") {
    throw new Error("Ballot address missing");
  }
  //Check for delegateAddress parameter
  if (delegatedAddress === undefined || delegatedAddress === "") {
    throw new Error("Delegated address missing");
  }
  //Display ballot address
  console.log(
    `Attaching ballot contract interface to address ${ballotAddress}`
  );
  //Deploy contract to blockchain obtaining abi from ballot.json
  const ballotContract: Ballot = new Contract(
    ballotAddress,
    ballotJson.abi,
    signer
  ) as Ballot;
  //Display delegated address
  console.log(`Delegating vote to ${delegatedAddress}`);
  //Execute transaction by passing in delegated address in delegate function within the ballot contract
  const tx = await ballotContract.delegate(delegatedAddress);
  console.log("Awaiting confirmations");
  await tx.wait();
  //Display tx hash
  console.log(`Transaction completed. Hash: ${tx.hash}`);
}