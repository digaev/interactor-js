import { Context } from "./context";

export default class Interactor {
  #failure = false;

  context: Context;

  get failure() {
    return this.#failure;
  }

  get success() {
    return !this.#failure;
  }

  static perform(context: Context = {}) {
    const interactor = new this(context);

    return interactor.perform();
  }

  constructor(context: Context = {}) {
    this.context = context;
  }

  public after(): Promise<any> {
    return Promise.resolve();
  }

  public before(): Promise<any> {
    return Promise.resolve();
  }

  public call(): Promise<any> {
    return Promise.resolve();
  }

  public fail(context: Context = {}) {
    this.#failure = true;

    Object.keys(context).forEach((k) => {
      this.context[k] = context[k];
    });
  }

  public async perform(): Promise<Interactor> {
    this.#failure = false;

    return this.before()
      .then(() => this.call())
      .then(() => this.success && this.after())
      .catch((error) => {
        this.fail({ error });
      })
      .then(() => this);
  }

  public rollback(): Promise<any> {
    return Promise.resolve();
  }
}
