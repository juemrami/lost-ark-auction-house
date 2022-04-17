import { test } from "./scan_interest_list.js";
import { main } from "./utils.js";
import prompt from "prompt";

console.log("Starting");
console.log("Menu:");
console.log("1: Main");
console.log("2: Test");
prompt.start();
prompt.get(["choice"], async function (err, { choice }) {
  if (err) {
    console.log(err);
  }
  console.log("Command-line input received:");
  if (choice == 1) {
    await main();
  } else {
    await test();
  }
});
// await main();

// await test();
