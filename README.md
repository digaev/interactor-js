# interactor-js

[![CircleCI](https://dl.circleci.com/status-badge/img/gh/digaev/interactor-js/tree/master.svg?style=svg)](https://dl.circleci.com/status-badge/redirect/gh/digaev/interactor-js/tree/master)
[![Coverage Status](https://coveralls.io/repos/github/digaev/interactor-js/badge.svg)](https://coveralls.io/github/digaev/interactor-js)

Implementation of the Interactor pattern, inspired by Ruby gem [interactor](https://github.com/collectiveidea/interactor).

## Getting started

```bash
npm i interactor-js
```

## Interactors

Every interactor has `after`, `before`, `call`, `fail`, `perform` and `rollback` methods, they are very similar to the Ruby gem methods, the only new method is `perform`.

### after

`after(): Promise<any>`

Is called only if `call` was resolved.

### before

`before(): Promise<any>`

Always called before `call`.

### call

`call(): Promise<any>`

Business logic goes here.

### fail

`fail(context?: Context): void`

If something went wrong use this method. It sets the interactor's property `failure` to `true` (which is also used by Organizers). `context` is appended to the current context.

### perform

`perform(): Promise<Interactor>`

Is the **entry point**. This method calls `before`, `call` and `after` one after the other (in this order), if any of these methods are rejected `perform` will catch the error and call `fail({ error })`, therefore the method itself is never rejected. Returns the interactor.

### rollback

`rollback(): Promise<any>`

Is called after `call` if the interactor failed. This method is only used by Organizers (see below).

## context

`context: Context`

Current context.

### failure

`failure: boolean`

Indicates if the interactor failed.

### success

`success: boolean`

The opposite of `failure`.

```ts
import { Interactor } from "interactor-js";

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

Organizers sequentially `perform` interactors, if any interactor in the chain is failed all the previous interactors will `rollback` (from the last resolved to the first). If any `rollback` is rejected the organizer will be rejected as well (any further interactors won't `rollback`)!

```ts
import { Organizer } from "interactor-js";

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
