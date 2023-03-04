import Interactor from './interactor';
import { Context } from './context';

export interface OrganizeResult {
  context: Context;
  failure: boolean;
  success: boolean;
}

export default class Organizer {
  static organize(): Array<typeof Interactor> {
    return [];
  }

  static async perform(context: Context = {}): Promise<OrganizeResult> {
    const organize = this.organize();
    const result = { context, failure: false, success: true };

    if (!organize.length) {
      return result;
    }

    return new Promise((resolve, reject) => {
      const successful: Interactor[] = [];
      let i = 0;

      const next = () => {
        const current = new organize[i](context);

        current.perform()
          .finally(() => {
            if (current.success) {
              i = successful.push(current);

              if (i >= organize.length) {
                resolve(result);
              } else {
                next();
              }
            } else {
              let rollback = Promise.resolve();

              for (let j = successful.length - 1; j >= 0; j -= 1) {
                rollback = rollback.then(() => successful[j].rollback());
              }

              rollback.then(() => {
                result.failure = true;
                result.success = false;

                resolve(result);
              })
                .catch(reject);
            }
          });
      };

      next();
    });
  }
}
