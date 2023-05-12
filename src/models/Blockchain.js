import SHA256 from 'crypto-js/sha256';
// Blockchain
class Blockchain {
  // 1. 完成构造函数及其参数
  /* 构造函数需要包含 
      - 名字 : name
      - 创世区块 : genesisBlock
      - 存储区块的映射
  */
  constructor(name,genesisBlock) {
    this.name = name;
    this.blockchain = new Map();
    this.addBlock(genesisBlock);
  }
  //2.定义 addBlock 函数
  /* 
    参数 block 是一个对象，包含以下信息:
      - id: 区块的编号
      - timestamp: 区块的时间戳
      - data: 区块的数据
      - previousHash: 前一个区块的哈希值
    在将区块添加到链中时，还需要计算它的哈希值，并与 previousHash 进行比较。
  */
 addBlock(block){
  //如果当前链上没有区块则新add进去的区块为创世区块
  if(this.blockchain.size == 0){
    block.hash = this.generateHash(block);//计算创世区块的hash值
    this.blockchain.set(block.id,block);
  }
  //如果至少有一个区块，则进行验证并添加新区块
    let previousHash = this.blockchain.get(block.previousHash);
    if(!previousHash){
      throw new Error(`Cannot add block ${block.id} to the Blockchain. previous block not found.`);
    }
    block.hash = this.generateHash(block);
    if(previousBlock.hash != block.previousHash){
      throw new Error(`Cannot add block ${block.id} to the Blockchain. previous block hash does not match.`);
    }
    this.blockchain.set(block.id,block);
 }
  // 3. 定义 generateHash 函数
  /*
    这个函数需要使用 SHA256 算法将区块的数据哈希化
  */
  generateHash(block){
    const SHA256 = require('SHA256');
    return SHA256(block.id + block.timestamp + block.data + block.previousHash);
  }
  // 4. 定义 longestChain 函数
  /* 
    返回当前链中最长的区块信息列表
  */
  longestChain() {
    const chain = [];
    let currentBlock = null;

    // 寻找最后一个区块
    for (let [key, value] of this.blockchain) {
      if (currentBlock === null) {
        currentBlock = value;
        continue;
      }

      if (value.timestamp > currentBlock.timestamp) {
        currentBlock = value;
      }
    }

    chain.push(currentBlock);

    // 依次找到该区块的所有上一个区块并添加到数组中
    while (currentBlock.previousHash !== null) {
      let previousBlock = this.blockchain.get(currentBlock.previousHash);
      if (!previousBlock) {
        throw new Error(`Cannot find previous block ${currentBlock.previousHash}.`);
      }

      chain.push(previousBlock);
      currentBlock = previousBlock;
    }

    return chain;

  }
}

export default Blockchain
