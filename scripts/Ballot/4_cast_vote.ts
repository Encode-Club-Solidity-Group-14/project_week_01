import { Contract, ethers } from "ethers";
import "dotenv/config";
import * as ballotJson from "../../artifacts/contracts/Ballot.sol/Ballot.json";
import { Ballot } from "../../typechain";
import { buildWallet } from "./utils/Wallet";

export async function castVote(ballotAddress: string, proposalIndex: string) {
  //Create wallet object
  const signer = await buildWallet();
  //Check for ballotAddress parameter
  if (ballotAddress === undefined || ballotAddress === "") {
    throw new Error("Ballot address missing");
  }
  //Check for proposalIndex parameter
  if (proposalIndex === undefined || proposalIndex === "") {
    throw new Error("Proposal index missing");
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
  //Set proposal as proposal index defined in queryProposal function in ballotContract
  const proposal = await ballotContract.queryProposal(proposalIndex);
  //Display proposal index
  console.log("Proposal chosen: " + ethers.utils.parseBytes32String(proposal));
  //Cast vote by calling vote function passing in proposal index in ballot contract
  const tx = await ballotContract.vote(proposalIndex);
  console.log("Awaiting confirmations");
  await tx.wait();
  //Display tx hash
  console.log(`Transaction completed. Hash: ${tx.hash}`);
}

