const { default: MerkleTree } = require("merkletreejs");
// const importedTree = require("merkleTree.json")

function readMerkleTree(_readTree) {
    let _convertedMerkleTree = convertLeavesToBuffer(_readTree);
    _convertedMerkleTree = convertLayersToBuffer(_convertedMerkleTree);
    return Object.setPrototypeOf(_convertedMerkleTree, MerkleTree.prototype);
};

function convertLeavesToBuffer(_tree) {
    for (let i=0; i<_tree.leaves.length; i++) {
        _tree.leaves[i] = Buffer.from(_tree.leaves[i]);
    };
    return _tree;
};

function convertLayersToBuffer(_tree) {
    for (let i=0; i<_tree.layers.length; i++) {
        for (let j=0; j<_tree.layers[i].length; j++) {
            _tree.layers[i][j] = Buffer.from(_tree.layers[i][j]);
        };
    };
    return _tree
};

module.exports = readMerkleTree;