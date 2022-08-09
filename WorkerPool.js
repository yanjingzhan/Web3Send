const { AsyncResource } = require('async_hooks'); // 用于异步加载资源
const { EventEmitter } = require('events');
const path = require('path');
const { Worker } = require('worker_threads');

const kTaskInfo = Symbol('kTaskInfo');
const kWorkerFreedEvent = Symbol('kWorkerFreedEvent');

class WorkerPoolTaskInfo extends AsyncResource {
    constructor(callback) {
        super('WorkerPoolTaskInfo');
        this.callback = callback;
    }

    done(err, result) {
        this.runInAsyncScope(this.callback, null, err, result);
        this.emitDestroy();  // 只会被执行一次
    }
}

class WorkerPool extends EventEmitter {
    constructor(numThreads) {
        super();
        this.numThreads = numThreads;
        this.workers = [];
        this.freeWorkers = [];

        for (let i = 0; i < numThreads; i++)
            this.addNewWorker();
    }

    /**
     * 添加新的线程
     */
    addNewWorker() {
        const worker = new Worker(path.resolve(__dirname, 'task2.js'));
        worker.on('message', (result) => {
            // 如果成功状态，则将回调传给runTask方法，然后worker移除TaskInfo标记。
            worker[kTaskInfo].done(null, result);
            worker[kTaskInfo] = null;
            //
            this.freeWorkers.push(worker);
            this.emit(kWorkerFreedEvent);
        });

        worker.on('error', (err) => {
            // 报错后调用回调
            if (worker[kTaskInfo])
                worker[kTaskInfo].done(err, null);
            else
                this.emit('error', err);
            // 移除一个worker，然后启动一个新的worker来代替当前的worker
            this.workers.splice(this.workers.indexOf(worker), 1);
            this.addNewWorker();
        });
        
        this.workers.push(worker);
        this.freeWorkers.push(worker);
        this.emit(kWorkerFreedEvent);
    }

    /**
     * 执行任务
     * @param task
     * @param callback
     */
    runTask(task, callback) {
        if (this.freeWorkers.length === 0) {
            this.once(kWorkerFreedEvent, () => this.runTask(task, callback));
            return;
        }

        const worker = this.freeWorkers.pop();
        worker[kTaskInfo] = new WorkerPoolTaskInfo(callback);
        worker.postMessage(task);
    }

    /**
     * 关闭线程
     */
    close() {
        for (const worker of this.workers) {
            worker.terminate();
        }
    }
}

module.exports = WorkerPool;