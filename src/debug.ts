import KnectMongo from './';
import { object, string } from 'yup';
import { me } from './utils';
import { LikeObjectId } from './types';

interface IUser {
  firstName: string;
  lastName: string;
  posts?: LikeObjectId[];
}

const schema = {
  props: object<IUser>({
    firstName: string(),
    lastName: string()
  }),
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

User.

// We can also create a mixin here to mixin perhaps
// even more helpers that are common etc.
// you could also call "UserModel" simply User and extend
// nothing and just use statics to interact with DB.

(async function init() {

  const { err, data } = await me(KnectMongo.connect('mongodb://10.10.20.10:32770/temp'));

  if (err)
    throw err;

  console.log(`\nConnected to: ${data.databaseName}`);

  const user = new User({ firstName: 'Paula', lastName: 'Hazelton' });

  console.log('\nUser Instance:');
  console.log('  ', user);
  console.log();

  await me(user.create());

  KnectMongo.client.close();

})();
