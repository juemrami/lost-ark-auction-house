import { test } from "./testing_grounds.js";
import { main } from "./utils.js";
import { scanInterestList } from "./interestListScanner.js";
import prompt from "prompt";
prompt.start();

console.log("Starting");

console.log("Menu:");
console.log("1: Manual Scan ");
console.log("Enter: Interest List (Stable)");
console.log("3: Test");
console.log("4: Quit");

await prompt.get(["choice"], async function (err, { choice }) {
  if (err) {
    console.log(err);
  }
  console.log("Command-line input received:");
  if (choice == 1) {
    await main();
  } else if (choice == 4) {
    process.exit();
  } else if (choice == 3) {
    await test();
  } else await scanInterestList();
});
// process.exit();
