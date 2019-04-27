# Knect Mongo

Mongodb connection and model helper.

## Usage

Below example utilizes async/await you can also use promises if you wish.

```ts
import KnectMongo from 'knect-mongo';
import * as Yup from 'yup';

async function init() {

  await KnectMongo.connect('mongodb://localhost:27017/myproject', { options });

  interface IUser {
    username: string;
    password: string;
  }

  const User = KnectMongo.model('user', Yup.object());

  const found = await User.findOne({ _id: 'some-id' }, { options });

}

init();
```

## Docs

See [https://blujedis.github.io/knect-mongo/](https://blujedis.github.io/knect-mongo/)

## Change

See [CHANGE.md](CHANGE.md)

## License

See [LICENSE.md](LICENSE)

