import { test } from "./scan_interest_list.js";
import { main } from "./utils.js";
import prompt from "prompt";
prompt.start();

console.log("Starting");

console.log("Menu:");
console.log("1: Main");
console.log("2: Test");
console.log("3: Quit");

await prompt.get(["choice"], async function (err, { choice }) {
  if (err) {
    console.log(err);
  }
  console.log("Command-line input received:");
  if (choice == 1) {
    await main();
  } else if (choice == 3) {
    process.exit();
  } else {
    await test();
  }
});
// process.exit();
