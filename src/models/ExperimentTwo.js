class TrieNode {
	constructor() {
	  this.children = {};
	  this.isEnd = false;
	}
  }
  
  class Trie {
	constructor() {
	  this.root = new TrieNode();
	}
  
	insert(word) {
	  let node = this.root;
	  for (let i = 0; i < word.length; i++) {
		const c = word[i];
		if (!node.children[c]) {
		  node.children[c] = new TrieNode();
		}
		node = node.children[c];
	  }
	  node.isEnd = true;
	}
  
	search(word) {
	  let node = this.root;
	  for (let i = 0; i < word.length; i++) {
		const c = word[i];
		if (!node.children[c]) {
		  return false;
		}
		node = node.children[c];
	  }
	  return node.isEnd;
	}
  
	startsWith(prefix) {
	  let node = this.root;
	  for (let i = 0; i < prefix.length; i++) {
		const c = prefix[i];
		if (!node.children[c]) {
		  return false;
		}
		node = node.children[c];
	  }
	  return true;
	}
  
	delete(word) {
	  const stack = [];
	  let node = this.root;
	  for (let i = 0; i < word.length; i++) {
		const c = word[i];
		if (!node.children[c]) {
		  return false;
		}
		stack.push({ parent: node, char: c });
		node = node.children[c];
	  }
	  if (!node.isEnd) return false;
  
	  node.isEnd = false;
	  if (Object.keys(node.children).length === 0) {
		while (stack.length > 0 && !node.isEnd) {
		  const { parent, char } = stack.pop();
		  delete parent.children[char];
		  node = parent;
		}
	  }
	  return true;
	}
  }
