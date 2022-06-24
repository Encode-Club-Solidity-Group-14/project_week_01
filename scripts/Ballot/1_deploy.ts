import { ethers } from "hardhat";
import * as ballotJson from "../../artifacts/contracts/Ballot.sol/Ballot.json";

const EXPOSED_KEY = "NOT_USED";

function convertStringArrayToBytes32(array: string[]) {
  const bytes32Array = [];
  for (let index = 0; index < array.length; index++) {
    bytes32Array.push(ethers.utils.formatBytes32String(array[index]));
  }
  return bytes32Array;
}

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

  console.log("Deploying Ballot contract");
  console.log("Proposals: ");

  const proposals = process.argv.slice(2);

  if (proposals.length < 2){
    throw new Error("Not enough proposals provided");
  } 

  proposals.forEach((element, index) => {
    console.log(`Proposal N. ${index + 1}: ${element}`);
  });

  
  const ballotFactory = new ethers.ContractFactory(
    ballotJson.abi,
    ballotJson.bytecode,
    signer
  );

  const ballotContract = await ballotFactory.deploy(
    convertStringArrayToBytes32(proposals)
  );

  console.log("Awaiting confirmations");
  
  await ballotContract.deployed();
  
  console.log("Completed");
  console.log(`Contract deployed at ${ballotContract.address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
