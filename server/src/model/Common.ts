export interface HasId {
  id: string;
}

export interface NamedElement extends HasId {
  firstname: string;
  lastname: string;
}
