const HachiToken = artifacts.require("HACHINFT");

const chai = require("./setupchai.js");
const BN = web3.utils.BN;
const expect = chai.expect;

require("dotenv").config({path: "/Users/bryantbackus/Documents/ABackusCryptoDynasty/Projects/.env"});

//From Openzepplin
const { constants, expectEvent, expectRevert } = require('@openzeppelin/test-helpers');
const { ZERO_ADDRESS } = constants;


contract("ERC2981", async (accounts) => {

    const [deployerAccount, Account2, Account3, Account4, Account5, Account6, Account7, Account8, Account9, Account10] = accounts;

    const IPFSLink = "ipfs://QmQ6tZha8rMRE1SjdfjWGDZiUrzPcRfxxESDHuQABbZDS8?"

    const royaltyFraction = new BN('3');
    const salePrice = web3.utils.toWei("0.1","ether")

    it('checks royalty is set', async() => {
        let instance = await HachiToken.deployed();
        await instance.setDefaultRoyalty(deployerAccount, royaltyFraction);
        const royalty = new BN((salePrice * royaltyFraction) / 10000);
  
        const initInfo = await instance.royaltyInfo(1, salePrice);
  
        expect(initInfo[0]).to.be.equal(deployerAccount);
        expect(initInfo[1]).to.be.bignumber.equal(royalty);
      });
  
      it('updates royalty amount', async() => {
        const newPercentage = new BN('25');

        let instance = await HachiToken.deployed();
        await instance.setDefaultRoyalty(deployerAccount, royaltyFraction);
  
        // Updated royalty check
        await instance.setDefaultRoyalty(deployerAccount, newPercentage);
        const royalty = new BN((salePrice * newPercentage) / 10000);
        const newInfo = await instance.royaltyInfo(1, salePrice);
  
        expect(newInfo[0]).to.be.equal(deployerAccount);
        expect(newInfo[1]).to.be.bignumber.equal(royalty);
      });
  
      it('holds same royalty value for different tokens', async() => {
        const newPercentage = new BN('20');
        let instance = await HachiToken.deployed();
        await instance.setDefaultRoyalty(deployerAccount, royaltyFraction);
        await instance.setDefaultRoyalty(deployerAccount, newPercentage);
  
        const token1Info = await instance.royaltyInfo(1, salePrice);
        const token2Info = await instance.royaltyInfo(2, salePrice);
  
        expect(token1Info[1]).to.be.bignumber.equal(token2Info[1]);
      });
  
      it('reverts if invalid parameters', async() => {
        let instance = await HachiToken.deployed();
        await instance.setDefaultRoyalty(deployerAccount, royaltyFraction);
        await expectRevert(
            instance.setDefaultRoyalty(ZERO_ADDRESS, royaltyFraction),
          'ERC2981: invalid receiver',
        );
  
        await expectRevert(
            instance.setDefaultRoyalty(deployerAccount, new BN('11000')),
            'ERC2981: royalty fee will exceed salePrice',
        );
      });

});

contract("Ownable", async (accounts) => {

    const [deployerAccount, Account2, Account3, Account4, Account5, Account6, Account7, Account8, Account9, Account10] = accounts;

    it('has an owner', async() => {
        let instance = await HachiToken.deployed();
        expect(await instance.owner()).to.equal(deployerAccount);
    });
    
    describe('transfer ownership', async() => {
        it("Non-Owner should not be able to transfer ownership", async() => {
            let instance = await HachiToken.deployed();
    
            return expect(instance.transferOwnership(Account2, {from: Account2})).to.eventually.be.rejected;
        })
    
        it("Owner can transfer Ownership", async() => {
            let instance = await HachiToken.deployed();
    
            expect(instance.owner()).to.eventually.equal(deployerAccount);
            return expect(instance.transferOwnership(Account2,{from: deployerAccount})).to.eventually.be.fulfilled;
        })
    
        it("Ownership should be transferred", async() => {
            let instance = await HachiToken.deployed();
    
            return expect(instance.owner()).to.eventually.equal(Account2);
        })
      });
    
    describe('renounce ownership', async() =>  {
        it("Non-Owner should not be able to reounce ownership", async() => {
            let instance = await HachiToken.deployed();
    
            return expect(instance.renounceOwnership({from: Account3})).to.eventually.be.rejected;
        })

        it("Owner can renounce Ownership", async() => {
            let instance = await HachiToken.deployed();
    
            return expect(instance.renounceOwnership({from: Account2})).to.eventually.be.fulfilled;
        })
    
        it("Ownership has been renounced", async() => {
            let instance = await HachiToken.deployed();
    
            return expect(instance.owner()).to.eventually.equal("0x0000000000000000000000000000000000000000");
        });
    });
});

