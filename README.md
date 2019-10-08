# Knect Mongo

Mongodb connection and model helper.

## Usage

Below example utilizes async/await you can also use promises if you wish.

```ts
import KnectMongo from 'knect-mongo';
import yup from 'yup';

async function init() {

  const dbOptions = {};
  await KnectMongo.connect('mongodb://localhost:27017/mydb', dbOptions);

  const userDoc = yup.object({
    firstName: yup.string().required(),
    lastName: yup..string().required()
  });

  // If using Typescript
  type IUserDoc = InferType<typeof userDoc>;

  // Define the schema (see ISchema for additional properties)
  const UserSchema: ISchema<IUserDoc> = {
    props: userDoc
  };

  const User = KnectMongo.model('user', UserSchema);

  // Rather meaningless example but you get the idea.
  // Check /test/default.spec.ts for more examples.
  try {

    // Create a new user from model.
    const user = new User({ firstName: 'Milton', lastName: 'Waddams' });
    await user.save(); // This will create a new user as there is no id.

    // Retrieve the user from the database.
    const userData = await User.findOne({ _id: user._id });

    // Retrieve as a model.
    // this will be the same as
    // our "user" above where
    // we called .save().
    const modelFromDb = await User.fromModel({ _id: user._id });

  }
  catch(err) {
    if (err) throw err;
  }

}

init();
```

## Docs

See [https://blujedis.github.io/knect-mongo/](https://blujedis.github.io/knect-mongo/)

## Change

See [CHANGE.md](CHANGE.md)

## License

See [LICENSE.md](LICENSE)

