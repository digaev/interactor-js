import Interactor from './interactor';

export default class SafeInteractor extends Interactor {
  protected around(): void {
    super.around();

    const original = this.perform;

    this.perform = () => original.call(this)
      .catch((error) => {
        this.fail({ error });
      });
  }
}
