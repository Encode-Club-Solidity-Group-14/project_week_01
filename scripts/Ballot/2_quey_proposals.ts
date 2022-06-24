import { Contract, ethers } from "ethers";
import "dotenv/config";
import * as ballotJson from "../../artifacts/contracts/Ballot.sol/Ballot.json";
import { Ballot } from "../../typechain";

const EXPOSED_KEY = "NOT_USED";

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

  if (balance < 0.01) {
    throw new Error("Not enough ether");
  }

  if (process.argv.length < 3) {
    throw new Error("Ballot address missing");
  }

  const ballotAddress = process.argv[2];

  console.log(
    `Attaching ballot contract interface to address ${ballotAddress}`
  );

  const ballotContract: Ballot = new Contract(
    ballotAddress,
    ballotJson.abi,
    signer
  ) as Ballot;
  
  if (process.argv.length < 4) {
    throw new Error("Ballot proposal index missing");
  }

  const proposalToQuery = process.argv[3];

  const proposal = await ballotContract.queryProposal(proposalToQuery)
  
  console.log("Proposal found: " + ethers.utils.parseBytes32String(proposal));

}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
