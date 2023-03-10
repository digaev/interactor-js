/* eslint-disable max-classes-per-file */
import Sinon from 'sinon';
import { assert } from 'chai';

import Interactor from '../lib/interactor';

class TestInteractor1 extends Interactor {
  public async perform() {
    this.fail({ error: new Error('Boo!') });
  }
}

describe('Interactor', () => {
  afterEach(() => {
    Sinon.restore();
  });

  describe('static perform', () => {
    describe('without errors', () => {
      const interactor = new Interactor();

      before(() => {
        Sinon.spy(interactor, 'after');
        Sinon.spy(interactor, 'before');
        Sinon.spy(interactor, 'fail');
        Sinon.spy(interactor, 'rollback');
      });

      it('succeeds', async () => {
        await interactor.perform();

        assert.isFalse(interactor.failure);
        assert.isTrue(interactor.success);

        Sinon.assert.calledOnce(interactor.after as Sinon.SinonSpy);
        Sinon.assert.calledOnce(interactor.before as Sinon.SinonSpy);
        Sinon.assert.notCalled(interactor.fail as Sinon.SinonSpy);
        Sinon.assert.notCalled(interactor.rollback as Sinon.SinonSpy);
      });
    });

    describe('with errors', () => {
      const interactor = new TestInteractor1();

      before(() => {
        Sinon.spy(interactor, 'after');
        Sinon.spy(interactor, 'before');
        Sinon.spy(interactor, 'fail');
        Sinon.spy(interactor, 'rollback');
      });

      it('fails', async () => {
        await interactor.perform();

        assert.isTrue(interactor.failure);
        assert.isFalse(interactor.success);

        Sinon.assert.notCalled(interactor.after as Sinon.SinonSpy);
        Sinon.assert.calledOnce(interactor.before as Sinon.SinonSpy);
        Sinon.assert.calledOnce(interactor.fail as Sinon.SinonSpy);
        Sinon.assert.notCalled(interactor.rollback as Sinon.SinonSpy);

        assert.instanceOf(interactor.context.error, Error);
        assert.equal(interactor.context.error.message, 'Boo!');
      });
    });
  });
});
