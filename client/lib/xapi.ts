import type { Task } from "@shared/tasks";
import { sendXapiStatement } from "./xapiSend";

const VERBS = {
  selected: {
    id: "http://id.tincanapi.com/verb/selected",
    display: { "en-US": "selected" },
  },
  discarded: {
    id: "http://id.tincanapi.com/verb/discarded",
    display: { "en-US": "discarded" },
  },
} as const;

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
export async function sendCheckboxXapi(ctx: CheckboxXapiContext) {
  const { weekNumber, dayKey, task, checked } = ctx;

  // Only send on check (recommended for POC)
  if (!checked) {
    console.log("[xAPI] Checkbox toggled (no send on uncheck)", {
      weekNumber, dayKey, taskId: task.id, checked,
    });
    return;
  }

  const taskLabel = `Module ${task.module} · ${task.unit} · Page ${task.page} · ${task.activity_type}`;

  // set up the actor; currently hardcoded
  const actor = {
    name: "Demo Learner",
    mbox: "mailto:demo@example.com",
  };

  const statement = {
    actor,
    verb: {
      id: "http://id.tincanapi.com/verb/selected",
      display: { "en-US": "selected" },
    },
    object: {
      // Make object IDs stable and meaningful
      id: `https://academyproduct.github.io/dynamic_completion_guide/xapi/task/${task.id}`,
      definition: {
        name: { "en-US": taskLabel },
        type: "http://adlnet.gov/expapi/activities/lesson",
      },
    },
    context: {
      contextActivities: {
        parent: [
          {
            id: `https://academyproduct.github.io/dynamic_completion_guide/xapi/week/${weekNumber}/day/${dayKey}`,
            definition: {
              name: { "en-US": `Week ${weekNumber} · ${dayKey}` },
            },
          },
        ],
      },
      extensions: {
        "https://academyproduct.github.io/dynamic_completion_guide/xapi/ext/weekNumber": weekNumber,
        "https://academyproduct.github.io/dynamic_completion_guide/xapi/ext/dayKey": dayKey,
        "https://academyproduct.github.io/dynamic_completion_guide/xapi/ext/taskId": task.id,
        "https://academyproduct.github.io/dynamic_completion_guide/xapi/ext/module": task.module,
        "https://academyproduct.github.io/dynamic_completion_guide/xapi/ext/activity_type": task.activity_type,
      },
    },
    timestamp: new Date().toISOString(),
  };

  try {
    await sendXapiStatement(statement);
    console.log("[xAPI] Sent", { weekNumber, dayKey, taskId: task.id, taskLabel });
  } catch (err) {
    console.error("[xAPI] Failed to send", err);
  }
}
