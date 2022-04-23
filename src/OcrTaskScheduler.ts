import { createWorker, createScheduler, Worker, Scheduler } from "tesseract.js";

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
  threads: number;
  lang: string;
}
export default class OcrTaskScheduler {
  static NAME_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz() ";
  static NUM_CHARS = "0123456789.";
  #alpha_scheduler: Scheduler;
  #numeric_scheduler: Scheduler;

  private constructor(ocr_workers: OcrWorker[]) {
    // let _workers = [];
    this.#alpha_scheduler = createScheduler();
    this.#numeric_scheduler = createScheduler();
    for (const { worker_id, worker, lang } of ocr_workers) {
      lang == "eng"
        ? this.#alpha_scheduler.addWorker(worker)
        : this.#numeric_scheduler.addWorker(worker);

      // _workers.push(worker);
    }
    // console.log(
    //   this.#alpha_scheduler.getNumWorkers(),
    //   this.#numeric_scheduler.getNumWorkers()
    // );

    // this.#tesseract_workers = _workers;
  }
  static async initialize(options: initOptions[]) {
    let workers: OcrWorker[] = [];
    for (const { threads: num_of_workers, lang } of options) {
      for (let i = 0; i < num_of_workers; i++) {
        const _worker: Worker = createWorker({
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
          // tjs doesn't include the id in the Worker
          // interface for some reason, hence the ignore.

          // @ts-ignore
          worker_id: _worker.id,

          worker: _worker,
          lang: lang,
        };
        workers.push(ocr_worker);
      }
    }
    return new OcrTaskScheduler(workers);
  }
  async parseImage(image_buffer, lang, dim?: any): Promise<string | any> {
    let scheduler =
      lang == "eng" ? this.#alpha_scheduler : this.#numeric_scheduler;
    let {
      data: { text },
    } = await scheduler.addJob("recognize", image_buffer, {
      rectangle: {
        left: dim.x,
        top: dim.y,
        width: dim.width,
        height: dim.height,
      },
    });

    if (lang === "eng") {
      return text.trim();
    }
    if (/unit/.test(text)) {
      // check if is bundle size text
      return text;
    } else if (/\.\d{3,}/.test(text)) {
      // check if misinterpreted comma
      text = text.replace(/\./, "");
      return isNaN(Number(text)) ? "" : text.trim();
    } else {
      // strip space between numbers
      text = text.replace(/\s/g, "");
      return isNaN(Number(text)) ? "" : text;
    }
  }
  async kill_workers() {
    let end = [
      this.#alpha_scheduler.terminate(),
      this.#numeric_scheduler.terminate(),
    ];
    await Promise.all(end);
  }
}
