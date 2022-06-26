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
  //Index 0 = Path of script, Index 1 = File being executed, Index 2 = Ballot Address, Index 3 = Proposal Index passed in,
  if (process.argv.length < 3) {
    throw new Error("Ballot address missing");
  }
  //Index 2 = Ballot Address
  const ballotAddress = process.argv[2];
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

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
