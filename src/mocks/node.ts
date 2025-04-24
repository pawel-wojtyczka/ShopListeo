import { setupServer } from "msw/node";
import { handlers } from "./handlers";

// Eksport serwera MSW, który będzie używany do mockowania API w testach
export const server = setupServer(...handlers);
