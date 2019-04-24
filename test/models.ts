import { IBaseProps, LikeObjectID } from '../src';
import { object } from 'yup';

// USER //

export interface IUser extends Partial<IBaseProps> {
  firstName: string;
  lastName: string;
  posts?: (LikeObjectID | IPost)[];
}

export interface IUserPopulated extends IUser {
  posts?: IPost[];
}

export const UserSchema = {
  props: object(),
  joins: {
    posts: { collection: 'post' }
  }
};

// POSTS //

export interface IPost extends Partial<IBaseProps> {
  title: string;
  body: string;
  user: LikeObjectID;
}

export const PostSchema = {
  props: object(),
  joins: {
    user: { collection: 'user' }
  }
};
