// @ts-nocheck

import Promise from "seventh";

// @ts-nocheck
// Patch the child process module to support asyncness
Promise.promisifyNodeApi(require("child_process"));
