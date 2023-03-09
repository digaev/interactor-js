/* eslint-disable class-methods-use-this */

export default class Interactor {
  #context: any;

  #failure = false;

  get context() {
    return this.#context;
  }

  get failure() {
    return this.#failure;
  }

  get success() {
    return !this.#failure;
  }

  static async perform<T extends Interactor = Interactor>(context: any = {}): Promise<T> {
    const interactor = new this(context);

    return interactor.perform().then(() => interactor as T);
  }

  constructor(context: any = {}) {
    this.#context = context;

    this.hookPerform();
  }

  public after(): Promise<any> {
    return Promise.resolve();
  }

  public before(): Promise<any> {
    return Promise.resolve();
  }

  public fail(context: any = {}): void {
    this.#failure = true;

    Object.keys(context).forEach((k) => {
      this.#context[k] = context[k];
    });
  }

  public perform(): Promise<any> {
    return Promise.resolve();
  }

  public rollback(): Promise<any> {
    return Promise.resolve();
  }

  protected hookPerform(): void {
    const original = this.perform;

    this.perform = () => Promise.resolve(this.before())
      .then(() => original.call(this))
      .then((result) => {
        if (this.success) {
          return Promise.resolve(this.after()).then(() => result);
        }
        return result;
      });
  }
}
