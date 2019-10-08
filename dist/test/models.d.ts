import { LikeObjectId, ISchema } from '../src';
import yup, { InferType } from 'yup';
import { Model } from '../src/model';
export interface IBase {
    _id?: LikeObjectId;
    created?: number;
    modified?: number;
}
export interface IPost extends IBase {
    title: string;
    body: string;
    user: LikeObjectId;
}
declare const userSchema: yup.ObjectSchema<yup.Shape<{
    _id: string | number | import("bson").ObjectId;
    created: number;
    modified: number;
}, {
    firstName: string;
    lastName: string;
    posts: (string | number | Model<any> | IPost)[];
}>>;
declare const postSchema: yup.ObjectSchema<yup.Shape<{
    _id: string | number | import("bson").ObjectId;
    created: number;
    modified: number;
}, {
    title: string;
    body: string;
    user: string | number | import("bson").ObjectId;
}>>;
export declare type IUserSchema = InferType<typeof userSchema>;
export declare type IPostSchema = InferType<typeof postSchema>;
export declare const UserSchema: ISchema<IUserSchema>;
export declare const PostSchema: ISchema<IPostSchema>;
export {};
