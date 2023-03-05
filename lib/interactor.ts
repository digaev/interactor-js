/* eslint-disable class-methods-use-this */

import { Context } from './context';

export default class Interactor {
  #failure = false;

  context: Context;

  get failure() {
    return this.#failure;
  }

  get success() {
    return !this.#failure;
  }

  static async perform<T extends Interactor = Interactor>(context: Context = {}): Promise<T> {
    const interactor = new this(context);

    return interactor.before()
      .then(() => interactor.perform())
      .then(() => interactor.success && interactor.after() as any)
      .then(() => interactor as T);
  }

  constructor(context: Context = {}) {
    this.context = context;
  }

  public after(): Promise<void> {
    return Promise.resolve();
  }

  public before(): Promise<void> {
    return Promise.resolve();
  }

  public fail(context: Context = {}): void {
    this.#failure = true;

    Object.keys(context).forEach((k) => {
      this.context[k] = context[k];
    });
  }

  public perform(): Promise<void> {
    return Promise.resolve();
  }

  public rollback(): Promise<void> {
    return Promise.resolve();
  }
}