contract("Pausable", async (accounts) => {

    const [pauser, Account2, Account3, Account4, Account5, Account6, Account7, Account8, Account9, Account10] = accounts;

    const updatedSalePrice = web3.utils.toWei("0.2","ether")

    describe('when paused', async() => {

        it('Is paused', async() => {
            let instance = await HachiToken.deployed();
            return expect(instance.paused()).to.eventually.be.true;
        });

        it('Can perform normal process in pause (update mint price)', async() => {
            let instance = await HachiToken.deployed();
            await expect(instance.updateMintPrice(updatedSalePrice, {from: pauser})).to.eventually.to.be.fulfilled;
            const readPrice = await instance.mintPrice();
            return expect(readPrice).to.be.bignumber.equal(new BN(updatedSalePrice.toString()));
        });

        it('Reverts when re-pausing', async() =>  {
            let instance = await HachiToken.deployed();
            return expect(instance.pause()).to.eventually.be.rejected;
        });
    });
    
    describe('Unpausing', async() => {
        it('Is not unpausable by the non-owner', async() =>  {
            let instance = await HachiToken.deployed();
            return expect(instance.unpause({from: Account10})).to.eventually.be.rejected;
        });

        it('Is unpausable by the pauser and emits event', async() =>  {
            let instance = await HachiToken.deployed();
            this.receipt = await instance.unpause({from: pauser});
            await expectEvent(this.receipt,'Unpaused', { account: pauser });
            return expect(instance.paused()).to.eventually.be.false;
        });
    });

    describe('When unpaused', async() => {
        it('Reverts when re-unpausing', async() => {
            let instance = await HachiToken.deployed();
            await expectRevert(instance.unpause(), 'Pausable: not paused');
        });

        it("Can perform a normal action (update Address mint limit)", async() => {
            let instance = await HachiToken.deployed();
            var readLimit = await instance.addressMintLimit();
            expect(readLimit).to.be.a.bignumber.equal(new BN("3"));
            await expect(instance.updateAddressMintLimit(5, {from: pauser})).to.eventually.to.be.fulfilled;
            readLimit = await instance.addressMintLimit();
            return expect(readLimit).to.be.bignumber.equal(new BN("5"));
        });
    });

    describe('Pausing', async() => {


        it('emits a Paused event', async() => {
            let instance = await HachiToken.deployed();
            this.receipt = await instance.pause({from: pauser});
            expectEvent(this.receipt, 'Paused', { account: pauser });
        });
    });
});

