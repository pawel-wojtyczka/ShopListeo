// <docs-tag name="simple-workflow-example">
import { WorkflowEntrypoint, WorkflowEvent, WorkflowStep } from 'cloudflare:workers';

// Use a more specific type if possible, or allow any key-value pairs
// Using 'object' might be too restrictive if properties are expected.
// Using 'unknown' in values allows flexibility.
type Env = Record<string, unknown>;

// Use interface for consistency, {} is often discouraged, but acceptable for Params if truly empty.
// If Params might have properties later, define them.
// Use a similar pattern as Env to allow any parameters if none are defined yet.
type Params = Record<string, unknown>;

// Create your own class that implements a Workflow
export class MyWorkflow extends WorkflowEntrypoint<Env, Params> {
	// Define a run() method
	async run(event: WorkflowEvent<Params>, step: WorkflowStep) {
		// Define one or more steps that optionally return state.
		const state = step.do('my first step', async () => {
			return [1, 2, 3];
		});

		step.do('my second step', async () => {
			for (const _data in state) {
				// Do something with your state
			}
		});
	}
}
// </docs-tag name="simple-workflow-example">
