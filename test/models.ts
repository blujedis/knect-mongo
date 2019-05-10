import { IBaseProps, LikeObjectID, ISchema } from '../src';
import { object } from 'yup';

// USER //

export abstract class Base<T extends object> {

  private _id?: LikeObjectID;

  schema: ISchema<T>;
  created?: number;
  modified?: number;

  get id() {
    return this._id;
  }

  set id(id: LikeObjectID) {
    this._id = id;
  }

}

export class User2 extends Base<User2> {
  firstName: string;
  lastName: string;
  posts?: (LikeObjectID | IPost)[];
}

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
