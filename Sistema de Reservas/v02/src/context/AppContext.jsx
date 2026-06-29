import { createContext } from "react";

export const AppCtx = createContext({ page: "login", setPage: () => {} });
