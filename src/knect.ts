import { MongoClient, MongoClientOptions, Db } from 'mongodb';
import { parseDbName, fromNamespace } from './utils';
import { Model as BaseModel } from './model';
import { initDocument } from './document';
import { ISchema, IDoc, Constructor, IOptions } from './types';

export const MONGO_CLIENT_DEFAULTS = {
  useNewUrlParser: true,
  useUnifiedTopology: true
};

const DEFAULTS: IOptions = {
  delimiter: '.',
  isValid: (...args) => Promise.resolve(true),
  validate: (ns, doc) => Promise.resolve(doc),
  excludeKey: 'deleted'
};

export class KnectMongo {

  static instance: KnectMongo;

  dbname: string;
  client: MongoClient;
  db: Db;
  schemas = new Map<string, ISchema<any>>();

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
  private normalizeSchema<T extends IDoc>(name: string, schema: ISchema<T>) {

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
   * Simply updates/sets the options.
   * 
   * @param options Knect Mongo options.
   */
  setOptions(options: IOptions) {
    this.options = { ...this.options, ...options };
    return this;
  }

  /**
   * Connects to Mongodb instance.
   * 
   * @param uri the Mongodb connection uri.
   * @param options Mongodb client connection options.
   */
  async connect(uri: string = this.options.uri, options: MongoClientOptions = this.options.clientOptions) {

    if (this.client) return this.client;

    if (!this.options.uri)
      this.options.uri = uri;

    options = { ...MONGO_CLIENT_DEFAULTS, ...options };
    this.options.clientOptions = { ...options };

    try {
      this.dbname = parseDbName(uri) || null;
      this.client = await MongoClient.connect(uri, options);
    }
    catch (ex) {
      throw ex;
    }

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
  model<T extends IDoc>(
    ns: string,
    schema?: ISchema<T>) {

    const parsedNs = fromNamespace(ns, this.options.delimiter);

    const schemaExists = this.schemas.has(ns);

    schema = schema || {};

    if (!schemaExists) {
      schema.collectionName = schema.collectionName || parsedNs.collection;
      schema = this.normalizeSchema(ns as string, schema);
    }
    else {
      schema = this.schemas.get(ns);
    }

    const Model =
      initDocument<T, BaseModel<T>>(schema, this.client, this.db, BaseModel, this);

    // Update if new schema.
    if (!schemaExists)
      this.schemas.set(ns, schema);

    return Model as typeof Model & Constructor<BaseModel<T> & T>;

  }

}