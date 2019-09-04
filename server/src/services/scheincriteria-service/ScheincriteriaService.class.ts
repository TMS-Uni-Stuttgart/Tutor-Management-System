export interface ScheincriteriaDerp {
  readonly identifier: string;
}

export class ScheincriteriaService {
  private criteriaBluePrints: Map<string, ScheincriteriaDerp>;

  constructor() {
    this.criteriaBluePrints = new Map();
  }

  public registerBluePrint(criteria: ScheincriteriaDerp) {
    this.criteriaBluePrints.set(criteria.identifier, criteria);

    for (const [name, descriptor] of Object.entries(Object.getOwnPropertyDescriptors(criteria))) {
      console.log(name, '-->', typeof descriptor.value);
    }
  }

  public unregisterBluePrint(criteria: ScheincriteriaDerp) {
    this.criteriaBluePrints.delete(criteria.identifier);
  }

  public getBluePrintCount(): number {
    return this.criteriaBluePrints.size;
  }
}

const scheincriteriaService = new ScheincriteriaService();
export default scheincriteriaService;
