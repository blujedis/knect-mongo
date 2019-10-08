import { assert } from 'chai';

import KnectMongo, { me } from '../src';
import { UserSchema, PostSchema, IUserSchema } from './models';

let lastPost;

function extendDate(doc, isCreate = false) {
  const date = Date.now();
  if (Array.isArray(doc))
    return doc.map(d => {
      if (!isCreate)
        d.created = date;
      d.modified = date;
    });
  if (isCreate)
    doc.created = date;
  doc.modified = date;
  return doc;
}

async function each(arr, done) {
  for (let i = 0; i < arr.length; i++) {
    await done(arr[i], i, arr);
  }
}

async function load() {

  if (!KnectMongo.client)
    await KnectMongo.connect(`mongodb://10.10.20.5:32768/temp`);

  // Reset schemas or you'll get dupe error.
  // KnectMongo.schemas.clear();
  KnectMongo.models.clear();

  const User = KnectMongo.model('user', UserSchema);
  const Post = KnectMongo.model('post', PostSchema);

  User.pre('create', (next, doc) => {
    extendDate(doc, true);
    next();
  });

  // User.pre('update', (next, query, update) => {
  //   extendDate(update);
  //   next();
  // });

  const Models = {
    User,
    Post
  };

  return Models;

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
      lastName: 'Waddams',
      posts: []
    });
    const { err, data } = await me(milton.save());
    if (err)
      throw err;
    assert.equal(data.ok, 1);
    assert.equal(data.doc.created, milton.created);
  });

  it('should change user name to Peter Gibbons', async () => {

    const Models = await load();
    const User = Models.User;

    // Test using callback.
    const result = await me(User.findOne({ firstName: 'Milton' }));

    if (result.err)
      throw result.err;

    // convert to user Model.
    const user = new User(result.data);
    user.firstName = 'Peter';
    user.lastName = 'Gibbons';

    const result2 = await me(user.save());

    if (result2.err)
      throw result2.err;

    // @ts-ignore
    assert.deepEqual(user._doc, result2.data.doc);

  });

  it('should create a post for Peter.', async () => {
    const Models = await load();
    const User = Models.User;
    const user = await User.findModel({ firstName: 'Peter' });
    const post = new Models.Post({
      title: 'Office Space',
      body: 'Where\'s my Swingline',
      user: user._id
    });
    await post.save();
    user.posts.push(post);
    lastPost = post._id;
    await user.save();
    assert.equal(user.posts[0].toString(), lastPost.toString());
  });

  it('should get user and populate posts', async () => {
    const Models = await load();
    const User = Models.User;
    const user = await User.findModel({ firstName: 'Peter' });
    const posts = user.posts.slice(0);
    await user.populate('posts');
    assert.equal((user.posts[0] as any)._id.toString(), lastPost);
    // Unpopulate posts and ensure
    // they have been clean so as not
    // to be saved to db.
    const result = User.unpopulate(user._doc, 'posts');
    assert.deepEqual(result.posts, posts);
  });

  it('should cascade delete posts', async () => {
    const Models = await load();
    const User = Models.User;
    const user = await User.findModel({ firstName: 'Peter' });
    const { err, data } = await me(User.cascade(user._doc, 'posts'));
    if (err)
      throw err;
  });

  after(drop.bind(null, true));

});
