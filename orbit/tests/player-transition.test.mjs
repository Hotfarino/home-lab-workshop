import test from 'node:test';
import assert from 'node:assert/strict';
import {createDeliveryPlayer} from '../packet-delivery.js';
import {deliveryMission} from '../delivery-model.js';
import {initialRun} from '../rescue-model.js';

test('Switching from Repair to Delivery does not update the old shared diagram as a Delivery screen', t=>{
 const previous=globalThis.cancelAnimationFrame;
 globalThis.cancelAnimationFrame=()=>{};
 t.after(()=>{if(previous===undefined)delete globalThis.cancelAnimationFrame;else globalThis.cancelAnimationFrame=previous;});
 // The selected run changes before render replaces the previous Repair DOM.
 // Both diagrams have this token, but only Delivery has its route controls.
 const repairDOM={querySelector:s=>s==='#deliveryToken'||s==='.repair-game'?{}:null};
 const player=createDeliveryPlayer({root:repairDOM,getRun:()=>initialRun('delivery',0),getMission:()=>deliveryMission(0)});
 assert.doesNotThrow(()=>player.stop(true));
});
