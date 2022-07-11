import { Contract, ethers } from "ethers";
import "dotenv/config";
import * as ballotJson from "../../artifacts/contracts/Ballot.sol/Ballot.json";
import { Ballot } from "../../typechain";
import { buildWallet } from "./utils/Wallet";

export async function giveVoteRights(ballotAddress: string, voterAddress: string) {
  //Create wallet object
  const signer = await buildWallet();
  //Check for ballotAddress parameter
  if (ballotAddress === undefined || ballotAddress === "") {
    throw new Error("Ballot address missing");
  }
  //Check for voterAddress parameter
  if (voterAddress === undefined || voterAddress === "") {
    throw new Error("Voter address missing");
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
  //Set chairpersonAddress as address defined in chairperson function in ballotContract
  const chairpersonAddress = await ballotContract.chairperson();
  //If chairpersonAddress is not the address interacting with the contract throw erroe
  if (chairpersonAddress !== signer.address) {
    throw new Error("Caller is not the chairperson for this contract");
  }
  //Display voter address
  console.log(`Giving right to vote to ${voterAddress}`);
  //Call giverRightToVote function passing in voter address in ballot contract
  const tx = await ballotContract.giveRightToVote(voterAddress);
  console.log("Awaiting confirmations");
  await tx.wait();
  //Display tx hash
  console.log(`Transaction completed. Hash: ${tx.hash}`);
}

