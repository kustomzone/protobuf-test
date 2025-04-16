import type { Trim } from "type-fest";

/**
 * Trims leading and trailing whitespace from each element of the given array
 * of strings.
 */
export type MapTrim<Strings extends string[]> = Strings extends [
  infer Head,
  ...infer Tail
]
  ? Head extends string
    ? Tail extends string[]
      ? [Trim<Head>, ...MapTrim<Tail>]
      : []
    : []
  : [];

/**
 * Removes empty strings from the given array of strings.
 */
export type FilterEmpty<Strings extends string[]> = Strings extends [
  infer Head,
  ...infer Tail
]
  ? Head extends ""
    ? FilterEmpty<Tail extends string[] ? Tail : []>
    : [Head, ...FilterEmpty<Tail extends string[] ? Tail : []>]
  : [];

/**
 * Given an array of objects, creates an object type where the keys are the
 * values of the given key for each object. Think of it as a combination of
 * lodash's [`keyBy`](https://lodash.com/docs/4.17.15#keyBy) and
 * [`pick`](https://lodash.com/docs/4.17.15#pick).
 */
export type KeyBy<
  Objects extends { [key in Key]: string | number | symbol }[],
  Key extends string
> = {
  [Object in Objects[number] as Object[Key]]: Object;
};
