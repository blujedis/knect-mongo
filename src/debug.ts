import KnectMongo  from './';
import { object, string, array, InferType, number } from 'yup';
import { me } from './utils';
import { LikeObjectId, ISchema } from './types';

const userSchema = object({
  firstName: string(),
  lastName: string(),
  posts: array<LikeObjectId>(),
  created: number(),
  modified: number()
});

const schema: ISchema<InferType<typeof userSchema>> = {
  props: userSchema,
  joins: {
    // tags: { collection: 'tags' },
    // apikey: { collection: 'keys', cascade: true },
  }
};

(async function init() {

  const { err, data } = await me(KnectMongo.connect('mongodb://10.10.20.5:32768/temp'));

  const UserModel = KnectMongo.model('user', schema);

  if (err) {
    KnectMongo.client.close();
    throw err;
  }

  console.log(`\nConnected to: ${data.databaseName}`);

  const user = new UserModel({ firstName: 'Milton', lastName: 'Waddams', posts: [] });

  // console.log('\nUser Instance:');
  // console.log('  ', user);
  // console.log();

  user.firstName = 'Peter';

  const { err: uErr, data: uData } = await me(user.save());

  console.log(uData.doc);
  console.log('\n');
  // @ts-ignore
  console.log(user._doc);
  console.log('\n');

  KnectMongo.client.close();

})();
