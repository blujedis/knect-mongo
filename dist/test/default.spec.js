"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const mocha = require("mocha");
// const assert = chai.assert;
const describe = mocha.describe;
const src_1 = require("../src");
const models_1 = require("./models");
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
    if (!src_1.default.client)
        await src_1.default.connect(`mongodb://10.10.20.5:32768/temp`);
    // Reset schemas or you'll get dupe error.
    // KnectMongo.schemas.clear();
    src_1.default.models.clear();
    const User = src_1.default.model('user', models_1.UserSchema);
    const Post = src_1.default.model('post', models_1.PostSchema);
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
async function drop(close) {
    if (!src_1.default.client)
        return;
    const db = src_1.default.db;
    let collections = await db.collections();
    collections = collections.map(c => c.s.namespace.collection);
    collections.length ? console.log('\n  Dropping Collections:') : null;
    await each(collections, async (name) => {
        const dropped = await db.dropCollection(name);
        if (dropped)
            console.log(`    Dropped ${name}`);
    });
    if (close)
        src_1.default.client.close();
}
describe('Knect-Mongo', () => {
    it('should create model and initialize', async () => {
        const Models = await load();
        chai_1.assert.equal(Models.User.collectionName, 'user');
    });
    it('should create user "Milton Waddams".', async () => {
        const Models = await load();
        const milton = new Models.User({
            firstName: 'Milton',
            lastName: 'Waddams',
            posts: []
        });
        const { err, data } = await src_1.me(milton.save());
        if (err)
            throw err;
        chai_1.assert.equal(data.ok, 1);
        chai_1.assert.equal(data.doc.created, milton.created);
    });
    it('should change user name to Peter Gibbons', (done) => {
        load().then(Models => {
            const User = Models.User;
            // Test using callback.
            User.findOne({ firstName: 'Milton' }, async (err, data) => {
                if (err)
                    throw err;
                // convert to user Model.
                const user = new User(data);
                user.firstName = 'Peter';
                user.lastName = 'Gibbons';
                const result = await src_1.me(user.save());
                if (result.err)
                    throw result.err;
                // @ts-ignore
                chai_1.assert.deepEqual(user._doc, result.data.doc);
                done();
            });
        });
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
        // assert.equal(user.posts[0], lastPost);
    });
    // it('should get user and populate posts', async () => {
    //   const Models = await load();
    //   const User = Models.User;
    //   const user = await User.findModel({ firstName: 'Peter' });
    //   await user.populate('posts');
    //   const posts = user.posts.slice(0);
    //   assert.equal((user.posts[0] as any)._id.toString(), lastPost);
    //   // Unpopulate posts and ensure
    //   // they have been clean so as not
    //   // to be saved to db.
    //   const result = User.unpopulate(user._doc, 'posts');
    //   assert.deepEqual(result.posts, posts);
    // });
    // it('should cascade delete posts', async () => {
    //   const Models = await load();
    //   const User = Models.User;
    //   const user = await User.findModel({ firstName: 'Peter' });
    //   User.cascade(user._doc, 'posts')
    //     .then(res => {
    //       console.log(res);
    //     })
    //     .catch(err => {
    //       console.log(err);
    //     });
    // });
    after(drop.bind(null, true));
});
//# sourceMappingURL=default.spec.js.map