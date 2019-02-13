const unit = require('../../core/utils/unit');
const region = require('../region');
const sendExperienceChange = require('./sendExperienceChange');
const { sendMessageToPlayer } = require('./sendChatMessage');
const itemDropGroups = require('../var/item_drop_groups');
const { wrapDrop } = require('./dropHandler');

const ARROW_MIN = 391010000;
const ARROW_MAX = 392010000;

module.exports = (npc) => {
  if (npc.status == 'dead') return;

  npc.status = 'dead';
  region.removeNpc(npc);
  region.regionSendByNpc(npc, [
    0x11, // dead
    ...unit.short(npc.uuid)
  ]);

  let exp = npc.npc.exp;
  let hp = npc.npc.hp;
  let greatestDamage = null;
  let greatestSession = null;
  for (let session in npc.damagedBy) {
    let userSocket = region.sessions[session];

    if (userSocket) { // still online
      let damage = npc.damagedBy[session];
      if (greatestDamage == null || greatestDamage < damage) {
        greatestDamage = damage;
        greatestSession = userSocket;
      }

      sendExperienceChange(userSocket, (exp * damage / hp) | 0);
    }
  }

  delete npc.damagedBy;

  if (greatestSession) { // you earned the drop :)
    let dropped = [];

    if (npc.npc.money) {
      let money = npc.npc.money * (Math.random() * 0.3 + 0.7);

      if (money > 0) {
        dropped.push({
          item: 900000000,
          amount: money | 0
        });
      }
    }

    if (npc.npc.drops && npc.npc.drops.length > 0) {
      for (let drop of npc.npc.drops) {
        let idx = drop.item;
        let luck = Math.random();
        if (luck > drop.rate) { // unlucky
          continue;
        }

        if (idx > 100000000) { // regular item so we can give it directly
          let amount = 1;

          if (idx >= ARROW_MIN && idx <= ARROW_MAX) {
            amount = 20 + ((Math.random() * 30) | 0);
          }

          dropped.push({
            item: idx,
            amount: amount
          })
        } else if (idx < 100) { // this range is for 

        } else { // item has to be in a group, if it isnt than we dont care
          let pickItemInGroup = itemDropGroups[idx];
          if (pickItemInGroup) {
            let picked = pickItemInGroup[Math.random() * pickItemInGroup.length >>> 0];

            dropped.push({
              item: picked,
              amount: 1
            });
          }
        }
      }
    }

    if (dropped.length) {
      sendMessageToPlayer(greatestSession, 1, 'DROP', 'should be visible', undefined, -1);
      greatestSession.send([
        0x23, // ITEM_DROP
        ...unit.short(npc.uuid),
        ...unit.int(wrapDrop(greatestSession.session, dropped)), // bundle id
        2
      ]);
    }
  }
}