import childProcess from "child_process";
import Promise from "seventh";
// @ts-nocheck
// Patch the child process module to support asyncness
Promise.promisifyNodeApi(childProcess);
