/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-types */

export type DeepUnknownable<T> = {
    [P in keyof T]: T[P] extends object ? DeepUnknownable<T[P]> : unknown;
};

export type ArrayElement<ArrayType extends readonly unknown[]> = ArrayType[number];
/** Union of primitives to skip with deep omit utilities. */
type Primitive = string | Function | number | boolean | Symbol | undefined | null;

/** Deeply omit members of an array of interface or array of type. */
export type DeepOmitArray<T extends any[], K> = {
    [P in keyof T]: DeepOmit<T[P], K>;
};

/** Deeply omit members of an interface or type. */
export type DeepOmit<T, K> = T extends Primitive
    ? T
    : {
          [P in Exclude<keyof T, K>]: T[P] extends infer TP //extra level of indirection needed to trigger homomorhic behavior // distribute over unions
              ? TP extends Primitive
                  ? TP // leave primitives and functions alone
                  : TP extends any[]
                  ? DeepOmitArray<TP, K> // Array special handling
                  : DeepOmit<TP, K>
              : never;
      };

/** Deeply omit members of an array of interface or array of type, making all members optional. */
export type PartialDeepOmitArray<T extends any[], K> = Partial<{
    [P in Partial<keyof T>]: Partial<PartialDeepOmit<T[P], K>>;
}>;

/** Deeply omit members of an interface or type, making all members optional. */
export type PartialDeepOmit<T, K> = T extends Primitive
    ? T
    : Partial<{
          [P in Exclude<keyof T, K>]: T[P] extends infer TP //extra level of indirection needed to trigger homomorhic behavior // distribute over unions
              ? TP extends Primitive
                  ? TP // leave primitives and functions alone
                  : TP extends any[]
                  ? PartialDeepOmitArray<TP, K> // Array special handling
                  : Partial<PartialDeepOmit<TP, K>>
              : never;
      }>;

export type Nullable<T> = {
    [P in keyof T]: T[P] | null;
};

export type RemoveField<Type, K extends keyof any> = {
    [Property in keyof Type as Exclude<Property, K>]: Type[Property];
};

export type UnwrapArray<T> = T extends (infer U)[] ? U : T;
