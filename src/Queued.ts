import { QueueInfo, type QueuedOptions } from './Types'

export class Queued {
  private limit = 0
  private retry = 0
  private queue: Map<CallableFunction, QueueInfo> = new Map()
  private stopOnFail = true
  private onUpdate: CallableFunction
  private onFinish: CallableFunction

  constructor(tasks: CallableFunction[], options?: QueuedOptions) {
    for (const task of tasks) {
      this.queue.set(task, { retried: 0, status: 'queued' })
    }

    if (!options) return
    if (options.limit) this.limit = options.limit
    if (options.retry) this.retry = options.retry
    if (options.onUpdate) this.onUpdate = options.onUpdate
  }

  private async runTask(task: CallableFunction) {
    this.queue.get(task).status = 'processing'

    // call task
    task()
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
    const processing = [];
    
    for (const task of this.queue.keys()) {
      if (this.queue.get(task).status === 'processing') {
        processing.push(task);
      }
    }
    
    let spots = !this.limit ? this.queue.size : this.limit - processing.length;
    
    if(spots){
      for (const task of this.queue.keys()) {
        if (this.queue.get(task).status === 'queued' && spots) {
          this.runTask(task);
          spots--
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

  all(): Promise<unknown[]> {
    this.stopOnFail = false
    this.processQueue()

    return new Promise(
      resolve => (this.onFinish = () => resolve(this.getCompletedTasks()))
    )
  }
}