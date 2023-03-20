# queue-limit

Lightweight package to handle multiple async calls with rate limiting.

## Install

```sh
npm i queued 
```


## Usage

```sh
import { Queued } from 'queue-limit';

const tasks = [
    () => Promise.resolve(true),
    async () => 30,
    () => new Promise(res => {
        setTimeout(() => res('delayed'), 10);
    })
]

const res = await new Queued(tasks).all()

```

## Roadmap

- [x] promise all
- [x] concurrency control
- [x] call onUpdate callback
- [x] test coverage for onUpdate callback