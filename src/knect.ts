import { MongoClient, MongoClientOptions, Db } from 'mongodb';
import { ISchema, Constructor, IDoc } from './types';
import { parseDbName, fromNamespace } from './utils';
import { BaseModel } from './model';
import { initDocument } from './document';

export const MONGO_CLIENT_DEFAULTS = {
  useNewUrlParser: true,
  useUnifiedTopology: true
};

export class KnectMongo {

  dbname: string;
  db: Db;
  client: MongoClient;
  schemas: Map<string, ISchema<any>> = new Map();
  delimiter: string = '.'; // used for defining schema names.

  /**
   * Accepts a schema and creates model with static and instance convenience methods.
   * 
   * @param name the name of the collection
   * @param schema the schema configuration containing document validation.
   */
  private createModel<S extends IDoc>(name: string, schema: ISchema<S>) {

    const knect = this;

    this.schemas.set(name, schema);

    const Document = initDocument(schema, knect.client, knect.db, BaseModel);

    return Document;

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
   * @param collectionName specify the collection name otherwise schema name is used.
   */
  model<S extends object>(ns: string, schema?: ISchema<S>) {

    const parsedNs = fromNamespace(ns, this.delimiter);

    let _ns: string = ns;
    let _schema: ISchema<S> = schema;

    // Return the existing schema/model by name.
    if (!schema && this.schemas[parsedNs.ns]) {
      _schema = this.schemas.get(parsedNs.ns);
    }
    else {
      _ns = parsedNs.ns;
      schema.collectionName = schema.collectionName || parsedNs.collection;
    }

    const DocumentModel = this.createModel(_ns, _schema);

    return DocumentModel as typeof DocumentModel & Constructor<BaseModel<S> & S>;

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
