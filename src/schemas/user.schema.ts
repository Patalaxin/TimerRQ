import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";
import {Exclude, Expose} from "class-transformer";
import {randomUUID} from "crypto";

export type UserDocument = HydratedDocument<User>

export const enum RolesTypes {
    Admin = "Admin",
    User = "User",
    Manager = "Manager"
}
@Schema()
export class User {

    @Expose()
    @Prop({ type: String, default: function genUUID() {
            return randomUUID()
        }})
    _id: string

    @Expose()
    @Prop({ unique: true, required: true })
    email: string;

    @Exclude({toPlainOnly: true})
    @Prop({ required: true })
    password: string;

    @Exclude({toPlainOnly: true})
    @Prop()
    __v: number

    @Exclude()
    @Prop({default: RolesTypes.User})
    role: RolesTypes

    constructor(partial: Partial<User>) {
        Object.assign(this, partial);
    }
}

export const UserSchema = SchemaFactory.createForClass(User)