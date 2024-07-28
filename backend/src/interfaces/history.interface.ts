import { MobName, Servers } from '../schemas/mobs.enum';
import { RolesTypes } from '../schemas/user.schema';

export enum HistoryTypes {
  updateMobByCooldown = 'updateMobByCooldown',
  updateMobDateOfDeath = 'updateMobDateOfDeath',
  updateMobDateOfRespawn = 'updateMobDateOfRespawn',
  crashMobServer = 'crashMobServer',
}

export interface History {
  mobName: MobName;
  nickname: string;
  server: Servers;
  date: number;
  role: RolesTypes;
  historyTypes: HistoryTypes;
  toWillResurrect?: number;
  fromCooldown?: number;
  toCooldown?: number;
  crashServer?: boolean;
}
