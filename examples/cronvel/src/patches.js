const Promise = require("seventh");

// Patch the child process module to support asyncness
Promise.promisifyNodeApi(require("child_process"));
