import KnectMongo, { Model } from './';
import { awaiter } from './utils';

const schema = {
  username: String,
  password: String,
};


class UserModel extends Model {
  username: string = 'bobby'
  password: string = undefined;
}


const User = KnectMongo.model('user', UserModel);


(async function init() {

  const { err, db } = await awaiter(KnectMongo.connect('mongodb://10.10.20.10:32770/temp'), 'db');

  if (err)
    throw err;

  console.log(`connected to: ${db.databaseName}`);

  const user = new User({ username: 'chazelton' });

  user.save();

  User.knect.client.close();


})();

