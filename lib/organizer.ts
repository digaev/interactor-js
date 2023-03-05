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
    const organized = this.organize();
    const result = { context, failure: false, success: true };

    if (!organized.length) {
      return result;
    }

    return new Promise((resolve, reject) => {
      const successful: Interactor[] = [];
      let i = 0;

      const next = () => {
        const interactor = organized[i];

        interactor.perform(context)
          .then((current) => {
            if (current.success) {
              i = successful.push(current);

              if (i >= organized.length) {
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
          })
          .catch(reject);
      };

      next();
    });
  }
}
