export type RouteParamBaseArray = Array<PathPart<any, any>>;

export interface PathParam<T extends string, B extends boolean> {
  param: T;
  optional: B;
}

export type PathPart<T extends string, B extends boolean> = string | PathParam<T, B>;

export type RequiredParamsFromPathArray<T extends RouteParamBaseArray> = {
  [K in keyof T]: T[K] extends PathParam<infer ParamName, infer Optional>
    ? Optional extends false
      ? ParamName
      : never
    : never;
};

export type OptionalParamsFromPathArray<T extends RouteParamBaseArray> = {
  [K in keyof T]: T[K] extends PathParam<infer ParamName, infer Optional>
    ? Optional extends false
      ? never
      : ParamName
    : never;
};

export type RouteParams<Parts extends RouteParamBaseArray> = {
  [K in RequiredParamsFromPathArray<Parts>[number]]: string;
} &
  { [K in OptionalParamsFromPathArray<Parts>[number]]?: string };
