"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _1 = require("./");
const yup_1 = require("yup");
const utils_1 = require("./utils");
const mongodb_1 = require("mongodb");
const userSchema = yup_1.object({
    firstName: yup_1.string(),
    lastName: yup_1.string(),
    posts: yup_1.array(),
    tags: yup_1.array(),
    created: yup_1.number(),
    modified: yup_1.number()
});
const schema = {
    props: userSchema,
    joins: {
    // tags: { collection: 'tags' },  
    // apikey: { collection: 'keys', cascade: true },
    }
};
(async function init() {
    const { err: cErr, data: cData } = await utils_1.me(_1.default.connect('mongodb://10.10.20.5:32768/temp'));
    const UserModel = _1.default.model('user', schema);
    if (cErr) {
        _1.default.client.close();
        throw cErr;
    }
    console.log(`\nConnected to: ${cData.databaseName.toUpperCase()}\n`);
    // const user = new UserModel({ firstName: 'Milton', lastName: 'Waddams', posts: [], tags: [] });
    // user.firstName = 'Peter';
    // const { err: sErr, data: sData } = await me(user.save());
    // ENSURE DOC, SAVED are SAME.
    // console.log(sData.doc);
    // console.log('\n');
    // console.log(user._doc);
    // console.log('\n');
    const { err: uErr, data: uData } = await utils_1.me(UserModel.updateOne({ _id: new mongodb_1.ObjectId('5eec078cd4b283619e646e63') }, {
        tags: ['ten']
        // $addToSet: {
        //   tags: {
        //     $each: ['three', 'six', 'seven']
        //   }
        // }
    }));
    if (uErr)
        console.log('ERROR:', uErr.message);
    else
        console.log('UPDATE MODIFIED COUNT:', uData.modifiedCount);
    _1.default.client.close();
})();
//# sourceMappingURL=debug.js.map