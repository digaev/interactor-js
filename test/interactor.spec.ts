/* eslint-disable max-classes-per-file */
import Sinon from 'sinon';
import { assert } from 'chai';

import Interactor from '../lib/interactor';

class TestInteractor1 extends Interactor {
  afterStub = Sinon.stub().resolves();

  beforeStub = Sinon.stub().resolves();

  failStub = Sinon.spy();

  performStub = Sinon.stub().resolves();

  rollbackStub = Sinon.stub().resolves();

  public after(): Promise<any> {
    return this.afterStub();
  }

  public before(): Promise<any> {
    return this.beforeStub();
  }

  public perform(): Promise<void> {
    return this.performStub();
  }

  public fail(context?: any): void {
    this.failStub(context);

    return super.fail(context);
  }

  public rollback(): Promise<any> {
    return this.rollbackStub();
  }
}

class TestInteractor2 extends Interactor {
  afterStub = Sinon.stub().resolves();

  beforeStub = Sinon.stub().resolves();

  failStub = Sinon.spy();

  rollbackStub = Sinon.stub().resolves();

  public after(): Promise<any> {
    return this.afterStub();
  }

  public before(): Promise<any> {
    return this.beforeStub();
  }

  public async perform(): Promise<void> {
    this.fail({ error: new Error('Boo!') });
  }

  public fail(context?: any): void {
    this.failStub(context);

    return super.fail(context);
  }

  public rollback(): Promise<any> {
    return this.rollbackStub();
  }
}

describe('Interactor', () => {
  afterEach(() => {
    Sinon.restore();
  });

  describe('static perform', () => {
    describe('without errors', () => {
      it('succeeds', async () => {
        const interactor = await TestInteractor1.perform<TestInteractor1>();

        assert.isFalse(interactor.failure);
        assert.isTrue(interactor.success);

        Sinon.assert.calledOnce(interactor.afterStub);
        Sinon.assert.calledOnce(interactor.beforeStub);
        Sinon.assert.calledOnce(interactor.performStub);
        Sinon.assert.notCalled(interactor.failStub);
        Sinon.assert.notCalled(interactor.rollbackStub);
      });
    });

    describe('with errors', () => {
      it('fails', async () => {
        const interactor = await TestInteractor2.perform<TestInteractor2>();

        assert.isTrue(interactor.failure);
        assert.isFalse(interactor.success);

        Sinon.assert.notCalled(interactor.afterStub);
        Sinon.assert.calledOnce(interactor.beforeStub);
        Sinon.assert.calledOnce(interactor.failStub);
        Sinon.assert.notCalled(interactor.rollbackStub);

        assert.instanceOf(interactor.context.error, Error);
        assert.equal(interactor.context.error.message, 'Boo!');
      });
    });
  });
});
