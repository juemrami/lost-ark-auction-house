import { recipes, generatePriceConfig, PRICE_CONFIG, wait } from "./helpers.js";
import { writeFileSync } from "fs";

import AuctionExctractor from "./AuctionExctractor.js";
//Here insert interest list. instead of recipies
if (recipes) {
  const interest_list = [
    "Guardian Stone Crystal",
    "Destruction Stone Crystal",
    "Honor Leapstone",
    "Honor Shard Pouch (S)",
    "Great Honor Leapstone",
    "Solar Grace",
    "Solar Blessing",
    "Solar Protection",
    "Life Shard Pouch (S)",
  ];
  console.log("Starting auction house scrape..");
  console.log("you have 2 seconds to focus your Lost Ark game window.");
  await wait(2000);
  console.log("...commencing. dont touch mouse!");

  let auction = new AuctionExctractor();
  const data = await auction.start(interest_list);
  console.log("Got data", data);
  writeFileSync(PRICE_CONFIG, JSON.stringify(data));
} else {
  console.log("Recipe data not found! Run `yarn scrape` to scrape the data.");
}
