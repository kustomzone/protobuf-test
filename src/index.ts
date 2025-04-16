import type { infer as Infer } from "./proto";

export namespace pbt {
  export type infer<
    Proto extends string,
    MessageName extends string = ""
  > = Infer<Proto, MessageName>;
}
