"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _1 = require("./");
const yup_1 = require("yup");
const utils_1 = require("./utils");
const schema = {
    props: yup_1.object({
        firstName: yup_1.string(),
        lastName: yup_1.string()
    }),
    joins: {
        tags: { collection: 'tags', isArray: true },
        apikey: { collection: 'keys', cascade: true },
    }
};
const UserModel = _1.default.model('user', schema);
class User extends UserModel {
}
User.
(async function init() {
    const { err, data } = await utils_1.awaiter(_1.default.connect('mongodb://10.10.20.10:32770/temp'));
    if (err)
        throw err;
    console.log(`\nConnected to: ${data.databaseName}`);
    const user = new User({ firstName: 'Paula', lastName: 'Hazelton' });
    console.log('\nUser Instance:');
    console.log('  ', user);
    console.log();
    await utils_1.awaiter(user.create());
    _1.default.client.close();
})();
//# sourceMappingURL=debug.js.map