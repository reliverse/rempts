import { consola } from "./utils";

const c1 = consola.withTag("foo");
const c2 = consola.withTag("bar");

consola.log("before pause");

// @ts-expect-error TODO: fix ts
c2.pause();

c1.log("C1 is ready");
c2.log("C2 is ready");

setTimeout(() => {
  // @ts-expect-error TODO: fix ts
  consola.resume();
  consola.log("Yo!");
}, 1000);
