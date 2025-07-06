import TaskQueue from "./queues/TaskQueue";

class Tools {
    /**
     * The general-purpose prioritized task queue utility.
     * @example
     * const taskQueue = new atomix.tools.TaskQueue();
     * 
     * taskQueue.addTask({
     *     id: 'test',
     *     type: 'test',
     *     priority: 1,
     *     action: async () => console.log('test')
     * });
     * 
     * await taskQueue.untilComplete();
     * // Now all tasks have been processed
     * @since v1.0.2
     */
    readonly TaskQueue = TaskQueue;
}

const tools = new Tools();
export default tools;