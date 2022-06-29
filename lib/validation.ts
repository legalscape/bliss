import { type ChildrenContainsConstraint, NoConstraints, None } from './children-constraints';
import type { BlissNode } from './node';
import type { BlissNodeDefinitionBase } from './node-definition';

export default function validate(node: BlissNode<BlissNodeDefinitionBase<any, any>>): void {
  if (!node.definition.childrenConstraints) {
    throw new Error('No children constraints defined for ' + node.definition.name);
  }

  if (node.definition.childrenConstraints === NoConstraints) {
    return;
  } else if (node.definition.childrenConstraints === None) {
    validateNone(node);
  } else if ('contains' in node.definition.childrenConstraints) {
    validateContains(node, node.definition.childrenConstraints);
  } else {
    // Intended: causes compile error if these ifs are not exhaustive
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const _: never = node.definition.childrenConstraints;
  }
}

function validateNone(node: BlissNode<any>): void {
  if (node.children.length > 0) {
    throw new BlissValidationError({
      node,
      actual: 'has ' + node.children.length + ' children',
      expected: 'has no children',
    });
  }
}

function validateContains(node: BlissNode<any>, { contains }: ChildrenContainsConstraint): void {
  const count = new Map<string, number>();

  for (const child of node.children) {
    count.set(child.definition.name, (count.get(child.definition.name) ?? 0) + 1);
  }

  for (const { node: contained, min, max } of contains) {
    const name = typeof contained === 'string' ? contained : contained.name;
    const actual = count.get(name) ?? 0;

    if (actual < min || actual > max) {
      throw new BlissValidationError({
        node,
        actual: `has ${actual} of ${name}`,
        expected: `has (min: ${min}, max: ${max}) of ${name}`,
      });
    }

    count.delete(name);
  }

  if (count.size > 0) {
    throw new BlissValidationError({
      node,
      actual: 'contains ' + Array.from(count.keys()).join(', '),
      expected: 'contains no such children',
    });
  }
}

const truncate = (str: string, len: number): string => (str.length > len ? str.slice(0, len - 3) + '...' : str);

export class BlissValidationError extends Error {
  constructor({ node, actual, expected }: { node: BlissNode<any>; actual: string; expected: string }) {
    super(
      'Node: ' +
        truncate(node.toString(), 200) +
        '\nDOM Node: ' +
        truncate(node.domNode.toString(), 200) +
        ('lineNumber' in node.domNode ? '\nLine: ' + (<any>node.domNode).lineNumber : '') +
        '\nActual: ' +
        actual +
        '\nExpected: ' +
        expected,
    );
  }
}
