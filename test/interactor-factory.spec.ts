import sinon from 'sinon';
import { assert } from 'chai';

import Interactor from '../lib/interactor';
import SafeInteractor from '../lib/safe-interactor';
import { createInteractor, createSafeInteractor } from '../lib/interactor-factory';

describe('createInteractor', () => {
  afterEach(() => {
    sinon.restore();
  });

  context('with callbacks', async () => {
    it('produces a Interactor', async () => {
      const after = sinon.stub();
      const before = sinon.stub();
      const perform = sinon.stub();
      const rollback = sinon.stub();

      const Klass = createInteractor(perform, rollback, before, after);
      const interactor = new Klass();

      assert.instanceOf(interactor, Interactor);

      await interactor.perform();

      sinon.assert.calledOnce(before);
      sinon.assert.calledOnce(after);

      sinon.assert.calledOnce(perform);
      sinon.assert.notCalled(rollback);

      await interactor.rollback();

      sinon.assert.calledOnce(rollback);
    });
  });

  context('without callbacks', () => {
    it('produces a Interactor', async () => {
      const perform = sinon.stub();

      const Klass = createInteractor(perform);
      const interactor = new Klass();

      assert.instanceOf(interactor, Interactor);

      await interactor.perform();

      sinon.assert.calledOnce(perform);

      await interactor.rollback();
    });
  });
});

describe('createSafeInteractor', () => {
  afterEach(() => {
    sinon.restore();
  });

  context('with callbacks', async () => {
    it('produces a Interactor', async () => {
      const after = sinon.stub();
      const before = sinon.stub();
      const perform = sinon.stub();
      const rollback = sinon.stub();

      const Klass = createSafeInteractor(perform, rollback, before, after);
      const interactor = new Klass();

      assert.instanceOf(interactor, SafeInteractor);

      await interactor.perform();

      sinon.assert.calledOnce(before);
      sinon.assert.calledOnce(after);

      sinon.assert.calledOnce(perform);
      sinon.assert.notCalled(rollback);

      await interactor.rollback();

      sinon.assert.calledOnce(rollback);
    });
  });

  context('without callbacks', () => {
    it('produces a Interactor', async () => {
      const perform = sinon.stub();

      const Klass = createSafeInteractor(perform);
      const interactor = new Klass();

      assert.instanceOf(interactor, SafeInteractor);

      await interactor.perform();

      sinon.assert.calledOnce(perform);

      await interactor.rollback();
    });
  });
});
