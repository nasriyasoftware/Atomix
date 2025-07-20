// Tools index: `@nasriya/atomix/tools`
import tools from "./tools";
export default tools;

export { TasksQueue } from "./queues/TasksQueue";
export { EventEmitter } from "./events/EventEmitter";

// Export JSDoc types
export type { BaseQueueTask, TasksQueueOptions, AddTasksBaseOptions } from "./queues/docs";
export type { EventHandler, AddHandlerOptions } from "./events/docs";