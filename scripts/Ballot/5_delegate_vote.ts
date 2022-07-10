import { Contract, ethers } from "ethers";
import "dotenv/config";
import * as ballotJson from "../../artifacts/contracts/Ballot.sol/Ballot.json";
import { Ballot } from "../../typechain";
import { buildWallet } from "./utils/Wallet";

const EXPOSED_KEY = "NOT_USED";
//Create wallet object
async function main() {
  const signer = await buildWallet();
  //Index 0 = Path of script, Index 1 = File being executed, Index 2 = Ballot Address, Index 3 = Delegated address passed in,
  if (process.argv.length < 3) {
    throw new Error("Ballot address missing");
  }
  //Index 2 = Ballot Address
  const ballotAddress = process.argv[2];
  //Index 3 = Delegated address passed in, is length is less than 4 then no delegated address is passed in
  if (process.argv.length < 4){ 
    throw new Error("Delegated address missing");
  }
  //Index 3 = Delegated address passed in
  const delegatedAddress = process.argv[3];
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

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
