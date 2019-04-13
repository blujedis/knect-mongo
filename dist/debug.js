"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _1 = require("./");
const JOI = require("joi");
const utils_1 = require("./utils");
const UserSchema = JOI.object();
const UserModel = _1.default.model('user', UserSchema);
// We can also create a mixin here to mixin perhaps
// even more helpers that are common etc.
// you could also call "UserModel" simply User and extend
// nothing and just use statics to interact with DB.
class User extends UserModel {
    // Allow setting defaults in constructor
    // this could come from a base class.
    constructor(props) {
        super();
        for (const k in props) {
            if (props.hasOwnProperty(k))
                this[k] = props[k];
        }
    }
}
(async function init() {
    const { err, data } = await utils_1.awaiter(_1.default.connect('mongodb://10.10.20.10:32770/temp'));
    if (err)
        throw err;
    console.log(`\nConnected to: ${data.databaseName}`);
    const user = new User({ id: '5cb144ce2a4d90c837fd72b4', firstName: 'Carey', lastName: 'Hazelton' });
    console.log('\nUser Instance:');
    console.log('  ', user);
    console.log();
    const result = await utils_1.awaiter(user.save());
    if (result.err)
        console.log(result.err + '\n');
    else
        console.log('Results:\n  matched:', result.data.matchedCount, '\n  modified:', result.data.modifiedCount, '\n  upserted:', result.data.upsertedCount + '\n');
    _1.default.client.close();
})();
//# sourceMappingURL=debug.js.map