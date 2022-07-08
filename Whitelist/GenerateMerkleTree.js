const fs = require("fs");
const keccak256 = require("keccak256");
const { default: MerkleTree } = require("merkletreejs");

generateMerkleTree = async() => {

    let csvData = null

    fs.readFile("../../WhitelistAccounts.csv",'utf8', function(err, data){
        
        csvData = data;
        // Display the file content
        console.log("Data pulled from CSV\n",data);
    });
};

generateMerkleTree()