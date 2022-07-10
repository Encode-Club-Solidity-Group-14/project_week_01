import { Contract, ethers } from "ethers";
import "dotenv/config";
import * as ballotJson from "../../artifacts/contracts/Ballot.sol/Ballot.json";
import { Ballot } from "../../typechain";
import { buildWallet } from "./utils/Wallet";

export async function votingResults(ballotAddress: string) {
  //Create wallet object
  const signer = await buildWallet();
  //Check for ballotAddress parameter
  if (ballotAddress === undefined || ballotAddress === "") {
    throw new Error("Ballot address missing");
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
  //Call winnerName in ballot contract
  const winningProposal = await ballotContract.winnerName();
  //Call winnervotecount in ballot contract
  const winningProposalVoteCount = await ballotContract.winnerVoteCount();
  //Convert bytes32 to string and display winning proposal
  console.log("Winning proposal is: " + ethers.utils.parseBytes32String(winningProposal));
  //Display number of votes the winning proposal received
  console.log("Winning proposal votes: " + winningProposalVoteCount);
}

