export class Interactor {
  public get context(): any;
  public get failure(): boolean;
  public get success(): boolean;

  public static perform<T extends Interactor = Interactor>(context?: any): Promise<T>;

  public constructor(context?: any);

  public after(): Promise<any>;
  public before(): Promise<any>;
  public fail(context?: any): void;
  public perform(): Promise<any>;
  public rollback(): Promise<any>;

  protected around(): void;
}

export class SafeInteractor extends Interactor {
}

export interface OrganizeResult {
  context: any;
  failure: boolean;
  success: boolean;
}

export type TypeOfInteractor = typeof Interactor;
export type TypeOfSafeInteractor = typeof SafeInteractor;

export type AfterFunction = (this: Interactor) => Promise<any>;
export type BeforeFunction = (this: Interactor) => Promise<any>;
export type PerformFunction = (this: Interactor) => Promise<any>;
export type RollbackFunction = (this: Interactor) => Promise<any>;

export function createInteractor(perform: PerformFunction, rollback?: RollbackFunction, before?: BeforeFunction, after?: AfterFunction): TypeOfInteractor;
export function createSafeInteractor(perform: PerformFunction, rollback?: RollbackFunction, before?: BeforeFunction, after?: AfterFunction): TypeOfSafeInteractor;

export function organize(context: any, interactors: TypeOfInteractor[]): Promise<OrganizeResult>

export class Organizer {
  public static organize(): TypeOfInteractor[];
  public static perform(context?: any): Promise<OrganizeResult>;
}
