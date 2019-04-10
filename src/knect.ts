import { MongoClient, MongoClientOptions, Db, Collection } from 'mongodb';

import { Model } from './model';
import { Constructor } from './types';

export const MONGO_CLIENT_DEFAULTS = {
  useNewUrlParser: true
};

/**
 * Parses database name from Mongodb connection string.
 * 
 * @param uri the Mongodb uri connection string.
 * @param def the default database name when not found in uri.
 */
function parseDbName(uri: string, def: string = '') {
  let str = uri.split('?')[0];
  if (!~str.indexOf('/'))
    return def;
  return str.split('/').pop();
}

/**
 * Default error handler.
 * 
 * @param err the error passed.
 */
function errorHandler(err: Error) {
  throw err;
}

export class KnectMongo {

  static Model: typeof Model;

  private _onError: (err: Error) => void = errorHandler;

  dbname: string;
  db: Db;
  client: MongoClient;

  /**
   * Connects to Mongodb instance.
   * 
   * @param uri the Mongodb connection uri.
   * @param options Mongodb client connection options.
   */
  async connect(uri: string, options?: MongoClientOptions) {

    if (this.db) return this.db;

    options = { ...MONGO_CLIENT_DEFAULTS, ...options };

    this.dbname = parseDbName(uri);

    this.client = await MongoClient.connect(uri, options);

    this.db = this.client.db(this.dbname);

    return this.db;

  }

  /**
   * Creates new model instance.
   * 
   * @param name the name of the collection.
   * @param Klass the Model class.
   */
  model<T extends Constructor<Model>>(name: string, Klass: T) {

    const self = this;

    return class extends Klass {

      static collectionName: string = name;
      static defaults: any;

      static get collection() {
        return self.db.collection<T>(name);
      }

      static get knect(): KnectMongo {
        return self;
      }

      static onError(err: Error) {
        self._onError(err);
      }

      constructor(...args: any[]) {
        super(...args);
        const ctor = (this.constructor as any);
        const defaults = ctor.defaults;
        for (const k in defaults) {
          if (defaults.hasOwnProperty(k) && typeof defaults[k] !== 'undefined')
            this[k] = defaults[k];
        }
        delete ctor.defaults;
      }

    }

  }

  /**
   * Sets the custom error handler function.
   * 
   * @param fn a custom error handler function.
   */
  onError(err: Error): void {
    this._onError(err);
  }

}

let _instance: KnectMongo;

/**
 * Gets singleton instance of KnectMongo
 */
function getInstance() {
  if (!_instance)
    _instance = new KnectMongo();
  return _instance;
}

export default getInstance();
