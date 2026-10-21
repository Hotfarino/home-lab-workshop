import {parentPort} from 'node:worker_threads';
globalThis.self=globalThis;globalThis.postMessage=data=>parentPort.postMessage(data);
await import('../python-worker.js');parentPort.on('message',data=>self.onmessage({data}));
