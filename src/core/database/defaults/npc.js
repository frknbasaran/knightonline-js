const csvLoader = require('../utils/csv_loader');
const csvReader = require('../utils/csv_reader');

module.exports = async db => {
  let Npc = db.models.Npc;
  if (await Npc.findOne({}).exec()) {
    return false;
  }

  let npcs = await csvReader({
    file: 'npc',
    expected: 1326,
    transfer: {
      sSid: "id",
      strName: "name",
      sPid: "pid",
      sSize: "size",
      iWeapon1: "weapon1",
      iWeapon2: "weapon2",
      byGroup: "group",
      byActType: "actType",
      byType: "type",
      byFamily: "family",
      byRank: "rank",
      byTitle: "title",
      iSellingGroup: "sellingGroup",
      sLevel: "level",
      iExp: "exp",
      iLoyalty: "loyalty",
      iHpPoint: "hp",
      sMpPoint: "mp",
      sAtk: "attack",
      sAc: "ac",
      sHitRate: "hitRate",
      sEvadeRate: "evadeRate",
      sDamage: "damage",
      sAttackDelay: "attackDelay",
      bySpeed1: "speed1",
      bySpeed2: "speed2",
      sStandtime: "standtime",
      iMagic1: "magic1",
      iMagic2: "magic2",
      iMagic3: "magic3",
      sFireR: "fireR",
      sColdR: "coldR",
      sLightningR: "lightningR",
      sMagicR: "magicR",
      sDiseaseR: "diseaseR",
      sPoisonR: "poisonR",
      sBulk: "bulk",
      byAttackRange: "attackRange",
      bySearchRange: "searchRange",
      byTracingRange: "tracingRange",
      iMoney: "money",
      sItem: "item",
      byDirectAttack: "directAttack",
      byMagicAttack: "magicAttack",
      sSpeed: "speed"
    },
    db
  });

  let monsters = await csvReader({
    file: 'monster',
    expected: 1398,
    transfer: {
      sSid: "id",
      strName: "name",
      sPid: "pid",
      sSize: "size",
      iWeapon1: "weapon1",
      iWeapon2: "weapon2",
      byGroup: "group",
      byActType: "actType",
      byType: "type",
      byFamily: "family",
      byRank: "rank",
      byTitle: "title",
      iSellingGroup: "sellingGroup",
      sLevel: "level",
      iExp: "exp",
      iLoyalty: "loyalty",
      iHpPoint: "hp",
      sMpPoint: "mp",
      sAtk: "attack",
      sAc: "ac",
      sHitRate: "hitRate",
      sEvadeRate: "evadeRate",
      sDamage: "damage",
      sAttackDelay: "attackDelay",
      bySpeed1: "speed1",
      bySpeed2: "speed2",
      sStandtime: "standtime",
      iMagic1: "magic1",
      iMagic2: "magic2",
      iMagic3: "magic3",
      sFireR: "fireR",
      sColdR: "coldR",
      sLightningR: "lightningR",
      sMagicR: "magicR",
      sDiseaseR: "diseaseR",
      sPoisonR: "poisonR",
      sBulk: "bulk",
      byAttackRange: "attackRange",
      bySearchRange: "searchRange",
      byTracingRange: "tracingRange",
      iMoney: "money",
      sItem: "item",
      byDirectAttack: "directAttack",
      byMagicAttack: "magicAttack",
      byMoneyType: "moneyType",
      sSpeed: "speed"
    },
    db
  });

  let pos = await csvReader({
    file: 'npc_monster_pos',
    expected: 9392,
    transfer: {
      ZoneID: 'zone',
      NpcID: 'npc',
      ActType: 'actType',
      RegenType: 'regenType',
      DungeonFamily: 'dungeonFamily',
      SpecialType: 'specialType',
      TrapNumber: 'trap',
      LeftX: 'leftX',
      TopZ: 'topZ',
      RightX: 'rightX',
      BottomZ: 'bottomZ',
      LimitMinX: 'minx',
      LimitMinZ: 'minz',
      LimitMaxX: 'maxx',
      LimitMaxZ: 'maxz',
      NumNPC: 'amount',
      RegTime: 'respawnTime',
      byDirection: 'direction',
      DotCnt: 'dot',
      path: 'path'
    },
    db
  });

  let drops = await csvReader({
    file: 'monster_drop',
    expected: 1000,
    transfer: {
      sIndex: 'id',
      iItem01: 'item1',
      sPersent01: 'percent1',
      iItem02: 'item2',
      sPersent02: 'percent2',
      iItem03: 'item3',
      sPersent03: 'percent3',
      iItem04: 'item4',
      sPersent04: 'percent4',
      iItem05: 'item5',
      sPersent05: 'percent5',
    },
    db
  });

  let dropsGrouped = groupDrop(drops);
  let positionGrouped = groupPosition(pos);

  for (let npc of npcs) {
    if (positionGrouped[npc.id]) {
      npc.spawn = positionGrouped[npc.id];
    } else {
      npc.spawn = [];
    }

    if (dropsGrouped[npc.item]) {
      npc.drops = dropsGrouped[npc.item];
    } else {
      npc.drops = [];
    }
  }


  for (let monster of monsters) {
    if (positionGrouped[monster.id]) {
      monster.spawn = positionGrouped[monster.id];
    } else {
      monster.spawn = [];
    }

    if (dropsGrouped[monster.item]) {
      monster.drops = dropsGrouped[monster.item];
    } else {
      monster.drops = [];
    }
  }

  try {
    let total = npcs.length;
    let sent = 0;
    while (npcs.length) {
      let arr = npcs.splice(0, 100);
      for (let npc of arr) {
        npc.isMonster = false;
      }
      sent += arr.length;
      await Npc.insertMany(arr);
      console.log('npc patch sent %d status: %f %', sent, parseInt(sent / total * 1000) / 10);
    }
  } catch (e) {
    console.error('error ocurred on inserting npc!');
    throw e;
  }

  try {
    let total = monsters.length;
    let sent = 0;
    while (monsters.length) {
      let arr = monsters.splice(0, 100);
      for (let npc of arr) {
        npc.isMonster = true;
      }
      sent += arr.length;
      await Npc.insertMany(arr);
      console.log('monster patch sent %d status: %f %', sent, parseInt(sent / total * 1000) / 10);
    }
  } catch (e) {
    console.error('error ocurred on inserting monsters!');
    throw e;
  }

}

