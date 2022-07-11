const fs = require("fs")
const readline = require("readline");

const keccak256 = require("keccak256");
const { default: MerkleTree } = require("merkletreejs");

outputFile = "merkleTree.json"

genMerkleTree = async() => {

    let csvData = []

    //Readcsv of whitelist addresses
    let stream = fs.createReadStream("../../../../WhitelistAccounts.csv");
    let reader = readline.createInterface({ input: stream });

    reader.on("line", row => {
        // push into the data array
        csvData.push(row.trim());
    });

    reader.on("close", onClose);

    function onClose() {
        let tree = createMerkle(csvData);
        createMerkleTreefileJSON(outputFile,tree);
        //console.log(tree);
    };

    function createMerkle(_addressArray) {
        //Generate Merkle Tree
        let leafNodes = _addressArray.map(_addr => keccak256(_addr));
        let merkleTree = new MerkleTree(leafNodes, keccak256, {sortPairs: true});
        return merkleTree
    };
};

function createMerkleTreefileJSON(_outputFile,_merkleTree) {
    fs.writeFile(_outputFile,JSON.stringify(_merkleTree), (err) => {
        if (err) {
            console.error(err);
            return;
        };
        console.log(_outputFile, "has been written");
    });
};

genMerkleTree()