import { Queued } from "../src";

// queue without limit
describe('Queue', () => {
    test('concurrent promises', async () => {
        const promises: CallableFunction[] = []
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
        const promises: CallableFunction[] = []
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

    test('onUpdate is called', async () => {
        const promises: CallableFunction[] = []
        const callback = jest.fn();
        for(const index of Array(3)){
            promises.push(() => new Promise(res => setTimeout(() => {
                res(index)
            }, 100)));
        }
        await new Queued(promises, {onUpdate: callback}).all()

        return expect(callback).toBeCalledTimes(3)
    })
})