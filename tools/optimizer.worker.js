import optimizeSync from './optimizeSync';

/* eslint-disable-next-line no-restricted-globals */
const worker = self;

let Data = null;

//items pending to be optimized
const pending = [];

function process(data) {
  const result = optimizeSync(Data, data.task, data.options, data.prices);
  worker.postMessage({action: 'result', id: data.id, result});
}

worker.addEventListener('message', ({ data }) => {
  if (data.action === 'init') {
    Data = data.payload;
    for (const row of pending) {
      process(row);
    }
    pending.splice(0);
  } else if (data.action === 'optimize') {
    if (Data) {
      process(data);
    } else {
      pending.push(data);
    }
  }
});
