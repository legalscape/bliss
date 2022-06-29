import { BlissNode } from './node';
import { BlissNodeDefinition, BlissNodeDefinitionBase } from './node-definition';
import validate from './validation';

export class Bliss<State, Config> {
  protected nodeDefinitions: BlissNodeDefinitionBase<State, Config>[] = [];

  constructor(public config: Config) {}

  defineNode<Name extends string>(name: Name) {
    return new BlissNodeDefinition<State, Config, Name>(name, this);
  }

  commit(definition: BlissNodeDefinitionBase<State, Config>) {
    this.nodeDefinitions.push(definition);
  }

  convert<Def extends BlissNodeDefinitionBase<State, Config>>(domNode: Node, depth = 0): BlissNode<Def> {
    const definition = this.nodeDefinitions.find((def): def is Def => def.matcher(domNode));

    if (!definition) {
      throw new Error(`No definition found for ${domNode}`);
    }

    const children = Array.from(domNode.childNodes || []).map((child) => this.convert(child, depth + 1));

    return new BlissNode(definition, <any>children, domNode, this.config);
  }

  validate(blissNode: BlissNode<any>) {
    const queue = [blissNode];

    while (queue.length > 0) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const node = queue.shift()!;

      validate(node);

      for (const child of node.children) {
        queue.push(child);
      }
    }
  }
}

export * from './children-constraints';
export * from './dom';
export * from './node';
export * from './node-definition';
