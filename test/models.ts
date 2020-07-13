import { LikeObjectId, ISchema } from '../src';
import { Model } from '../src/model';

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

export interface IUser extends IBase {
  firstName: string;
  lastName: string;
  posts: (string | number | IPost | Model<any>)[];
}

export const UserSchema: ISchema<IUser> = {
  joins: {
    posts: { collection: 'post' }
  }
};

export const PostSchema: ISchema<IPost> = {
  joins: {
    user: { collection: 'user' }
  }
};
