import { scanInterestList } from "./interestListScanner.js";
import prompt from "prompt";
import { createInterface } from "readline";

const ask = async () => {
  const res = await prompt.get(["choice"]);
  return res.choice;
};
const io = createInterface({
  input: process.stdin,
  output: process.stdout,
});
const main = async () => {
  let p_flag = true;
  console.log("Starting");
  while (p_flag) {
    console.log("Menu:");
    console.log("Enter: Start Scan");
    console.log("Q: Quit");
    const res = await ask();
    if (res == "") {
      await scanInterestList();
    } else {
      process.exit();
    }
  }
};
main();
