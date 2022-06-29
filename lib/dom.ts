export function isProcessingInstructionNode(node: Node): node is ProcessingInstruction & Element {
  return node.nodeType === 7;
}

export function isDocType(node: Node): node is DocumentType {
  return node.nodeType === 10;
}

export function isElement(node?: Node, nodeName?: string): node is Element {
  return node !== undefined && node.nodeType === 1 && (!nodeName || node.nodeName === nodeName);
}
