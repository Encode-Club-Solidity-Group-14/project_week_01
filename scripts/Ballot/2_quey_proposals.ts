import { Contract, ethers } from "ethers";
import "dotenv/config";
import * as ballotJson from "../../artifacts/contracts/Ballot.sol/Ballot.json";
import { Ballot } from "../../typechain";
import { buildWallet } from "./utils/Wallet";

export async function queryProposal(ballotAddress: string, proposalIndex: string) {
  //Create wallet object
  const signer = await buildWallet();
  //Check for ballotAddress parameter
  if (ballotAddress === undefined || ballotAddress === "") {
    throw new Error("Ballot address missing");
  }
  
  // Display Ballot Address
  console.log(
    `Attaching ballot contract interface to address ${ballotAddress}`
  );
  //Deploy contract to blockchain obtaining abi from ballot.json
  const ballotContract: Ballot = new Contract(
    ballotAddress,
    ballotJson.abi,
    signer
  ) as Ballot;
  //check for Proposal Index
  if (proposalIndex === undefined || proposalIndex === "") {
    throw new Error("Ballot proposal index missing");
  }
  //Call function queryProposal inputting propocalToQuery paramenter in ballot Contract
  const proposal = await ballotContract.queryProposal(proposalIndex);
  //Display proposal name converting bytecode to string proposal name
  console.log("Proposal found: " + ethers.utils.parseBytes32String(proposal));
}