export interface PathParam<T extends string, B extends boolean> {
  param: T;
  optional: B;
}

export type PathPart<T extends string, B extends boolean> = string | PathParam<T, B>;

export type RequiredParamsFromPathArray<T extends Array<PathPart<any, any>>> = {
  [K in keyof T]: T[K] extends PathParam<infer ParamName, infer Optional>
    ? Optional extends false
      ? ParamName
      : never
    : never;
};

export type OptionalParamsFromPathArray<T extends Array<PathPart<any, any>>> = {
  [K in keyof T]: T[K] extends PathParam<infer ParamName, infer Optional>
    ? Optional extends false
      ? never
      : ParamName
    : never;
};

export type RouteParams<Parts extends Array<PathPart<any, any>>> = {
  [K in RequiredParamsFromPathArray<Parts>[number]]: string;
} &
  { [K in OptionalParamsFromPathArray<Parts>[number]]?: string };
