const walk = (root, callback) => {
  callback(root);
  if (root.children) {
    root.children.forEach((node) => walk(node, callback));
  }
};

module.exports = walk;
