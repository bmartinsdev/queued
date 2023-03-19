import { Queued } from "../src";

// queue without limit
describe('Queue', () => {
    test('unknown tasks', async () => {
        const promises = [
            Promise.resolve(true),
            30,
            new Promise(res => {
                setTimeout(() => res('delayed'), 300);
            })
        ]

        const queue = await new Queued(promises).all()
        
        expect(queue).toStrictEqual([true, 30, 'delayed'])
    })
})
// init queue

// queue concurrency

// concurrency with failed promise

// retry queued promise