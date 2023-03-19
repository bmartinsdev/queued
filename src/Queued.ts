import { QueueInfo, type QueuedOptions } from './Types'

export class Queued {
  private limit = 0
  private retry = 0
  private queue: Map<unknown | Promise<unknown>, QueueInfo> = new Map()
  private stopOnFail = true
  private onUpdate: CallableFunction
  private onFinish: CallableFunction

  constructor(tasks: (unknown | Promise<unknown>)[], options?: QueuedOptions) {
    for (const task of tasks) {
      this.queue.set(task, { retried: 0, status: 'queued' })
    }

    if (!options) return
    if (options.limit) this.limit = options.limit
    if (options.retry) this.retry = options.retry
    if (options.onUpdate) this.onUpdate = options.onUpdate
  }

  private async runJob(task: unknown) {
    this.queue.get(task).status = 'processing'

    // call task
    Promise.resolve(task)
      .then(res => {
        this.queue.get(task).result = res
        this.queue.get(task).status = 'complete'
        this.checkIfFinished()
      })
      .catch(res => {
        this.queue.get(task).result = res
        this.queue.get(task).retried = this.queue.get(task).retried++
        if (this.queue.get(task).retried >= this.retry) {
          this.queue.get(task).status = 'failed'
        } else {
          this.queue.get(task).status = 'queued'
        }
        this.checkIfFinished()
      })
  }

  private async processQueue() {
    const concurrent = this.limit || this.queue.size
    let jobs = 0

    for (const task of this.queue.keys()) {
      if (this.queue.get(task).status === 'queued') {
        if (jobs < concurrent) {
          this.runJob(task)
          jobs++
        }
      }
    }
  }

  private checkIfFinished() {
    const tasks = Array.from(this.queue.values())

    for (const task of tasks) {
      // if some called, exit on any failed
      if (this.stopOnFail && task.status === 'failed') {
        return this.onFinish()
      }

      // if all, recursive while processing or queued
      if (['queued', 'processing'].includes(task.status)) {
        return this.processQueue()
      }
    }

    // if reached here, all promises resolved
    return this.onFinish()
  }

  private getCompletedTasks(): unknown[] {
    return Array.from(this.queue.values()).map((task: QueueInfo) => task.result)
  }

  some(): Promise<unknown[]> {
    this.stopOnFail = true
    this.processQueue()

    return new Promise(
      resolve => (this.onFinish = () => resolve(this.getCompletedTasks()))
    )
  }

  all(): Promise<unknown[]> {
    this.stopOnFail = false
    this.processQueue()

    return new Promise(
      resolve => (this.onFinish = () => resolve(this.getCompletedTasks()))
    )
  }
}
