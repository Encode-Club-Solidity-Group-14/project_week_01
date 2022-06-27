import { expect } from "chai";
import { ethers } from "hardhat";
// eslint-disable-next-line node/no-missing-import
import { Ballot } from "../../typechain";

const PROPOSALS = ["Proposal 1", "Proposal 2", "Proposal 3"];

function convertStringArrayToBytes32(array: string[]) {
  const bytes32Array = [];
  for (let index = 0; index < array.length; index++) {
    bytes32Array.push(ethers.utils.formatBytes32String(array[index]));
  }
  return bytes32Array;
}

function randomVote(){
  return Math.floor(Math.random() * 2);
}

async function giveRightToVote(ballotContract: Ballot, voterAddress: any) {
  const tx = await ballotContract.giveRightToVote(voterAddress);
  await tx.wait();
}

describe("Ballot", function () {
  let ballotContract: Ballot;
  let accounts: any[];

  beforeEach(async function () {
    accounts = await ethers.getSigners();
    const ballotFactory = await ethers.getContractFactory("Ballot");
    ballotContract = await ballotFactory.deploy(
      convertStringArrayToBytes32(PROPOSALS)
    );
    await ballotContract.deployed();
  });

  describe("when the contract is deployed", function () {
    it("has the provided proposals", async function () {
      for (let index = 0; index < PROPOSALS.length; index++) {
        const proposal = await ballotContract.proposals(index);
        expect(ethers.utils.parseBytes32String(proposal.name)).to.eq(
          PROPOSALS[index]
        );
      }
    });

    it("has zero votes for all proposals", async function () {
      for (let index = 0; index < PROPOSALS.length; index++) {
        const proposal = await ballotContract.proposals(index);
        expect(proposal.voteCount.toNumber()).to.eq(0);
      }
    });

    it("sets the deployer address as chairperson", async function () {
      const chairperson = await ballotContract.chairperson();
      expect(chairperson).to.eq(accounts[0].address);
    });

    it("sets the voting weight for the chairperson as 1", async function () {
      const chairpersonVoter = await ballotContract.voters(accounts[0].address);
      expect(chairpersonVoter.weight.toNumber()).to.eq(1);
    });
  });

  describe("when the chairperson interacts with the giveRightToVote function in the contract", function () {
    it("gives right to vote for another address", async function () {
      const voterAddress = accounts[1].address;
      const tx = await ballotContract.giveRightToVote(voterAddress);
      await tx.wait();
      const voter = await ballotContract.voters(voterAddress);
      expect(voter.weight.toNumber()).to.eq(1);
    });

    it("can not give right to vote for someone that has voted", async function () {
      const voterAddress = accounts[1].address;
      await giveRightToVote(ballotContract, voterAddress);
      await ballotContract.connect(accounts[1]).vote(0);
      await expect(
        giveRightToVote(ballotContract, voterAddress)
      ).to.be.revertedWith("The voter already voted.");
    });

    it("can not give right to vote for someone that already has voting rights", async function () {
      const voterAddress = accounts[1].address;
      await giveRightToVote(ballotContract, voterAddress);
      await expect(
        giveRightToVote(ballotContract, voterAddress)
      ).to.be.revertedWith("");
    });
  });

  describe("when the voter interact with the vote function in the contract", function () {
    it("Has no right to vote", async function () {
      const voterAddress = accounts[2].address;
      await expect(
        ballotContract.connect(accounts[2]).vote(0)
      ).to.be.revertedWith("Has no right to vote");
    });
    
    it("cannot vote more than once", async function () {
      const voterAddress = accounts[3].address;
      const tx = await ballotContract.giveRightToVote(voterAddress);
      await tx.wait();
      await ballotContract.connect(accounts[3]).vote(0);
      await expect(
        ballotContract.connect(accounts[3]).vote(0)
      ).to.be.revertedWith("Already voted.");
    });

    it("sets proposal vote count index 1 as 1", async function () {
      const voterAddress = accounts[4].address;
      const tx = await ballotContract.giveRightToVote(voterAddress);
      await tx.wait();
      await ballotContract.connect(accounts[4]).vote(1);
      const proposal = await ballotContract.proposals(1);
      expect(proposal.voteCount.toNumber()).to.eq(1);
    });
  });

  describe("when the voter interact with the delegate function in the contract", function () {
    it("cannot delegate when has already voted", async function () {
      const voterAddress = accounts[1].address;
      const voterDelagatedAddress = accounts[2].address;
      const tx = await ballotContract.giveRightToVote(voterAddress);
      await tx.wait();
      await ballotContract.connect(accounts[1]).vote(0);
      await expect(
        ballotContract.connect(accounts[1]).delegate(voterDelagatedAddress)
      ).to.be.revertedWith("You already voted.");
    });

    it("cannot delegate to itself", async function () {
      const voterAddress = accounts[3].address;
      const tx = await ballotContract.giveRightToVote(voterAddress);
      await tx.wait();
      await expect(
        ballotContract.connect(accounts[3]).delegate(voterAddress)
      ).to.be.revertedWith("Self-delegation is disallowed.");
    });

    it("cannot delegate in loop", async function () {
      const voterAddress = accounts[4].address;
      const voterDelagatedAddress = accounts[5].address;
      const voterDelagatedTwoAddress = accounts[6].address;
      const tx = await ballotContract.giveRightToVote(voterAddress);
      const tx2 = await ballotContract.giveRightToVote(voterDelagatedAddress);
      const tx3 = await ballotContract.giveRightToVote(voterDelagatedTwoAddress);
      await tx.wait();
      await tx2.wait();
      await tx3.wait();
      await ballotContract.connect(accounts[4]).delegate(voterDelagatedAddress);
      await ballotContract.connect(accounts[5]).delegate(voterDelagatedTwoAddress);
      await expect(
        ballotContract.connect(accounts[6]).delegate(voterAddress)
      ).to.be.revertedWith("Found loop in delegation.");
    });

    it("cannot delegate to wallets that cannot vote", async function () {
      const voterAddress = accounts[1].address;
      const voterDelagatedAddress = accounts[2].address;
      const tx = await ballotContract.giveRightToVote(voterAddress);
      await tx.wait();
      await expect(
        ballotContract.connect(accounts[1]).delegate(voterDelagatedAddress)
      ).to.be.revertedWith("");
    });
  });

  describe("when the an attacker interact with the giveRightToVote function in the contract", function () {
    it("cannot give right to vote if is not the chairperson", async function () {
      const voterAddress = accounts[2].address;
      await expect(
        ballotContract.connect(accounts[3]).giveRightToVote(voterAddress)
      ).to.be.revertedWith("Only chairperson can give right to vote.");
    });
  });

  describe("when the an attacker interact with the vote function in the contract", function () {
    it("Has no right to vote", async function () {
      await expect(
        ballotContract.connect(accounts[2]).vote(0)
      ).to.be.revertedWith("Has no right to vote");
    });
  });

  describe("when the an attacker interact with the delegate function in the contract", function () {
    it("cannot delegate", async function () {
      const attacker = accounts[2].address;
      await expect(
        ballotContract.connect(accounts[3]).delegate(attacker)
      ).to.be.revertedWith("");
    });
  });

  describe("when someone interact with the winningProposal function before any votes are cast", function () {
    it("It retrieves the first proposal", async function () {
      const proposal = await ballotContract.winningProposal();
      expect(proposal).to.eq(0);
    });
  });

  describe("when someone interact with the winningProposal function after one vote is cast for the first proposal", function () {
    it("It retrieves the first proposal", async function () {
      const voterAddress = accounts[4].address;
      const tx = await ballotContract.giveRightToVote(voterAddress);
      await tx.wait();
      await ballotContract.connect(accounts[4]).vote(0);
      const proposal = await ballotContract.winningProposal();
      expect(proposal).to.eq(0);
    });
  });

  describe("when someone interact with the winnerName function before any votes are cast", function () {
    it("It retrieves the first proposal name", async function () {
      const proposal = await ballotContract.winnerName();
      expect(ethers.utils.parseBytes32String(proposal)).to.eq("Proposal 1");
    });
  });

  describe("when someone interact with the winnerName function after one vote is cast for the first proposal", function () {
    it("It retrieves the first proposal name", async function () {
      const voterAddress = accounts[4].address;
      const tx = await ballotContract.giveRightToVote(voterAddress);
      await tx.wait();
      await ballotContract.connect(accounts[4]).vote(0);
      const proposal = await ballotContract.winnerName();
      expect(ethers.utils.parseBytes32String(proposal)).to.eq("Proposal 1");
    });
  });

  describe("when someone interact with the winningProposal function and winnerName after 5 random votes are cast for the proposals", function () {

    it("is not implemented", async function () {
      const voterAddress1 = accounts[1].address;
      const voterAddress2 = accounts[2].address;
      const voterAddress3 = accounts[3].address;
      const voterAddress4 = accounts[4].address;
      const voterAddress5 = accounts[5].address;
      
      const tx1 = await ballotContract.giveRightToVote(voterAddress1);
      await tx1.wait();
      
      const tx2 = await ballotContract.giveRightToVote(voterAddress2);
      await tx2.wait();
      
      const tx3 = await ballotContract.giveRightToVote(voterAddress3);
      await tx3.wait();
      
      const tx4 = await ballotContract.giveRightToVote(voterAddress4);
      await tx4.wait();
      
      const tx5 = await ballotContract.giveRightToVote(voterAddress5);
      await tx5.wait();

      await ballotContract.connect(accounts[1]).vote(randomVote());
      await ballotContract.connect(accounts[2]).vote(randomVote());
      await ballotContract.connect(accounts[3]).vote(randomVote());
      await ballotContract.connect(accounts[4]).vote(randomVote());
      await ballotContract.connect(accounts[5]).vote(randomVote());

      const proposal = await ballotContract.winningProposal();
      const proposalName = await ballotContract.winnerName();

      expect(proposal).not.empty;
      expect(proposalName).not.empty;
    });
  });
});