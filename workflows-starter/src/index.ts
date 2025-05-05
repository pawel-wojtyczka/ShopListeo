// <docs-tag name="full-workflow-example">
import { WorkflowEntrypoint, WorkflowStep, WorkflowEvent } from 'cloudflare:workers';

// Use interface for consistency
interface Env {
	// Add your bindings here, e.g. Workers KV, D1, Workers AI, etc.
	MY_WORKFLOW: Workflow;
}

// Use interface for consistency
interface Params {
	email: string;
	metadata: Record<string, string>;
}

// Define the structure of the response from Cloudflare IPs API
interface CloudflareIPsResponse {
	result: {
		ipv4_cidrs: string[];
		ipv6_cidrs: string[];
		etag: string;
	};
	success: boolean;
	errors: string[];
	messages: string[];
}

// <docs-tag name="workflow-entrypoint">
export class MyWorkflow extends WorkflowEntrypoint<Env, Params> {
	async run(event: WorkflowEvent<Params>, step: WorkflowStep) {
		// Can access bindings on `this.env`
		// Can access params on `event.payload`

		// Prefix with '_' if files is unused, or remove if not needed
		const _files = await step.do('my first step', async () => {
			// Fetch a list of files from $SOME_SERVICE
			return {
				inputParams: event,
				files: [
					'doc_7392_rev3.pdf',
					'report_x29_final.pdf',
					'memo_2024_05_12.pdf',
					'file_089_update.pdf',
					'proj_alpha_v2.pdf',
					'data_analysis_q2.pdf',
					'notes_meeting_52.pdf',
					'summary_fy24_draft.pdf',
				],
			};
		});

		// You can optionally have a Workflow wait for additional data:
		// human approval or an external webhook or HTTP request, before progressing.
		// You can submit data via HTTP POST to /accounts/{account_id}/workflows/{workflow_name}/instances/{instance_id}/events/{eventName}
		// Prefix with '_' if waitForApproval is unused, or remove if not needed
		const _waitForApproval = await step.waitForEvent('request-approval', {
			type: 'approval', // define an optional key to switch on
			timeout: '1 minute', // keep it short for the example!
		});

		// Prefix with '_' if apiResponse is unused, or remove if not needed
		const _apiResponse = await step.do('some other step', async () => {
			// Use const for resp as it's not reassigned
			const resp = await fetch('https://api.cloudflare.com/client/v4/ips');
			// Use the specific interface for the API response type.
			// This ensures the type is known and likely serializable by Cloudflare.
			return await resp.json<CloudflareIPsResponse>();
		});

		await step.sleep('wait on something', '1 minute');

		await step.do(
			'make a call to write that could maybe, just might, fail',
			// Define a retry strategy
			{
				retries: {
					limit: 5,
					delay: '5 second',
					backoff: 'exponential',
				},
				timeout: '15 minutes',
			},
			async () => {
				// Do stuff here, with access to the state from our previous steps
				if (Math.random() > 0.5) {
					throw new Error('API call to $STORAGE_SYSTEM failed');
				}
			},
		);
	}
}
// </docs-tag name="workflow-entrypoint">

// <docs-tag name="workflows-fetch-handler">
export default {
	async fetch(req: Request, env: Env): Promise<Response> {
		// Use const for url as it's not reassigned
		const url = new URL(req.url);

		if (url.pathname.startsWith('/favicon')) {
			return Response.json({}, { status: 404 });
		}

		// Get the status of an existing instance, if provided
		// GET /?instanceId=<id here>
		// Use const for id as it's not reassigned
		const id = url.searchParams.get('instanceId');
		if (id) {
			// Use const for instance as it's not reassigned within this block
			const instance = await env.MY_WORKFLOW.get(id);
			return Response.json({
				status: await instance.status(),
			});
		}

		// Spawn a new instance and return the ID and status
		// Use const for instance as it's not reassigned
		const instance = await env.MY_WORKFLOW.create();
		// You can also set the ID to match an ID in your own system
		// and pass an optional payload to the Workflow
		// let instance = await env.MY_WORKFLOW.create({
		// 	id: 'id-from-your-system',
		// 	params: { payload: 'to send' },
		// });
		return Response.json({
			id: instance.id,
			details: await instance.status(),
		});
	},
};
// </docs-tag name="workflows-fetch-handler">
// </docs-tag name="full-workflow-example">
