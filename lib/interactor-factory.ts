/* eslint-disable prefer-arrow-callback */
/* eslint-disable max-classes-per-file */

import Interactor from './interactor';
import SafeInteractor from './safe-interactor';

export type AfterFunction = (this: Interactor) => Promise<any>;
export type BeforeFunction = (this: Interactor) => Promise<any>;
export type PerformFunction = (this: Interactor) => Promise<any>;
export type RollbackFunction = (this: Interactor) => Promise<any>;

export function createInteractor(perform: PerformFunction, rollback?: RollbackFunction, before?: BeforeFunction, after?: AfterFunction): typeof Interactor {
  const RuntimeInteractor = class extends Interactor {
    public after(): Promise<any> {
      if (after) {
        return after.call(this);
      }
      return super.after();
    }

    public before(): Promise<any> {
      if (before) {
        return before.call(this);
      }
      return super.before();
    }

    public perform(): Promise<any> {
      return perform.call(this);
    }

    public rollback(): Promise<any> {
      if (rollback) {
        return rollback.call(this);
      }
      return super.rollback();
    }
  };

  return RuntimeInteractor;
}

export function createSafeInteractor(perform: PerformFunction, rollback?: RollbackFunction, before?: BeforeFunction, after?: AfterFunction): typeof Interactor {
  const RuntimeSafeInteractor = class extends SafeInteractor {
    public after(): Promise<any> {
      if (after) {
        return after.call(this);
      }
      return super.after();
    }

    public before(): Promise<any> {
      if (before) {
        return before.call(this);
      }
      return super.before();
    }

    public perform(): Promise<any> {
      return perform.call(this);
    }

    public rollback(): Promise<any> {
      if (rollback) {
        return rollback.call(this);
      }
      return super.rollback();
    }
  };

  return RuntimeSafeInteractor;
}
