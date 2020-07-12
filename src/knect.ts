import { MongoClient, MongoClientOptions, Db } from 'mongodb';
import { parseDbName, fromNamespace } from './utils';
import { Model } from './model';
import { initDocument } from './document';
import { ModelMap } from './map';
import { ISchema, IDoc, Constructor, IOptions } from './types';

export const MONGO_CLIENT_DEFAULTS = {
  useNewUrlParser: true,
  useUnifiedTopology: true
};

const DEFAULTS: IOptions = {
  delimiter: '.',
  isValid: (...args) => Promise.resolve(true),
  validate: (ns, doc) => Promise.resolve(doc)
};

export class KnectMongo {

  static instance: KnectMongo;

  dbname: string;
  client: MongoClient;
  db: Db;
  models: ModelMap = new ModelMap();

  options: IOptions;

  constructor(options?: IOptions) {
    if (KnectMongo.instance)
      return KnectMongo.instance;
    this.options = { ...DEFAULTS, ...options };
    if (this.options.uri)
      this.connect(this.options.uri, this.options.clientOptions);
    KnectMongo.instance = this;
  }

  /**
   * Ensures schema is valid configuration.
   * 
   * @param name the name of the schema.
   * @param schema the schema object.
   */
  private normalizeSchema<S extends IDoc>(name: string, schema: ISchema<S>) {

    schema.joins = schema.joins || {} as any;

    if (!schema.collectionName)
      throw new Error(`Cannot normalize schema "${name} using collectionName of undefined`);

    for (const k in schema.joins) {
      const join = schema.joins[k];
      if (!join.collection)
        throw new Error(`Cannot normalize schema "${name}" using join "${k}" with collection of undefined.`);
      join.key = join.key || '_id';
      join.options = join.options || {};
    }

    return schema;

  }

  /**
   * Connects to Mongodb instance.
   * 
   * @param uri the Mongodb connection uri.
   * @param options Mongodb client connection options.
   */
  async connect(uri: string = this.options.uri, options: MongoClientOptions = this.options.clientOptions) {

    if (this.client) return this.client;

    options = { ...MONGO_CLIENT_DEFAULTS, ...options };

    this.dbname = parseDbName(uri) || null;

    this.client = await MongoClient.connect(uri, options);

    if (this.dbname)
      this.db = this.client.db(this.dbname);

    return this.client;

  }

  /**
   * Sets the database.
   * 
   * @param name the database name to connect to.
   */
  async setDb(name: string) {
    if (!this.client)
      throw new Error(`Cannot set database with MongoClient of undefined.`);
    if (!this.client.isConnected())
      await this.client.connect();
    this.db = this.client.db(name);
    return this.db;
  }

  /**
   * Accepts a schema and creates model with static and instance convenience methods.
   * 
   * @param ns the namespace for the schema.
   * @param schema the schema configuration containing document validation.
   */
  model<S extends object>(ns: string, schema?: ISchema<S>) {

    const parsedNs = fromNamespace(ns, this.options.delimiter);

    if (!schema) {
      const model = this.models.get(ns) as typeof DocumentModel & Constructor<Model<S> & S>;
      if (!model)
        throw new Error(`Model "${ns}" could NOT be found.`);
      return model;
    }

    schema.collectionName = schema.collectionName || parsedNs.collection;

    schema = this.normalizeSchema(ns, schema);

    const DocumentModel = initDocument(schema, this.client, this.db, Model, this);

    this.models.set(ns, DocumentModel as any);

    return DocumentModel as typeof DocumentModel & Constructor<Model<S> & S>;

  }

}

// let _instance: KnectMongo;

/**
 * Gets singleton instance of KnectMongo
 */
// function getInstance(options?: IOptions) {
//   if (!_instance)
//     _instance = new KnectMongo(options);
//   return _instance;
// }

// export default getInstance;
