import KnectMongo, { Model } from './';


const awaiter = <T = any>(promise: Promise<T>, key = 'data') => {
  return promise
    .then(data => ({ err: null, [key]: data }))
    .catch(err => ({ err, [key]: null }));
};

class UserSchema extends Model {
  username: string;
  password: string;
}

const User = KnectMongo.model('user', UserSchema);

(async function init() {

  const { err, db } = await awaiter(KnectMongo.connect('mongodb://10.10.20.10:32770/temp'), 'db');

  if (err)
    throw err;

  console.log(`connected to: ${db.databaseName}`);

  const user = new User({ username: 'chazelton' });

  console.log(user.db);

})();

