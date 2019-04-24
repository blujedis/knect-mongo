"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _1 = require("./");
const yup_1 = require("yup");
const utils_1 = require("./utils");
const schema = {
    props: yup_1.object().shape({
        firstName: yup_1.string().length(3)
    }),
    joins: {
        tags: { collection: 'tags', isArray: true },
        apikey: { collection: 'keys', cascade: true },
    }
};
const UserModel = _1.default.model('user', schema);
class User extends UserModel {
}
// We can also create a mixin here to mixin perhaps
// even more helpers that are common etc.
// you could also call "UserModel" simply User and extend
// nothing and just use statics to interact with DB.
(async function init() {
    let result = await utils_1.awaiter(_1.default.connect('mongodb://10.10.20.10:32770/temp'));
    if (result.err)
        throw result.err;
    console.log(`\nConnected to: ${result.data.databaseName}`);
    const user = new User({ firstName: 'Paula', lastName: 'Hazelton' });
    console.log('\nUser Instance:');
    console.log('  ', user);
    console.log();
    result = await utils_1.awaiter(user.create());
    _1.default.client.close();
})();
//# sourceMappingURL=debug.js.map