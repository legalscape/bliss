import type { BlissNodeDefinitionBase } from './node-definition';
import type { ChildrenTypes } from './children-constraints';

export class BlissNode<Def extends BlissNodeDefinitionBase<any, any>> {
  constructor(
    public definition: Def,
    public children: ChildrenTypes<NonNullable<Def['childrenConstraints']>>,
    public domNode: Node,
    public config: Def['__config'],
  ) {}

  get name(): Def['name'] {
    return this.definition.name;
  }

  toString(): string {
    return (
      '<' +
      [
        this.definition.name,
        this.children.length > 0 ? '[' + this.children.map((c) => c.toString()).join(', ') + ']' : null,
      ]
        .filter((x) => x)
        .join(' ') +
      '>'
    );
  }

  parse(state: Parameters<NonNullable<Def['parser']>>[0]): ReturnType<NonNullable<Def['parser']>> {
    if (!this.definition.parser) {
      throw new Error('No parser defined for ' + this.definition.name);
    }

    return Reflect.apply(this.definition.parser, this, [state, this.config]);
  }

  /**
   * Find a specific kind of Node from the children.
   * If there are none, or if there are more than one, an Error is thrown.
   */
  getChild<Def extends BlissNodeDefinitionBase<any, any>>(nodeDefinition: Def | string): BlissNode<Def> {
    const name = typeof nodeDefinition === 'string' ? nodeDefinition : nodeDefinition.name;
    const found = this.children.filter((child): child is BlissNode<Def> => child.definition.name === name);

    if (found.length !== 1) {
      throw new Error(`Found ${found.length} children of ${name}`);
    }

    return found[0];
  }

  /**
   * Find a specific kind of Node from all the descendants.
   * If there are none, or if there are more than one, an Error is thrown.
   */
  getDescendant<Def extends BlissNodeDefinitionBase<any, any>>(nodeDefinition: Def | string): BlissNode<Def> {
    const found = this.getAllDescendants(nodeDefinition);

    if (found.length !== 1) {
      const name = typeof nodeDefinition === 'string' ? nodeDefinition : nodeDefinition.name;
      throw new Error(`Found ${found.length} descendants of ${name}`);
    }

    return found[0];
  }

  /**
   * Find a specific kind of Node from all the descendants.
   * If there are none, null is returned. If there are more than one, an Error is thrown.
   */
  getDescendantOrNull<Def extends BlissNodeDefinitionBase<any, any>>(
    nodeDefinition: Def | string,
  ): BlissNode<Def> | null {
    const found = this.getAllDescendants(nodeDefinition);

    if (found.length === 0) {
      return null;
    }

    if (found.length !== 1) {
      const name = typeof nodeDefinition === 'string' ? nodeDefinition : nodeDefinition.name;
      throw new Error(`Found ${found.length} descendants of ${name}`);
    }

    return found[0];
  }

  /**
   * Find a specific kind of Nodes from all the descendants.
   * Always return an array that contains all of the found Nodes.
   */
  getAllDescendants<Def extends BlissNodeDefinitionBase<any, any>>(nodeDefinition: Def | string): BlissNode<Def>[] {
    const found = [];

    const name = typeof nodeDefinition === 'string' ? nodeDefinition : nodeDefinition.name;
    const queue: BlissNode<any>[] = [...this.children];

    while (queue.length > 0) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const child = queue.shift()!;

      if (child.definition.name === name) {
        found.push(child);
      }

      queue.push(...child.children);
    }

    return found;
  }
}
