import { setupWorker } from "msw/browser";
import { handlers } from "./handlers";

// Eksport instancji worker, która będzie używana do mockowania API w przeglądarce
export const worker = setupWorker(...handlers);
