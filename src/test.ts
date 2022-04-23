import OcrTaskScheduler from "./OcrTaskScheduler.js";

(async () => {
  let sch = await OcrTaskScheduler.initialize([
    { threads: 2, lang: "digits_comma" },
    { threads: 1, lang: "eng" },
  ]);
})();
