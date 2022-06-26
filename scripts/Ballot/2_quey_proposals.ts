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
  //Index 3 = Proposal Index
  if (process.argv.length < 4) {
    throw new Error("Ballot proposal index missing");
  }
  //Store proposals in proposalToQuery
  const proposalToQuery = process.argv[3];
  //Call function queryProposal inputting propocalToQuery paramenter in ballot Contract
  const proposal = await ballotContract.queryProposal(proposalToQuery)
  //Display proposal name converting bytecode to string proposal name
  console.log("Proposal found: " + ethers.utils.parseBytes32String(proposal));

}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
