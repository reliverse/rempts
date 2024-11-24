// @ts-nocheck

/*
	Ideally, this should be done using a graph algorithm, but we will just brute-force it for instance...
*/
export default function autoComplete(
  array,
  startString,
  returnAlternatives,
  prefix,
  postfix,
) {
  var i,
    j,
    exitLoop,
    candidates = [],
    completed = startString,
    hasCompleted = false;

  if (!prefix) {
    prefix = "";
  }
  if (!postfix) {
    postfix = "";
  }

  for (i = 0; i < array.length; i++) {
    if (array[i].slice(0, startString.length) === startString) {
      candidates.push(array[i]);
    }
  }

  if (!candidates.length) {
    return prefix + completed + postfix;
  }

  if (candidates.length === 1) {
    return prefix + candidates[0] + postfix;
  }

  // Multiple candidates, complete only the part they have in common

  j = startString.length;

  exitLoop = false;

  for (j = startString.length; j < candidates[0].length; j++) {
    for (i = 1; i < candidates.length; i++) {
      if (candidates[i][j] !== candidates[0][j]) {
        exitLoop = true;
        break;
      }
    }

    if (exitLoop) {
      break;
    }

    completed += candidates[0][j];
    hasCompleted = true;
  }

  if (returnAlternatives && !hasCompleted) {
    candidates.prefix = prefix;
    candidates.postfix = postfix;
    return candidates;
  }

  return prefix + completed + postfix;
}
