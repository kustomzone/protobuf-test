import type { Split, Trim } from "type-fest";
import type { FilterEmpty, KeyBy, MapTrim } from "./array";
import type {
  OptionalWhitespace,
  StringToNumber,
  Whitespace,
  WrapWithNewlines,
} from "./string";

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
type RawFieldDefinitions<
  Proto extends string,
  MessageName extends MessageNames<Proto>[number]
> = WrapWithNewlines<Proto> extends `${string}${Whitespace}message${Whitespace}${MessageName}${OptionalWhitespace}{${infer FieldDefinitions}}${string}`
  ? FilterEmpty<MapTrim<Split<FieldDefinitions, ";">>>
  : [];

/**
 * Given a raw field definition extracted by `RawFieldDefinitions`, parses it
 * into an object type.
 */
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
type FieldDefinitionsByFieldName<
  Proto extends string,
  MessageName extends MessageNames<Proto>[number]
> = KeyBy<FieldDefinitions<Proto, MessageName>, "name">;

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
type MessagesByMessageName<Proto extends string> = {
  [k in MessageNames<Proto>[number]]: MessageType<Proto, k>;
};

export type infer<
  Proto extends string,
  MessageName extends string = ""
> = MessageName extends ""
  ? MessagesByMessageName<Proto>
  : MessageName extends MessageNames<Proto>[number]
  ? MessagesByMessageName<Proto>[MessageName]
  : never;