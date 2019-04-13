import KnectMongo from './';
import * as JOI from 'joi';
import { awaiter } from './utils';

interface IUser {
  id?: string;
  firstName: string;
  lastName: string;
  created?: number;
  modified?: number;
  deleted?: number;
}

const UserSchema = JOI.object();

const UserModel = KnectMongo.model<IUser>('user', UserSchema);

// We can also create a mixin here to mixin perhaps
// even more helpers that are common etc.
// you could also call "UserModel" simply User and extend
// nothing and just use statics to interact with DB.

class User extends UserModel {

  // customize here.
  firstName: string;
  lastName: string;

  // Allow setting defaults in constructor
  // this could come from a base class.
  constructor(props?: IUser) {
    super();
    for (const k in props) {
      if (props.hasOwnProperty(k))
        this[k] = props[k];
    }
  }

}

(async function init() {

  const { err, data } = await awaiter(KnectMongo.connect('mongodb://10.10.20.10:32770/temp'));

  if (err)
    throw err;

  console.log(`\nConnected to: ${data.databaseName}`);

  const user = new User({ id: '5cb144ce2a4d90c837fd72b4', firstName: 'Carey', lastName: 'Hazelton' });

  console.log('\nUser Instance:');
  console.log('  ', user);
  console.log();

  const result = await awaiter(user.save());

  if (result.err)
    console.log(result.err + '\n');
  else
    console.log('Results:\n  matched:', result.data.matchedCount, '\n  modified:', result.data.modifiedCount, '\n  upserted:', result.data.upsertedCount + '\n');

  KnectMongo.client.close();

})();

