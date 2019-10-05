import * as chai from 'chai';

const assert = chai.assert;

import KnectMongo, { LikeObjectId } from '../src';
import { IUser, UserSchema, IUserPopulated, IPost, PostSchema } from './models';

let dbname: string;
let models: any;

async function each(arr, done) {
  for (let i = 0; i < arr.length; i++) {
    await done(arr[i], i, arr);
  }
}

async function load() {

  dbname = 'temp';

  await KnectMongo.connect(`mongodb://10.10.20.5:32768/${dbname}`);

  // Reset schemas or you'll get dupe error.
  KnectMongo.schemas = {};

  const UserModel = KnectMongo.model<IUser>('user', UserSchema);

  class User extends UserModel implements IUser {
    firstName: string;
    lastName: string;
    posts = [];
  }

  const UserCopy = KnectMongo.model<IUser>('user.copy', {});

  const PostModel = KnectMongo.model<IPost>('post', PostSchema);

  class Post extends PostModel implements IPost {
    title: string;
    body: string;
    user: LikeObjectID;
  }

  let milton: User;
  let peter: User;
  let miltonCopy: any;

  if (!models) {
    models = {};
    milton = models.milton = new User({ firstName: 'Milton', lastName: 'Waddams' });
    peter = models.peter = new User({ firstName: 'Peter', lastName: 'Gibbons' });
    miltonCopy = models.miltonCopy = new UserCopy({ firstName: 'MiltonCopy', lastName: 'Waddams' });
  }
  else {
    milton = models.milton;
    peter = models.peter;
    miltonCopy = models.miltonCopy;
  }

  return {
    UserModel,
    User,
    UserCopy,
    Post,
    milton,
    peter,
    miltonCopy
  };

}

async function drop(close?: boolean) {

  if (!KnectMongo.client)
    return;

  const db = KnectMongo.db;

  console.log();

  await each(['user', 'post'], async (name) => {
    const dropped = await db.dropCollection(name);
    if (dropped)
      console.log(`  Dropped collection ${name}`);
  });

  if (close)
    KnectMongo.client.close();

}

describe('Knect-Mongo', () => {

  it('should create model and initialize', async () => {
    const Models = await load();
    assert.equal(Models.UserModel.dbname, dbname);
    assert.instanceOf(Models.milton, Models.User);
  });

  it('should create user "Milton Waddams".', async () => {
    const Models = await load();
    const milton = Models.milton;
    const op = await milton.create();
    assert.equal(op.insertedCount, 1);
    assert.equal(op.ops[0].created, milton.created);
  });

  it('should get user copy', async () => {
    const Models = await load();
    const milton = Models.miltonCopy;
    let op: any = await Models.UserCopy.find();
    assert.equal(op[0].firstName, 'Milton');
    op = await milton.create();
    assert.equal(op.insertedCount, 1);
    assert.equal(op.ops[0].created, milton.created);
    op = await Models.UserCopy.find();
    assert.equal(op.length, 2);
  });

  it('should create post for "Milton Waddams".', async () => {
    const Models = await load();
    const milton = Models.milton;
    const post = new Models.Post({ title: 'Milton\'s Post', body: 'I need my swingline.', user: milton.id });
    const opc = await post.create();
    assert.equal(opc.insertedCount, 1);
    milton.posts.push(opc.insertedId);
    const ops = await milton.save();
    assert.equal((ops as any).modifiedCount, 1);
  });

  it('should find user "Milton Waddams" and populate posts.', async () => {
    const Models = await load();
    const User = Models.User;
    const id = Models.milton.id;
    const posts = await Models.Post.find();
    // Only one post so we know is first.
    const post = posts[0];
    const user = await User.findById<IUserPopulated>(id, { populate: 'posts' });
    assert.deepEqual(user.posts[0], post);
  });

  it('should find user "Milton Waddams" and delete.', async () => {
    const Models = await load();
    const milton = Models.milton;
    const op = await milton.delete();
    assert.equal(op.deletedCount, 1);
  });

  after(drop.bind(null, true));

});
