import Sinon from 'sinon';
import { assert } from 'chai';

import Interactor from "../lib/interactor";
import Organizer from "../lib/organizer";
import { Context } from '../lib/context';

class TestInteractor extends Interactor {
  static rollbackSpy: Sinon.SinonSpy;

  constructor(context: Context = {}) {
    super(context);

    (this.constructor as any).rollbackSpy?.resetHistory();
  }

  public rollback(): Promise<any> {
    (this.constructor as any).rollbackSpy();
    return super.rollback();
  }
}

class TestInteractor1 extends TestInteractor {
  static rollbackSpy = Sinon.spy();
}

class TestInteractor2 extends TestInteractor {
  static rollbackSpy = Sinon.spy();
}

class TestInteractor3 extends TestInteractor {
  static rollbackSpy = Sinon.spy();

  async call() {
    throw new Error('TestInteractor3 failed!');
  }
}

class TestInteractor4 extends TestInteractor {
  static rollbackSpy = Sinon.spy();
}

class TestInteractor5 extends TestInteractor {
  public rollback(): Promise<any> {
    throw new Error('TestInteractor5 rollback failed!');
  }
}

class TestInteractor6 extends TestInteractor {
  static rollbackSpy = Sinon.spy();
}

class TestInteractor7 extends TestInteractor {
  static rollbackSpy = Sinon.spy();

  public async call(): Promise<any> {
    throw new Error('TestInteractor7 failed!');
  }
}

class TestOrganizer1 extends Organizer {
  static organize() {
    return [TestInteractor1, TestInteractor2];
  }
}

class TestOrganizer2 extends Organizer {
  static organize() {
    return [TestInteractor1, TestInteractor2, TestInteractor3, TestInteractor4];
  }
}

class TestOrganizer3 extends Organizer {
  static organize() {
    return [TestInteractor4, TestInteractor5, TestInteractor6, TestInteractor7];
  }
}

describe('Organizer', () => {
  describe('perform', () => {
    context('without errors', () => {
      it('should success', async () => {
        const context = { foo: 'bar' };
        const result = await TestOrganizer1.perform(context);

        assert.deepEqual(result, {
          context,
          failure: false,
          success: true,
        });

        Sinon.assert.notCalled(TestInteractor1.rollbackSpy);
        Sinon.assert.notCalled(TestInteractor2.rollbackSpy);
        Sinon.assert.notCalled(TestInteractor3.rollbackSpy);
        Sinon.assert.notCalled(TestInteractor4.rollbackSpy);
      });
    });

    context('with errors', () => {
      it('should fail', async () => {
        const context: any = {};
        const result = await TestOrganizer2.perform(context);

        assert.isTrue(result.failure);
        assert.isFalse(result.success);

        assert.instanceOf(context.error, Error);
        assert.equal(context.error.message, 'TestInteractor3 failed!');

        Sinon.assert.calledOnce(TestInteractor1.rollbackSpy);
        Sinon.assert.calledOnce(TestInteractor2.rollbackSpy);
        Sinon.assert.notCalled(TestInteractor3.rollbackSpy);
        Sinon.assert.notCalled(TestInteractor4.rollbackSpy);
      });
    });

    context('when rollback rejects', () => {
      it('rejects', async () => {
        let error: any;

        try {
          await TestOrganizer3.perform();
        } catch (e) {
          error = e;
        }

        assert.instanceOf(error, Error);
        assert.equal(error.message, 'TestInteractor5 rollback failed!');

        Sinon.assert.notCalled(TestInteractor4.rollbackSpy);
        Sinon.assert.calledOnce(TestInteractor6.rollbackSpy);
        Sinon.assert.notCalled(TestInteractor7.rollbackSpy);
      })
    });
  });
});
