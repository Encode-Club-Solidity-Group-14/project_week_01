import { ethers } from "hardhat";

const EXPOSED_KEY = "NOT_USED";

export async function buildWallet() {
    const wallet = process.env.MNEMONIC && process.env.MNEMONIC.length > 0
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
    return signer;
  }
  