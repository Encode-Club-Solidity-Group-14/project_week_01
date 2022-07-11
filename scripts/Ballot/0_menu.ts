import { ethers } from "hardhat";
import * as readline from "readline";
import * as ballotJson from "../../artifacts/contracts/Ballot.sol/Ballot.json";
import { deploy } from "./1_deploy";
import { queryProposal } from "./2_quey_proposals";
import { giveVoteRights } from "./3_give_vote_rights";
import { castVote } from "./4_cast_vote";
import { delegateVote } from "./5_delegate_vote";
import { votingResults } from "./6_query_voting_results";

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
          console.log("Closing...");
          rl.close();
          return;
        case 1:
          rl.question(
            "Input at least 2 proposals\n",
            async (entryProposals) => {
              try {
                const proposals: string[] = entryProposals.split(" ");
                await deploy(proposals);
              } catch (error) {
                console.log("error\n");
                console.log({ error });
              }
              mainMenu(rl);
            }
          );
          break;
        case 2:
          rl.question("Input ballot address\n", async (ballotAddress) => {
            rl.question("Input proposal index number\n", async (proposalIndex) => {
              try {
                await queryProposal(ballotAddress, proposalIndex);
              } catch (error) {
                console.log("error\n");
                console.log({ error });
              }
              mainMenu(rl);
            });
          });
          break;
        case 3:
          rl.question("Input ballot address\n", async (ballotAddress) => {
            rl.question("Input voter address\n", async (voterAddress) => {
              try {
                await giveVoteRights(ballotAddress, voterAddress);
              } catch (error) {
                console.log("error\n");
                console.log({ error });
              }
              mainMenu(rl);
            });
          });
          break;
        case 4:
          rl.question("Input ballot address\n", async (ballotAddress) => {
            rl.question("Input proposal index\n", async (proposalIndex) => {
              try {
                await castVote(ballotAddress, proposalIndex);
              } catch (error) {
                console.log("error\n");
                console.log({ error });
              }
              mainMenu(rl);
            });
          });
          break;
        case 5:
          rl.question("Input ballot address\n", async (ballotAddress) => {
            rl.question("Input delegate address\n", async (delegateAddress) => {
              try {
                await delegateVote(ballotAddress, delegateAddress);
              } catch (error) {
                console.log("error\n");
                console.log({ error });
              }
              mainMenu(rl);
            });
          });
          break;
        case 6:
          rl.question("Input ballot address\n", async (ballotAddress) => {
            try {
              await votingResults(ballotAddress);
            } catch (error) {
              console.log("error\n");
              console.log({ error });
            }
            mainMenu(rl);
          });
          break;
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
