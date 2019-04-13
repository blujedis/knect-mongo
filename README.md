# Knect Mongo

Mongodb connection and model helper.

## Usage

Below example utilizes async/await you can also use promises if you wish.

```ts
import KnectMongo from 'knect-mongo';

async function init() {

  await KnectMongo.connect('mongodb-uri', { options });

  interface IUser {
    username: string;
    password: string;
  }

  const UserSchema = JOI.object();

  const User = KnectMongo.model('user', UserSchema);

  const found = await User.findOne({ _id: 'some-id' }, { options });

}

init();
```