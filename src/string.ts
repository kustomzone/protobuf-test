 /** Wraps the given string type with newlines. */
export type WrapWithNewlines<T extends string> = `\n${T}\n`;

/** A space, tab, newline, or carriage return. */
export type Whitespace = " " | "\t" | "\n" | "\r";

export type OptionalWhitespace = "" | Whitespace;

export type StringToNumber<T extends string> =
  T extends `${infer N extends number}` ? N : never;
