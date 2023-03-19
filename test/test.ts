import { Queued } from "../src";

// queue without limit
describe('Queue', () => {
    test('unknown tasks', async () => {
        const tasks = [
            () => Promise.resolve(true),
            async () => 30,
            () => new Promise(res => {
                setTimeout(() => res('delayed'), 10);
            })
        ]

        const queue = new Queued(tasks).all()

        return expect(queue).resolves.toStrictEqual([true, 30, 'delayed'])
    })

    test('concurrent promises', async () => {
        const promises = []
        const callback = jest.fn();

        for(const index of Array(8)){
            promises.push(() => new Promise(res => setTimeout(() => {
                callback();
                res(index)
            }, 100)));
        }

        new Queued(promises).all()
        
        return await new Promise(res => setTimeout(() => {
            res(expect(callback).toBeCalledTimes(8))
        }, 300));
    })

    test('concurrent promises, limit 2', async () => {
        const promises = []
        const callback = jest.fn();
        for(const index of Array(8)){
            promises.push(() => new Promise(res => setTimeout(() => {
                callback();
                res(index)
            }, 100)));
        }
        new Queued(promises, {limit: 2}).all()

        return await new Promise(res => setTimeout(() => {
            res(expect(callback).toBeCalledTimes(4))
        }, 300));
    })
})