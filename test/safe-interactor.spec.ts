import { assert } from 'chai';
import SafeInteractor from '../lib/safe-interactor';

class TestInteractor1 extends SafeInteractor {
  // eslint-disable-next-line class-methods-use-this
  public perform(): Promise<any> {
    throw new Error('TestInteractor1 failed');
  }
}

describe('SafeInteractor', () => {
  it('never rejects', async () => {
    const interactor = await TestInteractor1.perform();

    assert.isTrue(interactor.failure);
    assert.isFalse(interactor.success);

    assert.instanceOf(interactor.context.error, Error);
    assert.equal(interactor.context.error.message, 'TestInteractor1 failed');
  });
});
