# interactor-organizer

[![CircleCI](https://dl.circleci.com/status-badge/img/gh/digaev/interactor-js/tree/master.svg?style=svg)](https://dl.circleci.com/status-badge/redirect/gh/digaev/interactor-js/tree/master)
[![Coverage Status](https://coveralls.io/repos/github/digaev/interactor-js/badge.svg)](https://coveralls.io/github/digaev/interactor-js)
[![npm](https://img.shields.io/npm/v/interactor-organizer)](https://www.npmjs.com/package/interactor-organizer)

Implementation of the Interactor pattern, inspired by Ruby gem [interactor](https://github.com/collectiveidea/interactor).

There are a few similar packages, but most of them are quite old and I like my implementation more. *I might rename the package, unfortunately all the pretty names are already taken and I've run out of ideas* 😕

## Getting started

```bash
npm i interactor-organizer
```

```ts
import { Interactor } from 'interactor-organizer';

// Define an interactor
class DoSomething extends Interactor {
    // If there is anything needs to be done after `call`
    async after() {
        console.log('after');
    }

    // If there is anything needs to be done before `call`
    async before() {
        console.log('before');
    }

    // Your business logic goes here
    async call() {
      try {
        console.log('call', this.context);
      } catch (e) {
        this.fail({ error: e }); // add `error` to `context`
      }
    }

    // If you need do undo changes made by `call` if it fails
    // This method is only used by Organizers
    async rollback() {
        console.log('rollback');
    }
}

// Instantiate the interactor
const interactor = new DoSomething({ foo: 'bar' });

// Notice that we use `perform`, not `call`
// The main difference between these two is that `call` should only have the business logic,
// it "ignores" `after` and `before` hooks (read below for the details)
await interactor.perform();

// There is also a static method `perform`, so alternatively you can use interactors that way:
// const interactor = await DoSomething.perform({ foo: 'bar' });

console.log(interactor.failure, interactor.success, interactor.context);

// output
/**
before
call { foo: 'bar' }
after
false true { foo: 'bar' }
*/
```

## Interactors

Every interactor has `after`, `before`, `call`, `fail`, `perform` and `rollback` methods, they are very similar to the Ruby gem methods, the only new method is `perform`.

### after

`after(): Promise<any>`

Is called only if `call` was resolved. Only used by `perform`.

### before

`before(): Promise<any>`

Always called before `call`. Only used by `perform`.

### call

`call(): Promise<any>`

Your business logic goes here.

### fail

`fail(context?: Context): void`

If something went wrong use this method. It sets the interactor's property `failure` to `true` (which is also used by Organizers). `context` is appended to the current context.

### perform

`perform(): Promise<Interactor>`

This method calls `before`, `call` and `after` (in this order), if any of these methods are rejected `perform` will catch the error and call `fail({ error })`, therefore the method itself is never rejected. Returns the interactor.

Most of the time you want to use this method instead of `call`. Organizers also use this method.

### rollback

`rollback(): Promise<any>`

If you need to undo changes made by `call`. This method is only used by Organizers if the interactor failed.

### context

`context: Context`

Current context.

### failure

`failure: boolean`

Indicates if the interactor failed.

### success

`success: boolean`

The opposite of `failure`.
___

```ts
import { Interactor } from "interactor-organizer";

class PlaceOrder extends Interactor {
    get order() {
        return this.context.order;
    }

    get user() {
        return this.context.user;
    }

    async call() {
        this.order.user = { _id: this.user._id };

        return client.db().collection('orders').insertOne(this.order)
            .then((result) => {
                this.order._id = result.insertedId;
            });
    }

    async rollback() {
        // Delete the order if ChargeCard fails
        return client.db().collection('orders').deleteOne({ _id: this.order._id })
    }
}

class ChargeCard extends Interactor {
    async call() {
        // API call to the payment system
    }
}
```

## Organizers

Organizers sequentially `perform` interactors, if any interactor in the chain fails all the previous interactors will `rollback` (from the last resolved to the first). If any `rollback` rejects the organizer will reject as well (any further interactors won't `rollback`)!

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
___
