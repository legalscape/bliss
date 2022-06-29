import type { BlissNode } from './node';
import type { BlissNodeDefinition, BlissNodeDefinitionBase } from './node-definition';

/** Specify a constraint for a certain type of Node to appear n times, where min <= n <= max. */
export interface ChildrenAppearance<DefOrName extends BlissNodeDefinitionBase<any, any> | string> {
  node: DefOrName;
  min: number;
  max: number;
}

/** Specify no constraint for a certain type of Node. */
export const Any = <DefOrName extends BlissNodeDefinitionBase<any, any> | string>(node: DefOrName) => ({
  node,
  min: 0,
  max: Number.POSITIVE_INFINITY,
});

/** Specify a constraint for a certain type of Node to appear exactly once. */
export const One = <DefOrName extends BlissNodeDefinitionBase<any, any> | string>(node: DefOrName) => ({
  node,
  min: 1,
  max: 1,
});

/** Specify a constraint for a certain type of Node to appear at most once. */
export const AtMostOne = <DefOrName extends BlissNodeDefinitionBase<any, any> | string>(node: DefOrName) => ({
  node,
  min: 0,
  max: 1,
});

/** Specify a constraint for a certain type of Node to appear at least once. */
export const AtLeastOne = <DefOrName extends BlissNodeDefinitionBase<any, any> | string>(node: DefOrName) => ({
  node,
  min: 1,
  max: Number.POSITIVE_INFINITY,
});

export const NoConstraints = 'NoConstraints';
export type NoConstraints = typeof NoConstraints;

export const None = 'None';
export type ChildrenNoneConstraint = typeof None;
export type ChildrenContainsConstraint<
  DefOrName extends BlissNodeDefinitionBase<any, any> | string = BlissNodeDefinitionBase<any, any> | string,
> = {
  contains: ChildrenAppearance<DefOrName>[];
};

export type ChildrenConstraint<
  DefOrName extends BlissNodeDefinitionBase<any, any> | string = BlissNodeDefinitionBase<any, any> | string,
> = NoConstraints | ChildrenNoneConstraint | ChildrenContainsConstraint<DefOrName>;

type DefOrNameToBlissNode<DefOrName extends BlissNodeDefinitionBase<any, any> | string> =
  DefOrName extends BlissNodeDefinitionBase<any, any>
    ? { [Name in string]: BlissNode<Extract<DefOrName, { name: Name }>> }[DefOrName['name']]
    : DefOrName extends string
    ? BlissNode<BlissNodeDefinition<any, any, DefOrName, any, unknown>>
    : never;

export type ChildrenTypes<CC extends ChildrenConstraint> = CC extends NoConstraints
  ? any[]
  : CC extends ChildrenNoneConstraint
  ? []
  : CC extends ChildrenContainsConstraint<infer DefOrName>
  ? DefOrNameToBlissNode<DefOrName>[]
  : never;
