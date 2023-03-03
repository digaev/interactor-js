import Sinon, { SinonSpy } from 'sinon';
import { assert } from 'chai';

import Interactor from '../lib/interactor';

describe('Interactor', () => {
  afterEach(() => {
    Sinon.restore();
  })


  describe('perform', () => {
    describe('without errors', () => {
      const interactor = new Interactor();

      before(() => {
        Sinon.spy(interactor, 'after');
        Sinon.spy(interactor, 'before');
        Sinon.spy(interactor, 'call');
        Sinon.spy(interactor, 'fail');
        Sinon.spy(interactor, 'rollback');
      });

      it('should success', async () => {
        await interactor.perform();

        assert.isFalse(interactor.failure);
        assert.isTrue(interactor.success);

        Sinon.assert.calledOnce(interactor.after as SinonSpy);
        Sinon.assert.calledOnce(interactor.before as SinonSpy);
        Sinon.assert.calledOnce(interactor.call as SinonSpy);
        Sinon.assert.notCalled(interactor.fail as SinonSpy);
        Sinon.assert.notCalled(interactor.rollback as SinonSpy)
      });
    });

    describe('with errors', () => {
      const interactor = new Interactor();

      before(() => {
        Sinon.spy(interactor, 'after');
        Sinon.spy(interactor, 'before');
        Sinon.stub(interactor, 'call').rejects(new Error('Boo!'))
        Sinon.spy(interactor, 'fail');
        Sinon.spy(interactor, 'rollback');
      });

      it('should fail', async () => {
        await interactor.perform();

        assert.isTrue(interactor.failure);
        assert.isFalse(interactor.success);

        Sinon.assert.notCalled(interactor.after as SinonSpy);
        Sinon.assert.calledOnce(interactor.before as SinonSpy);
        Sinon.assert.calledOnce(interactor.call as SinonSpy);
        Sinon.assert.calledOnce(interactor.fail as SinonSpy);
        Sinon.assert.notCalled(interactor.rollback as SinonSpy);

        assert.instanceOf(interactor.context.error, Error);
        assert.equal(interactor.context.error.message, 'Boo!');
      });
    });
  })
});
