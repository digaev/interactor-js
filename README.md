# interactor-organizer

[![CircleCI](https://dl.circleci.com/status-badge/img/gh/digaev/interactor-js/tree/master.svg?style=svg)](https://dl.circleci.com/status-badge/redirect/gh/digaev/interactor-js/tree/master)
[![Coverage Status](https://coveralls.io/repos/github/digaev/interactor-js/badge.svg)](https://coveralls.io/github/digaev/interactor-js)
[![npm](https://img.shields.io/npm/v/interactor-organizer)](https://www.npmjs.com/package/interactor-organizer)

Interactor pattern implementation, inspired by Ruby gem [interactor](https://github.com/collectiveidea/interactor).

There are a few similar packages, but most of them are quite old and I like my implementation more. *I might rename the package, unfortunately all the pretty names are already taken and I've run out of ideas* 😕

## Getting started

```bash
npm i interactor-organizer
```

```ts
import { Interactor } from 'interactor-organizer';

class DoSomething extends Interactor {
  async after() {
    console.log('after');
  }

  async before() {
    console.log('before');
  }

  // Your business logic goes here
  async perform() {
    console.log('perform', this.context);

    try {
      this.context.bar = 'baz';
    } catch (error) {
      this.fail({ error });
    }
  }
}

async function main() {
  // Perform the interactor
  const interactor = await DoSomething.perform({ foo: 'bar' });

  console.log(interactor.failure, interactor.success, interactor.context);
}

main();

// output
/**
before
perform { foo: 'bar' }
after
false true { foo: 'bar', bar: 'baz' }
*/
```

## Interactors

Every interactor has `after`, `before`, `fail`, `perform` and `rollback` methods, they are very similar to the Ruby gem methods, the only "new" method is `perform` (which is used here instead of `call`).

### constructor

`constructor(context?: any)`

Anything you want to pass to the interactor or return from it should be stored in `context`. Expected an object, default `{}`.

### after

`after(): Promise<any>`

Is called after `perform` only if the interactor didn't `fail`.

### before

`before(): Promise<any>`

Is always called before `perform`.

### fail

`fail(context?: any): void`

If something went wrong use this method. It sets the interactor's property `failure` to `true` (which is also used by Organizers).

`context` is appended to the current context. Expected an object.

### perform

`perform(): Promise<any>`

Your business logic goes here. Under the hood, this method is modified so that it calls the `after` and `before` hooks.

There is also a static method `perform(context?: any): Promise<Interactor>`.

### rollback

`rollback(): Promise<any>`

This method is only used by Organizers if the interactor failed, to undo changes made by `perform`.

### context

`context: any`

Current context. An object.

### failure

`failure: boolean`

Indicates if the interactor failed.

### success

`success: boolean`

The opposite of `failure`.

## Organizers

Organizers sequentially `perform` interactors, if any interactor in the chain fails all the previous interactors will `rollback` (from the last resolved to the first). If any `rollback` rejects the organizer will reject as well (any further interactors won't `rollback`)!

## Usage

Interactors example:

```ts
import { Interactor } from "interactor-organizer";

class PlaceOrder extends Interactor {
  get order() {
    return this.context.order;
  }

  get user() {
    return this.context.user;
  }

  async perform() {
    this.order.user = { _id: this.user._id };

    return client.db().collection('orders').insertOne(this.order)
      .then((result) => {
        this.order._id = result.insertedId;
      })
      .catch((error) => {
        this.fail({ error });
      });
  }

  async rollback() {
    // Delete the order if ChargeCard fails
    return client.db().collection('orders').deleteOne({ _id: this.order._id })
  }
}

class ChargeCard extends Interactor {
  async perform() {
    // API call to the payment system
  }
}
```

In the example above we're catching errors manually, but it can be tedious especially if you have more than a couple of interactors, so let's override the `perform` method to make it catch all errors for us:

```ts
class SafeInteractor extends Interactor {
  protected hookPerform(): void {
    super.hookPerform();

    const original = this.perform;

    this.perform = () => original.call(this)
      .catch((error) => {
        this.fail({ error });
      });
  }
}

// Inherit your interactors from SafeInteractor
```

Organizers example:

```ts
import { Organizer } from "interactor-organizer";

class CreateOrder extends Organizer {
  static organize() {
    return [PlaceOrder, ChargeCard];
  }
}
```

```ts
// orders.controller.ts
function createOrder(req, res, next) {
  CreateOrder.perform({ order: ...req.body, user: req.user })
    .then((result) => {
      if (result.failure) {
        throw result.context.error;
      }

      res.status(201).json({ _id: result.context.order._id });
    })
    .catch(next);
}
```

Checking for `failure` every time may not always can be convenient, instead, you can throw errors from the organizer:

```ts
class StrictOrganizer extends Organizer {
  static async perform(context: any = {}) {
    return super.perform(context)
      .then((result) => {
        if (result.failure) {
          throw result.context.error || new Error(`${this.name} failed`);
        }
        return result;
      });
  }
}

// Inherit your organizers from StrictOrganizer
```
