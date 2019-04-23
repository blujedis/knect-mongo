import KnectMongo from './';
import { awaiter } from './utils';
import { LikeObjectID } from './types';
import { object } from 'yup';

interface IUser {
  firstName: string;
  lastName: string;
  posts?: LikeObjectID[];
}

const schema = {
  props: object(),
  joins: {
    tags: { collection: 'tags', isArray: true },
    apikey: { collection: 'keys', cascade: true },
  }
};

const UserModel = KnectMongo.model<IUser>('user', schema);

class User extends UserModel {

  // customize here.
  firstName: string;
  lastName: string;

}

// We can also create a mixin here to mixin perhaps
// even more helpers that are common etc.
// you could also call "UserModel" simply User and extend
// nothing and just use statics to interact with DB.

(async function init() {

  const { err, data } = await awaiter(KnectMongo.connect('mongodb://10.10.20.10:32770/temp'));

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

  KnectMongo.client.close();

})();
