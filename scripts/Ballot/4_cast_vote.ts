import { Contract, ethers } from "ethers";
import "dotenv/config";
import * as ballotJson from "../../artifacts/contracts/Ballot.sol/Ballot.json";
import { Ballot } from "../../typechain";
import { buildWallet } from "./utils/Wallet";

const EXPOSED_KEY = "NOT_USED";

//Create wallet object
async function main() {
  const signer = await buildWallet();
  //Index 0 = Path of script, Index 1 = File being executed, Index 2 = Ballot Address, Index 3 = Proposal Index passed in,
  if (process.argv.length < 3) {
    throw new Error("Ballot address missing");
  }
  //Index 2 = Ballot Address
  const ballotAddress = process.argv[2];
  //Index 3 = Proposal index passed in, is length is less than 4 then no proposal index is passed in
  if (process.argv.length < 4) {
    throw new Error("Proposal index missing");
  }
  //Index 3 = Proposal index passed in
  const proposalIndex = process.argv[3];
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

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
