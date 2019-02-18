import { CSVLoader} from '../utils/csv_loader';
import { Item } from '../models';

export async function ItemDefaults() {
  await CSVLoader('items', ItemTransferObject, 477645, Item);
}

const ItemTransferObject = {
  'Num': 'id',
  'strName': 'name',
  'Kind': 'kind',
  'Slot': 'slot',
  'Race': 'race',
  'Class': 'klass',
  'Damage': 'damage',
  'Delay': 'delay',
  'Range': 'range',
  "Weight": "weight",
  "Duration": "durability",
  "BuyPrice": "buyPrice",
  "SellPrice": "sellPrice",
  "Ac": "defenceAbility",
  "Countable": "countable",
  "isUnique": "isUnique",
  "Effect1": "effect1",
  "Effect2": "effect2",
  "ReqLevel": "reqLevel",
  "ReqLevelMax": "reqLevelMax",
  "ReqRank": "reqRank",
  "ReqTitle": "reqTitle",
  "ReqStr": "reqStr",
  "ReqSta": "reqHp",
  "ReqDex": "reqDex",
  "ReqIntel": "reqInt",
  "ReqCha": "reqMp",
  "SellingGroup": "sellingGroup",
  "ItemType": "itemType",
  "Hitrate": "hitRate",
  "Evasionrate": "evaRate",
  "DaggerAc": "daggerDefenceAbility",
  "SwordAc": "swordDefenceAbility",
  "MaceAc": "maceDefenceAbility",
  "AxeAc": "axeDefenceAbility",
  "SpearAc": "spearDefenceAbility",
  "BowAc": "bowDefenceAbility",
  "JamadarAC": "jamadarDefenceAbility",
  "FireDamage": "fireDamage",
  "IceDamage": "iceDamage",
  "LightningDamage": "lightningDamage",
  "PoisonDamage": "poisonDamage",
  "HPDrain": "hpDrain",
  "MPDamage": "mpDamage",
  "MPDrain": "mpDrain",
  "MirrorDamage": "mirrorDamage",
  "Droprate": "dropRate",
  "StrB": "strB",
  "StaB": "hpB",
  "DexB": "dexB",
  "IntelB": "intB",
  "ChaB": "mpB",
  "MaxHpB": "maxhpB",
  "MaxMpB": "maxmpB",
  "FireR": "fireR",
  "ColdR": "coldR",
  "LightningR": "lightningR",
  "MagicR": "magicR",
  "PoisonR": "poisonR",
  "CurseR": "curseR",
  "ItemClass": "itemClass",
  "ItemExt": "itemExt",
  "IconID": "iconID",
  "Extension": "extension",
  "UpgradeNotice": "upgradeNotice",
  "NPbuyPrice": "npBuyPrice",
  "Bound": "bound"
}