import type { Split, Trim } from "type-fest";

interface OptionalWhitespace extends String {}
interface StringToNumber extends String {}
interface Whitespace extends String {}
interface WrapWithNewlines extends String {}

interface FilterEmpty<T extends string[]> extends Array<string> {}
interface KeyBy<T, K extends keyof T> extends Record<string, T> {}
interface MapTrim<T extends string[]> extends Array<string> {}
/**
 * Extracts message names from the given proto string.
 */
type MessageNames<Proto extends string> =
  WrapWithNewlines<Proto> extends `${string}${Whitespace}message${Whitespace}${infer MessageName}${OptionalWhitespace}{${string}}${infer Rest}`
    ? [MessageName, ...MessageNames<Rest>]
    : [];

/**
 * Extracts field definitions of the given message name.
 */
interface RawFieldDefinitions<
  Proto extends string,
  MessageName extends MessageNames<Proto>[number]
> extends Array<string> {}

/**
 * Given a raw field definition extracted by `RawFieldDefinitions`, parses it
 * into an object type.
 */
interface ParsedField {
    type: any;
    name: string;
    number: number;
}
type ParseRawFieldDefinition<
  Proto extends string,
  RawFieldDefinition extends string
> = RawFieldDefinition extends `${infer FieldCardinality}${Whitespace}${infer FieldType}${Whitespace}${infer FieldName}${OptionalWhitespace}=${OptionalWhitespace}${infer FieldNumber}`
  ? FieldName extends ""
    ? RawFieldDefinition extends `${infer FieldType}${Whitespace}${infer FieldName}${OptionalWhitespace}=${OptionalWhitespace}${infer FieldNumber}`
      ? {
          type: ParseFieldType<Proto, Trim<FieldType>>;
          name: Trim<FieldName>;
          number: StringToNumber<Trim<FieldNumber>>;
        }
      : never
    : {
        type: ParseFieldType<Proto, Trim<FieldType>, Trim<FieldCardinality>>;
        name: Trim<FieldName>;
        number: StringToNumber<Trim<FieldNumber>>;
      }
  : never;

/**
 * Given a raw field type, parses it into a TypeScript type, handling
 * cardinality appropriately.
 */
type ParseFieldType<
  Proto extends string,
  RawFieldType extends string,
  Cardinality extends string = ""
> = Cardinality extends "optional"
  ? ParseRawFieldType<Proto, RawFieldType> | undefined
  : Cardinality extends "repeated"
  ? ParseRawFieldType<Proto, RawFieldType>[]
  : ParseRawFieldType<Proto, RawFieldType>;

/**
 * Given a raw field type, parses it into a TypeScript type.
 */
type ParseRawFieldType<
  Proto extends string,
  RawType extends string
> = RawType extends "string"
  ? string
  : RawType extends "bool"
  ? boolean
  : RawType extends "bytes"
  ? Uint8Array
  : RawType extends "float"
  ? number
  : RawType extends "double"
  ? number
  : RawType extends "int32"
  ? number
  : RawType extends "int64"
  ? number
  : RawType extends "uint32"
  ? number
  : RawType extends "uint64"
  ? number
  : MessagesByMessageName<Proto>[RawType];

/**
 * Given raw field definitions extracted by `RawFieldDefinitions`, parses them
 * into object types using `ParseRawFieldDefinition`.
 */
type ParseRawFieldDefinitions<
  Proto extends string,
  RawDefinitions extends string[]
> = RawDefinitions extends [infer Head, ...infer Tail]
  ? Head extends string
    ? Tail extends string[]
      ? [
          ParseRawFieldDefinition<Proto, Head>,
          ...ParseRawFieldDefinitions<Proto, Tail>
        ]
      : []
    : []
  : [];

/**
 * Extracts field definitions for a given message name.
 */
type FieldDefinitions<
  Proto extends string,
  MessageName extends MessageNames<Proto>[number]
> = ParseRawFieldDefinitions<Proto, RawFieldDefinitions<Proto, MessageName>>;

/**
 * Extracts a mapping of field names to field definitions for a given message
 * name.
 */
interface FieldDefinitionsByFieldName<
  Proto extends string,
  MessageName extends MessageNames<Proto>[number]
> extends Record<string, ParsedField> {}

/**
 * Extracts the field names for a given message name.
 */
type FieldNames<
  Proto extends string,
  MessageName extends MessageNames<Proto>[number]
> = keyof FieldDefinitionsByFieldName<Proto, MessageName>;

/**
 * Infers the type of the named message in the given proto string.
 */
type MessageType<
  Proto extends string,
  MessageName extends MessageNames<Proto>[number]
> = {
  [k in FieldNames<
    Proto,
    MessageName
  > as undefined extends FieldDefinitionsByFieldName<
    Proto,
    MessageName
  >[k]["type"]
    ? never
    : k]: FieldDefinitionsByFieldName<Proto, MessageName>[k]["type"];
} & {
  [k in FieldNames<
    Proto,
    MessageName
  > as undefined extends FieldDefinitionsByFieldName<
    Proto,
    MessageName
  >[k]["type"]
    ? k
    : never]?: FieldDefinitionsByFieldName<Proto, MessageName>[k]["type"];
};

/**
 * Creates a mapping of message names to their respective inferred types for
 * the given proto string.
 */
interface MessagesByMessageName<Proto extends string> extends Record<string,MessageType<Proto, any>> {}

export type infer<
  Proto extends string,
  MessageName extends string = ""
> = MessageName extends ""
  ? MessagesByMessageName<Proto>
  : MessageName extends MessageNames<Proto>[number]
  ? MessagesByMessageName<Proto>[MessageName]
  : never;