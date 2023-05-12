class Block {
  // 1. 完成构造函数及其参数
  /* 构造函数需要包含
      1.区块编号id
      2.区块时间戳timestamp
      3.区块数据data
      4.前一区块哈希previousHash
  */
  constructor(id,timestamp,data,previousHash) {
        this.id = id;
        this.timestamp = timestamp;
        this.data = data;
        this.previoushash = previousHash;
        this.hash = null;
  }
}

export default Block
