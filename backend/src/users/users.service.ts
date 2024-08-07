import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import { CreateUserDtoRequest } from './dto/create-user.dto';
import { UpdateExcludedDto } from './dto/update-excluded.dto';
import { UpdateUnavailableDto } from './dto/update-unavailable.dto';
import {
  ChangeUserPassDtoRequest,
  ChangeUserPassDtoResponse,
} from './dto/change-user-pass.dto';
import {
  ForgotUserPassDtoRequest,
  ForgotUserPassDtoResponse,
} from './dto/forgot-user-pass.dto';
import {
  UpdateUserRoleDtoRequest,
  UpdateUserRoleDtoResponse,
} from './dto/update-user-role.dto';
import { User, UserDocument } from '../schemas/user.schema';
import { SessionId, SessionIdDocument } from '../schemas/sessionID.schema';
import {
  DeleteAllUsersDtoResponse,
  DeleteUserDtoResponse,
} from './dto/delete-user.dto';
import { IUser } from './user.interface';
import { Token, TokenDocument } from '../schemas/refreshToken.schema';
import { FindAllUsersDtoResponse } from './dto/findAll-user.dto';

export class UsersService implements IUser {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(SessionId.name)
    private sessionIdModel: Model<SessionIdDocument>,
    @InjectModel(Token.name) private tokenModel: Model<TokenDocument>,
  ) {}

  async createUser(createUserDto: CreateUserDtoRequest): Promise<User> {
    const existingUser = await this.userModel
      .findOne({
        $or: [
          { email: createUserDto.email },
          { nickname: createUserDto.nickname },
        ],
      })
      .lean()
      .exec();

    if (existingUser) {
      throw new BadRequestException(
        'A user with such an email or nickname already exists!',
      );
    }

    const compareSessionId = await this.sessionIdModel.findOne({
      _id: { $eq: createUserDto.sessionId },
    });
    if (compareSessionId === null) {
      throw new BadRequestException('Wrong SessionId!');
    }
    await this.sessionIdModel.deleteMany({});
    try {
      const hashedPassword: string = await bcrypt.hash(
        createUserDto.password,
        10,
      );
      const newUser = await this.userModel.create({
        ...createUserDto,
        password: hashedPassword,
      });

      return newUser.toObject();
    } catch (err) {
      throw new BadRequestException('Something went wrong!');
    }
  }

  async findUser(nicknameOrEmail: string): Promise<User> {
    const user = await this.userModel
      .findOne({
        $or: [{ email: nicknameOrEmail }, { nickname: nicknameOrEmail }],
      })
      .lean()
      .exec();

    if (!user) {
      throw new BadRequestException('User does not exist!');
    }
    return user;
  }

  async findAll(): Promise<FindAllUsersDtoResponse[]> {
    try {
      return this.userModel
        .find()
        .select({ email: 1, _id: 1, nickname: 1, role: 1 })
        .lean()
        .exec();
    } catch (err) {
      throw new BadRequestException('Something went wrong');
    }
  }

  async changePassword(
    email: string,
    updateUserPassDto: ChangeUserPassDtoRequest,
  ): Promise<ChangeUserPassDtoResponse> {
    const user: User = await this.findUser(email);

    const isPasswordMatch: boolean = await bcrypt.compare(
      updateUserPassDto.oldPassword,
      user.password,
    );
    if (!isPasswordMatch) {
      throw new UnauthorizedException('Password did not match!!!');
    }

    const hashedNewPassword: string = await bcrypt.hash(
      updateUserPassDto.newPassword,
      10,
    );
    await this.userModel.updateOne(
      { email: user.email },
      { password: hashedNewPassword },
    );

    return { message: 'Password successfully changed', status: 200 };
  }

  async forgotPassword(
    forgotUserPassDto: ForgotUserPassDtoRequest,
  ): Promise<ForgotUserPassDtoResponse> {
    if (forgotUserPassDto.email && forgotUserPassDto.nickname) {
      throw new BadRequestException(
        'Email and Nickname fields should not be together',
      );
    } else if (!forgotUserPassDto.email && !forgotUserPassDto.nickname) {
      throw new BadRequestException(
        'The "Email" or "Nickname" fields must be specified',
      );
    }

    const query = forgotUserPassDto.email
      ? { email: forgotUserPassDto.email }
      : { nickname: forgotUserPassDto.nickname };

    const compareSessionId: SessionId = await this.sessionIdModel.findOne({
      _id: { $eq: forgotUserPassDto.sessionId },
    });

    if (compareSessionId === null) {
      throw new BadRequestException('Wrong SessionId!');
    }

    await this.sessionIdModel.deleteMany({});
    const hashedNewPassword: string = await bcrypt.hash(
      forgotUserPassDto.newPassword,
      10,
    );

    const updatedUser = await this.userModel
      .findOneAndUpdate(query, { password: hashedNewPassword }, { new: true })
      .lean()
      .exec();

    if (!updatedUser) {
      throw new BadRequestException('User not found!');
    }

    return { message: 'Password successfully changed', status: 200 };
  }

  async updateUnavailable(
    updateUnavailableDto: UpdateUnavailableDto,
  ): Promise<User> {
    if (updateUnavailableDto.email && updateUnavailableDto.nickname) {
      throw new BadRequestException(
        'Email and Nickname fields should not be together',
      );
    } else if (!updateUnavailableDto.email && !updateUnavailableDto.nickname) {
      throw new BadRequestException(
        'The "Email" or "Nickname" fields must be specified',
      );
    }

    try {
      const query = updateUnavailableDto.email
        ? { email: updateUnavailableDto.email }
        : { nickname: updateUnavailableDto.nickname };

      return await this.userModel
        .findOneAndUpdate(
          query,
          {
            unavailableMobs: updateUnavailableDto.unavailableMobs,
          },
          { new: true },
        )
        .lean()
        .exec();
    } catch (err) {
      throw new BadRequestException('Something went wrong!');
    }
  }

  async updateExcluded(
    email: string,
    updateExcludedDto: UpdateExcludedDto,
  ): Promise<User> {
    const user: User = await this.findUser(email);
    await this.userModel
      .updateOne(
        { email: user.email },
        {
          excludedMobs: updateExcludedDto.excludedMobs,
        },
        { new: true },
      )
      .lean()
      .exec();
    return user;
  }

  async updateRole(
    updateUserRoleDto: UpdateUserRoleDtoRequest,
  ): Promise<UpdateUserRoleDtoResponse> {
    if (updateUserRoleDto.email && updateUserRoleDto.nickname) {
      throw new BadRequestException(
        'Email and Nickname fields should not be together',
      );
    } else if (!updateUserRoleDto.email && !updateUserRoleDto.nickname) {
      throw new BadRequestException(
        'The "Email" or "Nickname" fields must be specified',
      );
    }
    const query = updateUserRoleDto.email
      ? { email: updateUserRoleDto.email }
      : { nickname: updateUserRoleDto.nickname };

    try {
      await this.userModel
        .findOneAndUpdate(
          query,
          { role: updateUserRoleDto.role },
          { new: true },
        )
        .lean()
        .exec();
    } catch (err) {
      throw new BadRequestException('Something went wrong!');
    }
    return { message: 'Role has been updated successfully', status: 200 };
  }

  async deleteOne(identifier: string): Promise<DeleteUserDtoResponse> {
    if (!identifier) {
      throw new BadRequestException(
        'The "identifier" header must be specified',
      );
    }

    const deleteQuery = {
      $or: [{ email: identifier }, { nickname: identifier }],
    };

    try {
      await this.userModel.deleteOne(deleteQuery);
      await this.tokenModel.findOneAndDelete(deleteQuery);
    } catch (err) {
      throw new BadRequestException('Something went wrong');
    }
    return { message: 'User deleted', status: 200 };
  }

  async deleteAll(): Promise<DeleteAllUsersDtoResponse> {
    try {
      await this.userModel.deleteMany();
    } catch (err) {
      throw new BadRequestException('Something went wrong ');
    }
    return { message: 'All users deleted', status: 200 };
  }

  async generateSessionId(): Promise<SessionId> {
    try {
      await this.sessionIdModel.deleteMany({});
      const sessionId = await this.sessionIdModel.create({ _id: randomUUID() });
      return sessionId.toObject();
    } catch (err) {
      throw new BadRequestException('Something went wrong');
    }
  }
}
