/* eslint-disable max-classes-per-file */

declare module 'interactor-organizer' {
  export class Interactor {
    get context(): any;
    get failure(): boolean;
    get success(): boolean;

    static perform(context?: any): Promise<Interactor>;

    constructor(context?: any);

    after(): Promise<any>;
    before(): Promise<any>;
    call(): Promise<any>;
    fail(context?: any): void;
    perform(): Promise<Interactor>;
    rollback(): Promise<any>;
  }

  export interface OrganizeResult {
    context: any;
    failure: boolean;
    success: boolean;
  }

  export type TypeOfInteractor = typeof Interactor;

  export class Organizer {
    static organize(): TypeOfInteractor[];
    static perform(context?: any): Promise<OrganizeResult>;
  }
}
