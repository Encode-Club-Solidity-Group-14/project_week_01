import { Contract, ethers } from "ethers";
import "dotenv/config";
import * as ballotJson from "../../artifacts/contracts/Ballot.sol/Ballot.json";
import { Ballot } from "../../typechain";

const EXPOSED_KEY = "NOT_USED";
//Create wallet object
async function main() {
  const wallet =
    process.env.MNEMONIC && process.env.MNEMONIC.length > 0
      ? ethers.Wallet.fromMnemonic(process.env.MNEMONIC)
      : new ethers.Wallet(process.env.PRIVATE_KEY ?? EXPOSED_KEY);
  console.log(`Using address ${wallet.address}`);
  const provider = ethers.providers.getDefaultProvider("ropsten");
  const signer = wallet.connect(provider);
  const balanceBN = await signer.getBalance();
  const balance = Number(ethers.utils.formatEther(balanceBN));
  console.log(`Wallet balance ${balance}`);
  //Throw error if connected wallet has under 0.01 ETH
  if (balance < 0.01) {
    throw new Error("Not enough ether");
  }
  //Index 0 = Path of script, Index 1 = File being executed, Index 2 = Ballot Address, Index 3 = Voter address passed in,
  if (process.argv.length < 3) { 
    throw new Error("Ballot address missing");
  }
  //Index 2 = Ballot Address
  const ballotAddress = process.argv[2];
  //Index 3 = Voter address passed in, is length is less than 4 then no voter address is passed in
  if (process.argv.length < 4){ 
    throw new Error("Voter address missing");
  }
  //Index 3 = Voter address passed in
  const voterAddress = process.argv[3];
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
  //If chairpersonAddress is not the address interacting with the contract throw erroe  (Wiiliam here is typo with e at end of error it needs correcting kas)
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

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
