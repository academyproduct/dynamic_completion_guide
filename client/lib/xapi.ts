import type { Task } from "@shared/tasks";

export type CheckboxXapiContext = {
  weekNumber: number;   // e.g. 1
  dayKey: string;       // e.g. "M", "T", "W", "Th", "F", "S", "Su"
  task: Task;           // the full task object
  checked: boolean;     // true = user just checked it, false = unchecked
};

// Optional: bridge to your existing PoC xapi.js via window
declare global {
  interface Window {
    /**
     * Optional bridge function that can be implemented in your
     * xapi.js proof-of-concept to actually send the xAPI statement.
     *
     * If it's not present, we'll just log to the console.
     */
    sendCheckboxXapi?: (payload: {
      weekNumber: number;
      dayKey: string;
      taskId: number | string;
      taskLabel: string;
      checked: boolean;
    }) => void;
  }
}

/**
 * Call this whenever a checkbox is toggled.
 * It centralizes how we translate UI context → xAPI payload.
 */
export function sendCheckboxXapi(ctx: CheckboxXapiContext) {
  const { weekNumber, dayKey, task, checked } = ctx;

  // Derive a human-readable label for the task
  const taskLabel =
    // adjust these fields to match your Task type
    (task as any).title ??
    (task as any).name ??
    String(task.id);

  // Debug log so you can verify things before wiring to the LRS
  console.log("[xAPI] Checkbox toggled", {
    weekNumber,
    dayKey,
    taskId: task.id,
    taskLabel,
    checked,
  });

  // If your PoC xapi.js has attached a bridge, use it:
  if (typeof window !== "undefined" && typeof window.sendCheckboxXapi === "function") {
    window.sendCheckboxXapi({
      weekNumber,
      dayKey,
      taskId: task.id,
      taskLabel,
      checked,
    });
  }
}