function groupPosition(array) {
  let data = {};

  for (let item of array) {
    let npc = item.npc;
    let dot = +item.dot;
    let path = item.path;

    delete item.npc;
    delete item.dot;
    delete item.path;

    if (dot && path) {
      let points = [];

      for (let i = 0; i < dot; i++) {
        let x = +path.substring(i * 8, i * 8 + 4);
        let z = +path.substring(i * 8 + 4, i * 8 + 8);
        if (isNaN(x) || isNaN(z)) continue;
        points.push({ x, z })
      }

      item.points = points;
    }

    item.actType = +item.actType || 0;
    item.amount = +item.amount || 0;
    item.bottomZ = +item.bottomZ || 0;
    item.leftX = +item.leftX || 0;
    item.maxx = +item.maxx || 0;
    item.maxz = +item.maxz || 0;
    item.minx = +item.minx || 0;
    item.minz = +item.minz || 0;
    item.respawnTime = +item.respawnTime || 0;
    item.rightX = +item.rightX || 0;
    item.specialType = +item.specialType || 0;
    item.topZ = +item.topZ || 0;
    item.trap = +item.trap || 0;
    item.zone = +item.zone || 0;
    item.direction = +item.direction || 0;

    if (data[npc]) {
      data[npc].push(item)
    } else {
      data[npc] = [item];
    }
  }

  return data;
}


function groupDrop(array) {
  let data = {};

  for (let item of array) {
    let id = item.id;

    let drops = data[id];
    if (!drops) drops = data[id] = [];

    if (item.item1 && item.percent1) drops.push({ item: +item.item1, rate: (+item.percent1) / 10000 });
    if (item.item2 && item.percent2) drops.push({ item: +item.item2, rate: (+item.percent2) / 10000 });
    if (item.item3 && item.percent3) drops.push({ item: +item.item3, rate: (+item.percent3) / 10000 });
    if (item.item4 && item.percent4) drops.push({ item: +item.item4, rate: (+item.percent4) / 10000 });
    if (item.item5 && item.percent5) drops.push({ item: +item.item5, rate: (+item.percent5) / 10000 });
  }

  return data;
}