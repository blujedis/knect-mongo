import KnectMongo from './';
import { object, string, array, InferType, number } from 'yup';
import { me } from './utils';
import { LikeObjectId, ISchema } from './types';
import { ObjectId } from 'mongodb';

const userSchema = object({
  firstName: string(),
  lastName: string(),
  posts: array<LikeObjectId>(),
  tags: array<string>(),
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

  const { err: cErr, data: cData } = await me(KnectMongo.connect('mongodb://10.10.20.5:32768/temp'));

  const UserModel = KnectMongo.model('user', schema);

  if (cErr) {
    KnectMongo.client.close();
    throw cErr;
  }

  console.log(`\nConnected to: ${cData.databaseName.toUpperCase()}\n`);

  // const user = new UserModel({ firstName: 'Milton', lastName: 'Waddams', posts: [], tags: [] });

  // user.firstName = 'Peter';

  // const { err: sErr, data: sData } = await me(user.save());

  // ENSURE DOC, SAVED are SAME.
  // console.log(sData.doc);
  // console.log('\n');
  // console.log(user._doc);
  // console.log('\n');

  const { err: uErr, data: uData } =
    await me(UserModel.updateOne(
      { _id: new ObjectId('5eec078cd4b283619e646e63') },
      {
        tags: ['ten']
        // $addToSet: {
        //   tags: {
        //     $each: ['three', 'six', 'seven']
        //   }
        // }
      }
    ));

  if (uErr)
    console.log('ERROR:', uErr.message);
  else
    console.log('UPDATE MODIFIED COUNT:', uData.modifiedCount);

  KnectMongo.client.close();

})();
