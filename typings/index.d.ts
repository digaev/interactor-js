/* eslint-disable max-classes-per-file */

declare module 'interactor-organizer' {
  export class Interactor {
    get context(): any;
    get failure(): boolean;
    get success(): boolean;

    static perform<T extends Interactor = Interactor>(context?: any): Promise<T>;

    constructor(context?: any);

    after(): Promise<any>;
    before(): Promise<any>;
    fail(context?: any): void;
    perform(): Promise<any>;
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
