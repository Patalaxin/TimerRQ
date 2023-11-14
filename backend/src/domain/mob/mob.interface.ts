import { CreateMobDtoRequest } from '../../mob/dto/create-mob.dto';
import {
  GetFullMobDtoResponse,
  GetMobDataDtoResponse,
  GetMobDtoRequest,
  GetMobDtoResponse,
} from '../../mob/dto/get-mob.dto';
import { GetMobsDtoRequest } from '../../mob/dto/get-all-mobs.dto';
import {
  UpdateMobDtoBodyRequest,
  UpdateMobDtoParamsRequest,
} from '../../mob/dto/update-mob.dto';
import { UpdateMobByCooldownDtoRequest } from '../../mob/dto/update-mob-by-cooldown.dto';
import { Request } from 'express';
import { UpdateMobDateOfDeathDtoRequest } from '../../mob/dto/update-mob-date-of-death.dto';
import { UpdateMobDateOfRespawnDtoRequest } from '../../mob/dto/update-mob-date-of-respawn.dto';
import { UpdateMobCooldownDtoRequest } from '../../mob/dto/update-mob-cooldown.dto';
import { DeleteMobDtoResponse } from '../../mob/dto/delete-mob.dto';
import { Locations, MobName, Servers } from '../../schemas/mobs.enum';

export interface IMob {
  createMob(createMobDto: CreateMobDtoRequest): Promise<GetFullMobDtoResponse>;

  findMob(getMobDto: GetMobDtoRequest): Promise<GetFullMobDtoResponse>;

  findAllMobsByUser(
    email: string,
    getMobsDto: GetMobsDtoRequest,
  ): Promise<GetFullMobDtoResponse[]>;

  updateMob(
    updateMobDtoBody: UpdateMobDtoBodyRequest,
    updateMobDtoParams: UpdateMobDtoParamsRequest,
  ): Promise<GetMobDtoResponse>;

  updateMobByCooldown(
    request: Request,
    updateMobByCooldownDto: UpdateMobByCooldownDtoRequest,
  ): Promise<GetMobDataDtoResponse>;

  updateMobDateOfDeath(
    request: Request,
    updateMobDateOfDeathDto: UpdateMobDateOfDeathDtoRequest,
  ): Promise<GetMobDataDtoResponse>;

  updateMobDateOfRespawn(
    request: Request,
    updateMobDateOfRespawnDto: UpdateMobDateOfRespawnDtoRequest,
  ): Promise<GetMobDataDtoResponse>;

  updateMobCooldownCounter(
    updateMobCooldownDto: UpdateMobCooldownDtoRequest,
  ): Promise<GetMobDataDtoResponse>;

  deleteMob(
    mobName: MobName,
    server: Servers,
    location: Locations,
  ): Promise<DeleteMobDtoResponse>;

  crashMobServer(
    email: string,
    request: Request,
    server: Servers,
  ): Promise<GetFullMobDtoResponse[]>;

  respawnLost(
    server: Servers,
    mobName: MobName,
    location: Locations,
  ): Promise<GetMobDataDtoResponse>;
}