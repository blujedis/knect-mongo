import { MongoClient, MongoClientOptions, Db } from 'mongodb';
import { ISchema, IDoc, Constructor } from './types';
import { parseDbName, fromNamespace } from './utils';
import { Model } from './model';
import { initDocument } from './document';
import { ModelMap } from './map';

export const MONGO_CLIENT_DEFAULTS = {
  useNewUrlParser: true,
  useUnifiedTopology: true
};

export class KnectMongo {

  dbname: string;
  db: Db;
  client: MongoClient;
  models: ModelMap = new ModelMap();
  delimiter: string = '.'; // used for defining schema names.

  /**
   * Ensures schema is valid configuration.
   * 
   * @param name the name of the schema.
   * @param schema the schema object.
   */
  private normalizeSchema<S extends IDoc>(name: string, schema: ISchema<S>) {

    schema.props = schema.props || {} as any;
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
  async connect(uri: string, options?: MongoClientOptions) {

    if (this.db) return this.db;

    options = { ...MONGO_CLIENT_DEFAULTS, ...options };

    this.dbname = parseDbName(uri);

    this.client = await MongoClient.connect(uri, options);

    this.db = this.client.db(this.dbname);

    return this.db;

  }

  /**
   * Accepts a schema and creates model with static and instance convenience methods.
   * 
   * @param ns the namespace for the schema.
   * @param schema the schema configuration containing document validation.
   */
  model<S extends object>(ns: string, schema?: ISchema<S>) {

    const parsedNs = fromNamespace(ns, this.delimiter);
    type Document = typeof DocumentModel;

    if (!schema) {
      const model = this.models.get(ns) as Document & Constructor<Model<S> & S>;
      if (!model)
        throw new Error(`Model "${ns}" could NOT be found.`);
      return model;
    }

    schema.collectionName = schema.collectionName || parsedNs.collection;

    schema = this.normalizeSchema(ns, schema);

    const DocumentModel = initDocument(schema, this.client, this.db, Model, this);

    this.models.set(ns, DocumentModel as any);

    // return DocumentModel as typeof DocumentModel & Constructor<Model<S> & S>;
    // return DocumentModel as Document & DocumentContructor<Model<S>, S>;
    return DocumentModel as Document & Constructor<Model<S> & S>;

  }

}

// let _instance: KnectMongo;

// /**
//  * Gets singleton instance of KnectMongo
//  */
// function getInstance() {
//   if (!_instance)
//     _instance = new KnectMongo();
//   return _instance;
// }

// export default getInstance();
