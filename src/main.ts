// Entry point. Wires the application shell (implementation-spec.md §6) to the document.
//
// No service worker is registered here, deliberately — implementation-spec.md §6 explains why: a
// caching service worker would make a landed deploy look like a failed one, destroying the exact
// signal this stage exists to establish. It arrives with offline behaviour and an update strategy.

import "./style.css";
import { renderShell } from "./shell/shell.ts";

const root = document.querySelector<HTMLElement>("#app");
if (!root) throw new Error("index.html is missing its #app root element");

renderShell(root, { sha: __BUILD_SHA__, builtAt: __BUILD_TIME__ });
