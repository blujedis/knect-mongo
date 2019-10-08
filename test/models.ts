import { LikeObjectId, ISchema } from '../src';
import yup, { object, string, array, number, mixed, InferType } from 'yup';
import { Model } from '../src/model';

// export interface IUser extends IBase {
//   firstName: string;
//   lastName: string;
//   posts?: (LikeObjectId | IPost)[];
// }

// export interface IUserPopulated extends IUser {
//   posts?: IPost[];
// }

// INTERFACES //

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

// SCHEMAS //

const baseSchema = object({
  _id: mixed<LikeObjectId>(),
  created: number(),
  modified: number()
});

const userSchema = baseSchema.shape({
  firstName: string(),
  lastName: string(),
  posts: array<string | number | IPost | Model<any>>()
});

const postSchema = baseSchema.shape({
  title: string().required(),
  body: string(),
  user: mixed<LikeObjectId>().required()
});

export type IUserSchema = InferType<typeof userSchema>;
export type IPostSchema = InferType<typeof postSchema>;

export const UserSchema: ISchema<IUserSchema> = {
  props: userSchema,
  joins: {
    posts: { collection: 'post' }
  }
};

export const PostSchema: ISchema<IPostSchema> = {
  props: postSchema,
  joins: {
    user: { collection: 'user' }
  }
};
