"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _1 = require("./");
const yup_1 = require("yup");
const utils_1 = require("./utils");
const userSchema = yup_1.object({
    firstName: yup_1.string(),
    lastName: yup_1.string(),
    posts: yup_1.array(),
    created: yup_1.number(),
    modified: yup_1.number()
});
const schema = {
    props: userSchema,
    joins: {
        tags: { collection: 'tags' },
        apikey: { collection: 'keys', cascade: true },
    }
};
(async function init() {
    const { err, data } = await utils_1.me(_1.default.connect('mongodb://10.10.20.5:32768/temp'));
    const UserModel = _1.default.model('user', schema);
    if (err) {
        _1.default.client.close();
        throw err;
    }
    console.log(`\nConnected to: ${data.databaseName}`);
    const user = new UserModel({ firstName: 'Milton', lastName: 'Waddams', posts: [] });
    // console.log('\nUser Instance:');
    // console.log('  ', user);
    // console.log();
    user.firstName = 'Peter';
    const { err: uErr, data: uData } = await utils_1.me(user.save());
    console.log(uData.doc);
    console.log('\n');
    // @ts-ignore
    console.log(user._doc);
    console.log('\n');
    _1.default.client.close();
})();
//# sourceMappingURL=debug.js.map