# Knect Mongo

Mongodb connection and model helper.

## Usage

Below example utilizes async/await you can also use promises or callbacks if you wish, all supported.

```sh
$ npm install knect-mongo s-
```

OR

```sh
$ yarn add knect-mongo
```

After install import or require knect-mongo.

```ts
import KnectMongo from 'knect-mongo';   // or const KnectMongo = require('knect-mongo');
import yup from 'yup';                  // or const yup = require('yup');

(async function init() {

  const dbOptions = {};
  await KnectMongo.connect('mongodb://localhost:27017/mydb', dbOptions);

  const userDoc = yup.object({
    firstName: yup.string().required(),
    lastName: yup..string().required()
  });

  /* WITH TYPESCRIPT
  ****************************************************/
  type IUserDoc = InferType<typeof userDoc>;

  const UserSchema: ISchema<IUserDoc> = {
    props: userDoc
  };

  const User = KnectMongo.model('user', UserSchema);
  /***************************************************/

  /* WITHOUT TYPESCRIPT
  ****************************************************/
   const User = KnectMongo.model('user', { props: userDoc });
  /***************************************************/
  

  try {
    // Create a new user from model.
    const user = new User({ firstName: 'Milton', lastName: 'Waddams' });

    // Save our new model.
    await user.save(); 

  }
  catch(err) {
    if (err) throw err;
  }

})();
```

## WORKING WITH DATA

You can find all static methods for a model in the source [document.ts](https://github.com/blujedis/knect-mongo/blob/master/src/document.ts) file.

### FINDING DATA

Additional boilerplate from above left out for clarity.

```ts
async function getUser(_id) {

  // Create the Model
  const User = KnectMongo.model('user', { your_schema_here });

  // Using await get the user data.
  const userData = await User.findOne({ _id });

}
```

In the above example we create the model but what if a model already exists? It's important to note if using Typescript we need to pass back in the schema for the model. This is because we cannot store the design time type in our map. Simply pass in our defined schema as **show above** then import and reuse it here.

```ts
// file containing all our defined schemas NOT SHOWN ABOVE.
// this is NOT required if NOT using Typescript.
import { IUserSchema } from './schemas'; 

async function getUser(_id) {

  // Get the Model
  // NOTE: if NOT using Typescript "<IUserSchema>" is NOT required.
  const User = KnectMongo.model<IUserSchema>('user');

  // Using await get the user data.
  const userData = await User.findOne({ _id });

}
```

## Docs

See [https://blujedis.github.io/knect-mongo/](https://blujedis.github.io/knect-mongo/)

## Change

See [CHANGE.md](CHANGE.md)

## License

See [LICENSE.md](LICENSE)

