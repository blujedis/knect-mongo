import { MongoClient, MongoClientOptions, Db, FilterQuery, FindOneOptions, UpdateOneOptions, CollectionInsertOneOptions, CollectionInsertManyOptions, Collection } from 'mongodb';

import { Model } from './model';
import { Constructor, Hooks } from './types';

export const MONGO_CLIENT_DEFAULTS = {
  useNewUrlParser: true
};

function parseDbName(uri: string, def: string = '') {
  let str = uri.split('?')[0];
  if (!~str.indexOf('/'))
    return def;
  return str.split('/').pop();
}

class Dummy { }

export class KnectMongo {

  static Model: typeof Model;

  dbname: string;
  db: Db;
  client: MongoClient;

  async connect(uri: string, options?: MongoClientOptions) {

    if (this.db) return this.db;

    options = { ...MONGO_CLIENT_DEFAULTS, ...options };

    this.dbname = parseDbName(uri);

    this.client = await MongoClient.connect(uri, options);

    this.db = this.client.db(this.dbname);

    return this.db;

  }

  /**
   * 
   * @param name the name of the collection.
   * @param Klass the Model class.
   */
  model<T extends Constructor<Model>>(name: string, Klass: T) {

    const self = this;

    return class extends Klass {

      static collectionName: string = name;

      static get db() {
        return self.db;
      }

      static get collection() {
        return self.db.collection<T>(name);
      }

      get db(): Db {
        return (this.constructor as any).db;
      }

      get collection(): Collection<T> {
        return (this.constructor as any).collection;
      }

    }

  }

}

let _instance: KnectMongo;

function getInstance() {
  if (!_instance)
    _instance = new KnectMongo();
  return _instance;
}

export default getInstance();
