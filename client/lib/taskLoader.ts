import { Task, TaskPool } from '@shared/tasks';

export async function loadTasks(): Promise<Task[]> {
  try {
    const response = await fetch('../tasks.json');
    if (!response.ok) {
      throw new Error('Failed to load tasks');
    }
    const data = await response.json();
    return data.Tasks || [];
  } catch (error) {
    console.error('Error loading tasks:', error);
    return [];
  }
}

export function initializeTaskPool(tasks: Task[]): TaskPool {
  return {
    available: tasks.map(t => ({ ...t, status: 'available' as const })),
    assigned: [],
    completed: [],
  };
}

export function getTaskById(id: number, pool: TaskPool): Task | null {
  const allTasks = [...pool.available, ...pool.assigned, ...pool.completed];
  return allTasks.find(t => t.id === id) || null;
}

export function moveTaskToCompleted(
  taskId: number,
  pool: TaskPool
): TaskPool {
  const task = pool.assigned.find(t => t.id === taskId);
  if (!task) return pool;
  
  return {
    available: pool.available,
    assigned: pool.assigned.filter(t => t.id !== taskId),
    completed: [...pool.completed, { ...task, status: 'completed' }],
  };
}

export function moveTaskFromCompletedToAssigned(
  taskId: number,
  pool: TaskPool
): TaskPool {
  const task = pool.completed.find(t => t.id === taskId);
  if (!task) return pool;
  
  return {
    available: pool.available,
    assigned: [...pool.assigned, { ...task, status: 'assigned' }],
    completed: pool.completed.filter(t => t.id !== taskId),
  };
}
