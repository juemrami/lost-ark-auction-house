import OcrTaskScheduler from "./OcrTaskScheduler.js";

(async () => {
  let sch = await OcrTaskScheduler.initialize([
    { num_of_workers: 2, lang: "digits_comma" },
    { num_of_workers: 1, lang: "eng" },
  ]);
})();
