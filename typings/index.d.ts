declare module "interactor-js" {
  export interface Context {
    [x: string]: any;
  }

  export class Interactor {
    get context(): Context;
    get failure(): boolean;
    get success(): boolean;

    static perform(context?: Context): Promise<Interactor>;

    constructor(context?: Context);

    after(): Promise<any>;
    before(): Promise<any>;
    call(): Promise<any>;
    fail(context?: Context): void;
    perform(): Promise<Interactor>;
    rollback(): Promise<any>;
  }

  export interface OrganizeResult {
    context: Context;
    failure: boolean;
    success: boolean;
  }

  export type TypeOfInteractor = typeof Interactor;

  export class Organizer {
    static organize(): TypeOfInteractor[];
    static perform(context?: Context): Promise<OrganizeResult>
  }
}
