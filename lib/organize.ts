import Interactor from './interactor';

export type TypeOfInteractor = typeof Interactor;

export interface OrganizeResult {
  context: any;
  failure: boolean;
  success: boolean;
}

export default async function organize(context: any, interactors: TypeOfInteractor[]): Promise<OrganizeResult> {
  const result: OrganizeResult = { context, failure: false, success: true };

  if (!interactors.length) {
    return result;
  }

  return new Promise<OrganizeResult>((resolve, reject) => {
    const successful: Interactor[] = [];
    let i = 0;

    const next = () => {
      const interactor = interactors[i];

      interactor.perform(context)
        .then((current) => {
          if (current.success) {
            i = successful.push(current);

            if (i >= interactors.length) {
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
