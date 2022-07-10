import { ethers } from "hardhat";
import * as readline from "readline";
import * as ballotJson from "../../artifacts/contracts/Ballot.sol/Ballot.json";

const EXPOSED_KEY = "NOT_USED";

async function main() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  mainMenu(rl);
}

async function mainMenu(rl: readline.Interface) {
  menuOptions(rl);
}

function menuOptions(rl: readline.Interface) {
  rl.question(
    " \n " +
    "What you want to do? \n " +
      " Select the options: \n " +
      "[0]: Exit \n " +
      "[1]: Deploy  \n " +
      "[2]: Query Proposals \n " +
      "[3]: Give vote rights \n " +
      "[4]: Cast vote \n " +
      "[5]: Delegate vote \n " +
      "[6]: Query voting results \n ",
    async (answer: string) => {
      console.log(`Selected: ${answer}\n`);
      const option = Number(answer);
      switch (option) {
        case 0:
          rl.close();
          return;
        case 0:
          rl.close();
          return;
        default:
          throw new Error("Invalid option");
      }
    }
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
