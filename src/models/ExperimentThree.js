const { keccak256 } = require("keccak256");

// MPT结点
class MPTNode {
  constructor(nibble, value, flag) {
    this.nibble = nibble; // 边标识
    this.value = value; // 值
    this.flag = flag; // 标志位：0空节点，1中间节点，2叶子节点
  }
}

// MPT
class MPT {
  constructor() {
    this.nodes = {}; // 所有结点
  }

  // 计算一个节点的哈希值
  hashNode(node) {
    return keccak256(
      Buffer.concat([Buffer.from(node.nibble), node.value])
    );
  }

  // 计算一个节点的边标识（nibble的最后一位）
  edge(node) {
    return node.nibble[node.nibble.length - 1];
  }

  // 找到一个节点的父节点
  parent(node) {
    let len = node.nibble.length;
    if (len == 1) {
      return null;
    }
    let parentNibble = node.nibble.slice(0, len - 1);
    return this.getNode(parentNibble);
  }

  // 找到一个节点的父节点的边标识
  parentEdge(node) {
    let len = node.nibble.length;
    if (len == 1) {
      return null;
    }
    return node.nibble[len - 2];
  }

  // 找到一个节点
  getNode(nibble) {
    let nodeKey = keccak256(nibble);
    return this.nodes[nodeKey];
  }

  // 插入一个节点
  insertNode(nibble, value, flag) {
    let currentNode = keccak256(nibble);
    let node = new MPTNode(nibble, value, flag);
    this.nodes[currentNode] = node;
    return node;
  }

  // 将所有节点哈希计算出来，并计算出root值
  computeRoot() {
    let stack = Object.values(this.nodes);
    while (stack.length > 1) {
      let node1 = stack.pop();
      let node2 = stack.pop();
      let parentNode = new MPTNode(
        node1.nibble.slice(0, -1),
        Buffer.concat([this.hashNode(node1), this.hashNode(node2)]),
        1
      );
      let parentKey = keccak256(parentNode.nibble);
      this.nodes[parentKey] = parentNode;
      stack.push(parentNode);
    }
    return stack[0] ? this.hashNode(stack[0]) : Buffer.from("");
  }

  // 添加或更新一个地址
  addOrUpdateAddress(address, balance) {
    let addrHash = keccak256(address);
    let nibble = Buffer.from(addrHash);
    let node = this.getNode(nibble);
    if (!node) {
      node = this.insertNode(nibble, Buffer.from(balance), 2);
    } else {
      node.value = Buffer.from(balance);
      node.flag = 2;
    }
    let parentNode = this.parent(node);
    let parentEdge = this.parentEdge(node);
    while (parentNode) {
      let hashValue = this.hashNode(node);
      let parentNodeKey = keccak256(parentNode.nibble);
      let parentChild = this.getNode(
        Buffer.concat([parentNode.nibble, Buffer.from([parentEdge])])
      );
      if (!parentChild) {
        parentChild = this.insertNode(
          Buffer.concat([parentNode.nibble, Buffer.from([parentEdge])]),
          hashValue,
          1
        );
      } else {
        parentChild.value = Buffer.concat([
          parentChild.value.slice(0, -32),
          hashValue,
        ]);
      }
      node = parentChild;
      parentNode = this.parent(node);
      parentEdge = this.parentEdge(node);
    }
  }

  // 验证MPT数据
  verifyAddress(address, balance) {
    let addrHash = keccak256(address);
    let nibble = Buffer.from(addrHash);
    let node = this.getNode(nibble);
    if (!node) {
      return false;
    } else {
      return Buffer.compare(node.value, Buffer.from(balance)) === 0;
    }
  }
}

// 测试
function test() {
  let mpt = new MPT();
  let addr = "0x95222290dd7278aa3ddd389cc1e1d165cc4bafe5";
  let balance1 = 100;
  let balance2 = 200;

  // 添加地址并验证
  mpt.addOrUpdateAddress(addr, balance1);
  let root1 = mpt.computeRoot();
  console.log("Root1:", root1.toString("hex"));
  console.log("Verify1:", mpt.verifyAddress(addr, balance1)); // true

  // 更新地址并验证
  mpt.addOrUpdateAddress(addr, balance2);
  let root2 = mpt.computeRoot();
  console.log("Root2:", root2.toString("hex"));
  console.log("Verify2:", mpt.verifyAddress(addr, balance1)); // false
  console.log("Verify3:", mpt.verifyAddress(addr, balance2)); // true
}

test();