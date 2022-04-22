import { createWorker, createScheduler, Worker } from "tesseract.js";

// create workers 1 name, 1/2 numbers
// load and intialize them (maybe not initialze )
// get worker id so that we know which is which.
// add workers to scheduler
// when queuing a job, include lang, and dimenions, and worker-id
//
interface OcrWorker {
  worker: Worker;
  worker_id: string;
  lang: string;
}
interface initOptions {
  num_of_workers: number;
  lang: string;
}
export default class OcrTaskScheduler {
  static NAME_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz() ";
  static NUM_CHARS = "0123456789.";
  #tesseract_workers;
  #task_scheduler;

  private constructor(workers) {
    this.#tesseract_workers = workers;
    this.#task_scheduler = createScheduler();
  }
  // pass and array, and langs, zip
  /*
    {num_of_workers: number, lang: string}[]
  */
  static async initialize(options: initOptions[]) {
    let workers: OcrWorker[] = [];
    for (const { num_of_workers, lang } of options) {
      for (let i = 0; i < num_of_workers; i++) {
        const _worker = createWorker({
          cachePath: process.cwd() + "\\models\\",
          gzip: false,
        });
        await _worker.load();
        await _worker.loadLanguage(lang);
        await _worker.initialize(lang);
        if (lang === "eng") {
          await _worker.setParameters({
            tessedit_char_whitelist: OcrTaskScheduler.NAME_CHARS,
          });
        } else {
          await _worker.setParameters({
            tessedit_char_whitelist: OcrTaskScheduler.NUM_CHARS,
          });
        }
        let ocr_worker: OcrWorker = {
          worker_id: _worker.id,
          worker: _worker,
          lang: lang,
        };
        workers.push(ocr_worker);

        debugger;
      }
    }
    return new OcrTaskScheduler(workers);
  }
  async is_worker_busy(worker: Worker) {
    // await worker.initialize(lang);
    // if (lang === "eng") {
    //   await worker.setParameters({
    //     tessedit_char_whitelist: NAME_CHARS,
    //   });
    // } else {
    //   await worker.setParameters({
    //     tessedit_char_whitelist: NUM_CHARS,
    //   });
    // }
  }
  // async parseImage(image_buffer, worker, lang, dim?: any) {
  //   console.log("job started by ", worker.id);
  //   await worker.initialize(lang);
  //   if (lang === "eng") {
  //     await worker.setParameters({
  //       tessedit_char_whitelist: OcrTaskScheduler.NAME_CHARS,
  //     });
  //   } else {
  //     await worker.setParameters({
  //       tessedit_char_whitelist: OcrTaskScheduler.NUM_CHARS,
  //     });
  //   }
  //   let {
  //     data: { text },
  //   } = await worker.recognize(image_buffer, {
  //     rectangle: {
  //       left: dim.x,
  //       top: dim.y,
  //       width: dim.width,
  //       height: dim.height,
  //     },
  //   });
  //   // console.log(`\tJob done ${worker.id}`);
  //   // console.log(`-- ocr results: ${text.trim()}`);
  //   if (lang === "eng") {
  //     return text.trim();
  //   }
  //   if (/unit/.test(text)) {
  //     // check if is bundle size text
  //     return text;
  //   } else if (/\.\d{3,}/.test(text)) {
  //     // check if misinterpreted comma
  //     text = text.replace(/\./, "");
  //     return isNaN(Number(text)) ? "" : text.trim();
  //   } else {
  //     // strip space between numbers
  //     text = text.replace(/\s/g, "");
  //     return isNaN(Number(text)) ? "" : text;
  //   }
  // }
  async kill_workers() {
    for (const worker of this.#tesseract_workers) {
      await worker.terminate();
    }
  }
}
