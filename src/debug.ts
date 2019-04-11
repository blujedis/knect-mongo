import KnectMongo from './';
import * as JOI from 'joi';
import { awaiter } from './utils';

interface IUser {
  firstName: string;
  lastName: string;
}

const UserSchema = JOI.object();

const UserModel = KnectMongo.model('user', UserSchema);

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

  const { err, db } = await awaiter(KnectMongo.connect('mongodb://10.10.20.10:32770/temp'), 'db');

  if (err)
    throw err;

  console.log(`connected to: ${db.databaseName}`);

  const user = new User({ firstName: 'Aaron', lastName: 'Hazelton' });

  console.log(user);

  user.save();

  KnectMongo.client.close();

})();

