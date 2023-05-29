class MerkleTree {
    constructor(elements) {
      this.elements = elements.slice()
      this.levels = this.getLevels(elements)
      this.tree = this.getMerkleTree(this.levels)
    }
  
    // 计算Merkle tree的层数并返回每一层的节点数
    getLevels(elements) {
      if (elements.length === 0) {
        throw new Error('Can not construct Merkle tree')
      }
      let levels = []
      while (elements.length > 1) {
        levels.push(elements.length)
        elements = this.getNextLevel(elements)
      }
      levels.push(1)
      return levels
    }
  
    // 算出每一层的哈希节点
    getMerkleTree(levels) {
      let tree = []
      tree[0] = this.elements.map(e => this.hash(e))
      for (let i = 1; i < levels.length; i++) {
        tree[i] = []
        for (let j = 0; j < levels[i]; j++) {
          let left = tree[i - 1][j * 2]
          let right = tree[i - 1][j * 2 + 1] || left
          tree[i].push(this.hash(left + right))
        }
      }
      return tree
    }
  
    // 计算下一层的元素
    getNextLevel(elements) {
      let level = []
      while (elements.length > 0) {
        let left = elements.shift()
        let right = elements.shift() || left
        level.push(this.hash(left + right))
      }
      return level
    }
  
    // 计算元素的哈希值
    hash(value) {
      return CryptoJS.SHA256(value).toString()
    }
  
    // 获取Merkle根节点的哈希值
    getMerkleRoot() {
      return this.tree[this.levels.length - 1][0]
    }
  
    // 验证数据元素是否存在于Merkle树当中
    isElementExist(element) {
      let hash = this.hash(element)
      let index = this.elements.indexOf(element)
      if (index === -1) {
        return false
      }
      for (let i = 0; i < this.levels.length; i++) {
        let level = this.tree[i]
        let j = Math.floor(index / Math.pow(2, this.levels.length - i - 1))
        let conflictNode = level[j ^ 1] // 取节点j的相反节点
        if (this.hash(hash + conflictNode) !== level[j]) {
          return false
        }
        hash = this.hash(level[j])
      }
      return true
    }
  
    // 验证证明是否合法
    verifyProof(element, proof) {
      let hash = this.hash(element)
      for (let i = 0; i < proof.length; i++) {
        let sibling = proof[i]
        let j = (element % 2 === 0) ? 1 : -1
        let conflictNode = sibling[j]
        if (j === -1) {
          hash = this.hash(conflictNode + hash)
        } else {
          hash = this.hash(hash + conflictNode)
        }
        element = Math.floor(element / 2)
      }
      return hash === this.getMerkleRoot()
    }
  
    // 获取一个元素的证明
    getProof(index) {
      let siblings = []
      for (let i = 0; i < this.levels.length - 1; i++) {
        let level = this.tree[i]
        let j = Math.floor(index / Math.pow(2, this.levels.length - i - 1))
        let siblingIndex = j ^ 1
        if (level.length > siblingIndex) {
          siblings.push(level[siblingIndex])
        }
        index = Math.floor(index / 2)
      }
      return siblings