contract("Check State", async (accounts) => {

    const [deployerAccount, Account2, Account3, Account4, Account5, Account6, Account7, Account8, Account9, Account10] = accounts;

    const salePrice = web3.utils.toWei("0.1","ether");
    const MintLimit = 8000;
    const URI = "https://ipfs.io/ipfs/QmX8w2EPzFhb5uZ9j87V5nVPVV6To1bNLcEKZJry6NzsHb?filename=HachiContractURI.json"
    const addrlim = 3;

    context('Check intial values of variables', async() => {
        it('mintPrice', async() => {
            let instance = await HachiToken.deployed();
            const read = await instance.mintPrice();
            return expect(read).to.be.bignumber.equal(new BN(salePrice.toString()));
        });

        it('mintLimit', async() => {
            let instance = await HachiToken.deployed();
            const read = await instance.mintLimit();
            return expect(read).to.be.bignumber.equal(new BN(MintLimit.toString()));
        });

        it('addressMintLimit', async() => {
            let instance = await HachiToken.deployed();
            const read = await instance.addressMintLimit();
            return expect(read).to.be.a.bignumber.equal(new BN(addrlim.toString()));
        });

        it('publicMint', async() => {
            let instance = await HachiToken.deployed();
            return expect(instance.publicMint()).to.eventually.be.false;
        });

        it('contractURI', async() => {
            let instance = await HachiToken.deployed();
            return expect(instance.contractURI()).to.eventually.be.equal(URI);
        });

        it('meta data reveal', async() => {
            let instance = await HachiToken.deployed();
            return expect(instance.metaDataReveal()).to.eventually.be.false;
        });

        it('Supports IERC1155', async() => {
            let instance = await HachiToken.deployed();
            return expect(instance.supportsInterface("0xd9b67a26")).to.eventually.be.true;
        })

        it('Supports IERC1155', async() => {
            let instance = await HachiToken.deployed();
            return expect(instance.supportsInterface("0x01ffc9a7")).to.eventually.be.true;
        })
    });

    describe('Non-Owners cannot update Variables', async() => {
        it("Non-owner update set generic meta data rejected", async() => {
            let instance = await HachiToken.deployed();
            return expect(instance.setGenericMeta("Test",{from: Account10})).to.eventually.be.rejected;
        });

        it("Non-owner update set meta data reveal rejected", async() => {
            let instance = await HachiToken.deployed();
            return expect(instance.setMetaDataReveal(true,{from: Account9})).to.eventually.be.rejected;
        });

        it("Non-owner update set URI rejected", async() => {
            let instance = await HachiToken.deployed();
            return expect(instance.setURI("test",{from: Account8})).to.eventually.be.rejected;
        });

        it("Non-owner update address mint limit rejected", async() => {
            let instance = await HachiToken.deployed();
            return expect(instance.updateAddressMintLimit(9,{from: Account7})).to.eventually.be.rejected;
        });

        it("Non-owner update update mint Price rejected", async() => {
            let instance = await HachiToken.deployed();
            return expect(instance.updateMintPrice(web3.utils.toWei("0.5", "ether"),{from: Account6})).to.eventually.be.rejected;
        });

        it("Non-owner update rejected public Mint", async() => {
            let instance = await HachiToken.deployed();
            return expect(instance.updatePublicMint(true,{from: Account6})).to.eventually.be.rejected;
        });
    })

    describe('Update Variables from owner', async() => {
        it("Set generic meta data", async() => {
            let instance = await HachiToken.deployed();
            return expect(instance.setGenericMeta("Test",{from: deployerAccount})).to.eventually.be.fulfilled;
        });

        it("Set meta data reveal", async() => {
            let instance = await HachiToken.deployed();
            var reveal = await instance.metaDataReveal();
            expect(reveal).to.be.false;
            await expect(instance.setMetaDataReveal(true,{from: deployerAccount})).to.eventually.be.fulfilled;
            reveal = await instance.metaDataReveal();
            return expect(reveal).to.be.true
        });

        it("Set URI", async() => {
            let instance = await HachiToken.deployed();
            await instance.setMetaDataReveal(false,{from: deployerAccount})
            await expect(instance.setURI("Test",{from: deployerAccount})).to.eventually.be.fulfilled;
            await instance.setURI("Test",{from: deployerAccount});
            const uri = await instance.uri(0);
            return expect(uri).to.be.equal("Test");
        });

        it("Update address mint limit", async() => {
            let instance = await HachiToken.deployed();
            await expect(instance.updateAddressMintLimit(9,{from: deployerAccount})).to.eventually.be.fulfilled;
            const lim = await instance.addressMintLimit();
            return expect(lim).to.be.a.bignumber.equal(new BN("9"));
        });

        it("Update update mint Price", async() => {
            let instance = await HachiToken.deployed();
            const mintPrice = web3.utils.toWei("0.5","ether");
            await expect(instance.updateMintPrice(mintPrice,{from: deployerAccount})).to.eventually.be.fulfilled;
            price = await instance.mintPrice();
            return expect(price).to.be.a.bignumber.equal(new BN(mintPrice.toString()))
        });

        it("Update public Mint", async() => {
            let instance = await HachiToken.deployed();
            var mint = await instance.publicMint();
            expect(mint).to.be.false;
            await  expect(instance.updatePublicMint(true,{from: deployerAccount})).to.eventually.be.fulfilled;
            mint = await instance.publicMint();
            return expect(mint).to.be.true;
        });
    })
});
