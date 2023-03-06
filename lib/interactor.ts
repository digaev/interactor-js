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

    this.hook();
  }

  public after(): Promise<void> {
    return Promise.resolve();
  }

  public before(): Promise<void> {
    return Promise.resolve();
  }

  public fail(context: any = {}): void {
    this.#failure = true;

    Object.keys(context).forEach((k) => {
      this.#context[k] = context[k];
    });
  }

  public perform(): Promise<void> {
    return Promise.resolve();
  }

  public rollback(): Promise<void> {
    return Promise.resolve();
  }

  private hook() {
    const original = this.perform.bind(this);

    this.perform = () => Promise.resolve()
      .then(() => this.before())
      .then(original)
      .then(() => this.success && this.after() as any);
  }
}
