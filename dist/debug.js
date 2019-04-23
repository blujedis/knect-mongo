"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _1 = require("./");
const JOI = require("joi");
const utils_1 = require("./utils");
const UserSchema = {
    props: JOI.object(),
    joins: {
        tags: { collection: 'tags', isArray: true },
        apikey: { collection: 'keys', cascade: true },
    }
};
const UserModel = _1.default.model('user', UserSchema);
// We can also create a mixin here to mixin perhaps
// even more helpers that are common etc.
// you could also call "UserModel" simply User and extend
// nothing and just use statics to interact with DB.
class User extends UserModel {
    constructor() {
        super(...arguments);
        // customize here.
        this.firstName = 'larry';
    }
}
(async function init() {
    const { err, data } = await utils_1.awaiter(_1.default.connect('mongodb://10.10.20.10:32770/temp'));
    if (err)
        throw err;
    console.log(`\nConnected to: ${data.databaseName}`);
    const user = new User({ firstName: 'Paula', lastName: 'Hazelton' });
    console.log('\nUser Instance:');
    console.log('  ', user);
    console.log();
    const result = await user.create();
    // console.log('Results:\n  matched:', result.matchedCount,
    //   '\n  modified:', result.modifiedCount, '\n  upserted:', result.upsertedCount + '\n');
    _1.default.client.close();
})();
//# sourceMappingURL=debug.js.map