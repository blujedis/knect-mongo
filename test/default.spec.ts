import * as chai from 'chai';

const assert = chai.assert;

import KnectMongo, { me } from '../src';
import { UserSchema, PostSchema } from './models';

async function each(arr, done) {
  for (let i = 0; i < arr.length; i++) {
    await done(arr[i], i, arr);
  }
}

async function load() {

  if (!KnectMongo.client)
    await KnectMongo.connect(`mongodb://10.10.20.5:32768/temp`);

  // Reset schemas or you'll get dupe error.
  KnectMongo.schemas.clear();

  const User = KnectMongo.model('user', UserSchema);
  const Post = KnectMongo.model('post', PostSchema);

  User.pre('create', (next, query, ...args: any[]) => {
    next();
  });

  return {
    User,
    Post
  };

}

async function drop(close?: boolean) {

  if (!KnectMongo.client)
    return;

  const db = KnectMongo.db;

  let collections: any[] = await db.collections();
  collections = collections.map(c => c.s.namespace.collection);

  collections.length ? console.log('\n  Dropping Collections:') : null;

  await each(collections, async (name) => {
    const dropped = await db.dropCollection(name);
    if (dropped)
      console.log(`    Dropped ${name}`);
  });

  if (close)
    KnectMongo.client.close();

}

describe('Knect-Mongo', () => {

  it('should create model and initialize', async () => {
    const Models = await load();
    assert.equal(Models.User.collectionName, 'user');
  });

  it('should create user "Milton Waddams".', async () => {
    const Models = await load();
    const milton = new Models.User({
      firstName: 'Milton',
      lastName: 'Waddams'
    });
    const { err, data } = await me(milton.save());
    if (err)
      throw err;
    assert.equal(data.ok, 1);
    assert.equal(data.doc.created, milton.created);
  });

  // it('should change user name to Peter Gibbons', (done) => {

  //   load().then(Models => {

  //     const User = Models.User;

  //     // Test using callback.
  //     User.findOne({ firstName: 'Milton' }, async (err, data) => {
  //       if (err)
  //         throw err;
  //       // convert to user Model.
  //       const user = new User(data);
  //       user.firstName = 'Peter';
  //       user.lastName = 'Gibbons';

  //       const result = await me(user.save());

  //       if (result.err)
  //         throw result.err;

  //       // @ts-ignore
  //       assert.deepEqual(user._doc, result.data.doc);

  //       done();

  //     });

  //   });

  // });

  after(drop.bind(null, true));

});
