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

  protected hookPerform(): void;
}

export interface OrganizeResult {
  context: any;
  failure: boolean;
  success: boolean;
}

export type TypeOfInteractor = typeof Interactor;

/**
 *
 * @param context Expected an object
 * @param organized An array of interactors
 */
export function organize(context: any, interactors: TypeOfInteractor[]): Promise<OrganizeResult>

export class Organizer {
  public static organize(): TypeOfInteractor[];
  public static perform(context?: any): Promise<OrganizeResult>;
}
