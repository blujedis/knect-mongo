import {
  MongoClient, MongoClientOptions, Db, FilterQuery, UpdateOneOptions,
  CommonOptions, UpdateQuery, UpdateManyOptions, CollectionInsertOneOptions, CollectionInsertManyOptions,
  InsertOneWriteOpResult, UpdateWriteOpResult, DeleteWriteOpResultObject, ObjectID,
} from 'mongodb';
import {
  IHooks, HookTypes, HookHandler, ISchema, ISchemas,
  LikeObjectID, IFindOneOptions, IJoin, IJoins, ICascadeResult, IInsertWriteOpResult,
  IInsertOneWriteOpResult, IBaseProps, IConstructor
} from './types';

import { ObjectSchema, object, ValidateOptions, ValidationError } from 'yup';

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
  const str = uri.split('?')[0];
  if (!~str.indexOf('/'))
    return def;
  return str.split('/').pop();
}

export class KnectMongo {

  dbname: string;
  db: Db;
  client: MongoClient;

  schemas: ISchemas = {};

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
   * @param name the name of the collection
   * @param config the schema configuration containing document validation.
   */
  private createModel<S extends object>(name: string, config: ISchema<Partial<S>>) {

    const self = this;

    this.schemas[name] = config;

    type P = S & IBaseProps & { _id?: LikeObjectID };

    let _id: LikeObjectID;

    const getDoc = <T>(context): T => {
      return Object.getOwnPropertyNames(context)
        .reduce((a, c) => {
          a[c] = context[c];
          return a;
        }, <any>{});
    };

    const Model = class Klass {

      static dbname = self.dbname;
      static collectionName = config.collectionName;
      static schema = config;
      static hooks: IHooks = {};

      static get client() {
        return self.client;
      }

      static get db() {
        return self.db;
      }

      static get collection() {
        return self.db.collection<P>(name);
      }

      /**
       * Sets the Model's validation schema.
       * 
       * @param schema the validation schema.
       */
      static setSchema(schema: ISchema<Partial<S>>) {
        self.schemas[name] = config;
        Klass.schema = config;
      }

      /**
       * Normalizes filter ensuring ObjectID type.
       * 
       * @param filter the Mongodb filter query.
       */
      static normalizeFilter(filter: FilterQuery<P>) {
        if (filter._id)
          filter._id = this.toObjectID(filter._id);
        return filter;
      }

      /**
       * Convert value to ObjectID.
       * 
       * @param id the Like id value to convert to Mongodb ObjectID.
       */
      static toObjectID(id: LikeObjectID): ObjectID;

      /**
       * Convert values to ObjectIDs.
       * 
       * @param ids array of values to convert to Mongodb ObjectID.
       */
      static toObjectID(ids: LikeObjectID[]): ObjectID[];
      static toObjectID(ids: LikeObjectID | LikeObjectID[]): ObjectID | ObjectID[] {

        const isArray = Array.isArray(ids);

        if (!isArray)
          ids = [ids] as any;

        const result = (ids as any).map(id => {
          if (typeof id === 'string' || typeof id === 'number')
            return new ObjectID(id);
          return id;
        }) as ObjectID[];

        if (isArray)
          return result;

        return result[0];

      }

      /**
       * Sets a hook to be called for defined method.
       * 
       * @param method the method to set hook for.
       * @param type the hook type.
       * @param handler the handler for the hook.
       */
      static setHook(method: string, type: HookTypes, handler: any) {
        this.hooks[method] = this.hooks[method] || {};
        this.hooks[method][type] = handler;
      }

      /**
       * Gets all hooks for a given method.
       * 
       * @param method the method to get hooks for.
       */
      static getHooks(method: string) {
        return this.hooks[method] || {};
      }

      /**
       * Get a hook for a given method and type.
       * 
       * @param method the hook method.
       * @param type the type of hook method to get.
       */
      static getHook(method: string, type: HookTypes) {
        this.hooks[method] = this.hooks[method] || {};
        /* tslint:disable */
        return this.getHooks[method][type] || (() => { });
      }

      /**
       * Sets a pre hook for a given method.
       * 
       * @param method the method to set the pre hook for.
       * @param handler the handler to be called.
       */
      static pre(method: string, handler: HookHandler<P>) {
        this.setHook(method, 'pre', handler);
      }

      /**
       * Sets a post hook for a given method.
       * 
       * @param method the method to set the post hook for.
       * @param handler the handler to be called.
       */
      static post(method: string, handler: HookHandler<P>) {
        this.setHook(method, 'post', handler);
      }

      /**
       * Checks is document is valid against schema.
       * 
       * @param doc the document to be validated.
       * @param schema the schema to validate against.
       * @param options the validation options to be applied.
       */
      static isValid(doc: P, schema?: ObjectSchema<P>, options?: ValidateOptions) {
        schema = (this.schema.props || object()) as ObjectSchema<P>;
        return schema.isValidSync(doc, options);
      }

      /**
       * Validates a document against schema.
       * 
       * @param doc the document to be validated.
       * @param schema the schema to validate against.
       * @param options the validation options to be applied.
       */
      static validate(doc: P, schema?: ObjectSchema<P>, options?: ValidateOptions) {
        schema = (this.schema.props || object()) as ObjectSchema<P>;
        return schema.validateSync(doc, options);
      }

      /**
       * Populates document with specified joins.
       * 
       * @param doc the document to populate joins for.
       * @param joins an array or IJoins object of joins.
       */
      static async populate<T extends P>(doc: P, joins: string[] | IJoins): Promise<T>;

      /**
       * Populates documents with specified joins.
       * 
       * @param docs the documents to populate joins for.
       * @param joins an array or IJoins object of joins.
       */
      static async populate<T extends P>(docs: P[], joins: string[] | IJoins): Promise<T[]>;

      /**
       * Populates document with specified joins.
       * 
       * @param doc the document to populate joins for.
       * @param key the join key property name.
       * @param join the join configuration object.
       */
      static async populate<T extends P>(doc: P, key: string, join: IJoin): Promise<T>;

      /**
       * Populates documents with specified join.
       * 
       * @param docs the document to populate joins for.
       * @param key the join key property name.
       * @param join the join configuration object.
       */
      static async populate<T extends P>(docs: P[], key: string, join: IJoin): Promise<T[]>;
      static async populate<T extends P>(doc: P | P[], key: any, join?: IJoin): Promise<T | T[]> {

        let joins: IJoins = key;
        const isArray = Array.isArray(doc);

        if (arguments.length === 3)
          joins = { [key]: join };

        if (Array.isArray(key)) {
          joins = key.reduce((a, c) => {
            const j = this.schema.joins[c];
            if (j) a[c] = j;
            return a;
          }, {});
        }

        const docs = (!isArray ? [doc] : doc) as T[];

        const result = await Promise.all(docs.map(async d => {

          for (const k in joins) {

            if (joins.hasOwnProperty(k)) {

              const conf = joins[k];
              const prop = d[k];
              const filterKey = conf.key || '_id';
              let values = !Array.isArray(prop) ? [prop] : prop;

              if (filterKey === '_id')
                values = this.toObjectID(values);

              const filter = { [filterKey]: { '$in': values } };

              const rel = await this.db
                .collection(conf.collection)
                .find<T>(filter, conf.options)
                .toArray();

              d[k] = rel[0];

              if (Array.isArray(prop))
                d[k] = rel;

            }

          }

          return d;

        }));

        if (!isArray)
          return result[0];

        return result;

      }

      /**
       * Cascades delete with specified joins.
       * 
       * @param doc the document to populate joins for.
       * @param joins an array or IJoins object of joins.
       */
      static async cascade(doc: P, joins: string[] | IJoins): Promise<ICascadeResult<P>>;

      /**
       * Cascades deletes with specified joins.
       * 
       * @param docs the documents to populate joins for.
       * @param joins an array or IJoins object of joins.
       */
      static async cascade(doc: P[], joins: string[] | IJoins): Promise<ICascadeResult<P>[]>;

      /**
       * Cascades delete with specified join.
       * 
       * @param doc the document to populate joins for.
       * @param key the join key property name.
       * @param join the join configuration object.
       */
      static async cascade(doc: P, key: string, join: IJoin): Promise<ICascadeResult<P>>;

      /**
       * Cascades deletes with specified join.
       * 
       * @param docs the document to populate joins for.
       * @param key the join key property name.
       * @param join the join configuration object.
       */
      static async cascade(doc: P[], key: string, join: IJoin): Promise<ICascadeResult<P>[]>;
      static async cascade(doc: P | P[], key: any, join?: IJoin): Promise<ICascadeResult<P> | ICascadeResult<P>[]> {

        let joins: IJoins = key;
        const isArray = Array.isArray(doc);

        if (arguments.length === 3)
          joins = { [key]: join };

        if (Array.isArray(key)) {
          joins = key.reduce((a, c) => {
            const j = this.schema.joins[c];
            if (j) a[c] = j;
            return a;
          }, {});
        }

        const docs = (!isArray ? [doc] : doc) as P[];

        const session = this.client.startSession();
        session.startTransaction();

        try {

          const result = await Promise.all(docs.map(async d => {

            let optKey: string;
            const ops: DeleteWriteOpResultObject[] = [];

            for (const k in joins) {

              if (joins.hasOwnProperty(k)) {

                optKey = k;

                const conf = joins[k];
                const prop = d[k];
                const filterKey = conf.key || '_id';
                let values = !Array.isArray(prop) ? [prop] : prop;

                if (filterKey === '_id')
                  values = this.toObjectID(values);

                const filter = { [filterKey]: { '$in': values } };

                const op = await this.db
                  .collection(conf.collection)
                  .deleteMany(filter, conf.options);

                ops.push(op);

              }

            }

            return { doc: d, ops: { [optKey]: ops } };

          }));

          await session.commitTransaction();
          session.endSession();

          if (!isArray)
            return result[0];

          return result;

        }
        catch (err) {

          await session.abortTransaction();
          session.endSession();

          throw err;

        }

      }

      /**
       * Finds a collection of documents by query.
       * 
       * @param filter the Mongodb filter query.
       * @param options Mongodb find options.
       */
      static async find<T extends P = P>(filter?: FilterQuery<P>, options?: IFindOneOptions): Promise<T[]> {

        const hooks = this.getHooks('find');
        filter = filter || {};
        options = options || {};

        filter = this.normalizeFilter(filter);

        if (hooks.pre)
          await hooks.pre({ filter, options });

        const data = await this.collection.find<T>(filter, options).toArray();

        if (!options.populate)
          return data;

        if (typeof options.populate === 'string')
          options.populate = [options.populate];

        return this.populate(data, options.populate);

      }

      /**
       * Finds one document by query.
       * 
       * @param filter the Mongodb filter query.
       * @param options Mongodb find options.
       */
      static async findOne<T extends P = P>(filter: FilterQuery<P>, options?: IFindOneOptions): Promise<T> {

        const hooks = this.getHooks('findOne');
        options = options || {};

        filter = this.normalizeFilter(filter);

        if (hooks.pre)
          await hooks.pre({ filter, options });

        const data = await this.collection.findOne<T>(filter, options);

        if (!options.populate)
          return data;

        if (typeof options.populate === 'string')
          options.populate = [options.populate];

        return this.populate(data, options.populate);

      }

      /**
       * Finds one document by id.
       * 
       * @param filter the Mongodb filter query.
       * @param options Mongodb find options.
       */
      static async findById<T extends P = P>(id: LikeObjectID, options?: IFindOneOptions): Promise<T> {

        const hooks = this.getHooks('findById');
        options = options || {};

        const filter = { _id: this.toObjectID(id) };

        if (hooks.pre)
          await hooks.pre({ filter, options });

        const data = await this.collection.findOne<T>(filter, options);

        if (!options.populate)
          return data;

        if (typeof options.populate === 'string')
          options.populate = [options.populate];

        return this.populate(data, options.populate);

      }

      /**
       * Creates document in database.
       * 
       * @param doc the document to be persisted to database.
       * @param options Mongodb insert one options.
       */
      static async create<T extends P = P>(doc: P, options?: CollectionInsertOneOptions): Promise<IInsertOneWriteOpResult<T>>;

      /**
       * Creates multiple documents in database.
       * 
       * @param docs the documents to be persisted to database.
       * @param options Mongodb insert many options.
       */
      static async create<T extends P = P>(docs: P[], options?: CollectionInsertManyOptions): Promise<IInsertWriteOpResult<T>>;
      static async create<T extends P = P>(doc: P | P[], options?: CollectionInsertOneOptions | CollectionInsertManyOptions): Promise<IInsertWriteOpResult<T> | IInsertOneWriteOpResult<T>> {

        const hooks = this.getHooks('create');

        if (hooks.pre)
          await hooks.pre({ doc, options });

        const date = Date.now();

        if (Array.isArray(doc)) {
          doc.reduce((a, c) => {
            c.created = c.created || date;
            c.modified = c.modified || date;
            a.push(c);
            return a;
          }, []);
          return this.collection.insertMany(doc, options) as Promise<IInsertWriteOpResult<T>>;
        }

        else {
          doc.created = doc.created || date;
          doc.modified = date;
          return this.collection.insertOne(doc, options) as Promise<IInsertOneWriteOpResult<T>>
        }

      }

      /**
       * Updates multiple documents by query.
       * 
       * @param filter the Mongodb filter for finding the desired documents to update.
       * @param update the update query to be applied.
       * @param options Mongodb update options.
       */
      static async update(filter: FilterQuery<P>, update: UpdateQuery<P> | P, options?: UpdateManyOptions) {

        const hooks = this.getHooks('update');

        filter = this.normalizeFilter(filter);

        update = !(update as any).$set ? update = { $set: update } : update as UpdateQuery<P>;

        const date = Date.now();

        update.$set.modified = update.$set.modified || date;

        if (hooks.pre)
          await hooks.pre({ filter, update, options });

        return this.collection.updateMany(filter, update, options);

      }

      /**
       * Updates one document by query.
       * 
       * @param filter the Mongodb filter for finding the desired documents to update.
       * @param update the update query to be applied.
       * @param options Mongodb update options.
       */
      static async updateOne(filter: FilterQuery<P>, update: UpdateQuery<P> | P, options?: UpdateOneOptions) {

        const hooks = this.getHooks('updateOne');

        filter = this.normalizeFilter(filter);

        update = !(update as any).$set ? update = { $set: update } : update as UpdateQuery<P>;

        const date = Date.now();

        update.$set.modified = update.$set.modified || date;

        if (hooks.pre)
          await hooks.pre({ filter, update, options });

        return this.collection.updateOne(filter, update, options);

      }

      /**
       * Updates one document by id.
       * 
       * @param filter the Mongodb filter for finding the desired documents to update.
       * @param update the update query to be applied.
       * @param options Mongodb update options.
       */
      static async updateById(id: LikeObjectID, update: UpdateQuery<P> | P, options?: UpdateOneOptions) {

        const hooks = this.getHooks('updateById');

        const filter = { _id: this.toObjectID(id) };

        update = !(update as any).$set ? update = { $set: update } : update as UpdateQuery<P>;

        const date = Date.now();

        update.$set.modified = update.$set.modified || date;

        if (hooks.pre)
          await hooks.pre({ filter, update, options });

        return this.collection.updateOne(filter, update, options);

      }

      /**
       * Deletes multiple documents by query.
       * 
       * @param filter the Mongodb filter for finding the desired documents to update.
       * @param options Mongodb update options.
       */
      static async delete(filter: FilterQuery<P>, options?: CommonOptions) {

        const hooks = this.getHooks('delete');

        filter = this.normalizeFilter(filter);

        if (hooks.pre)
          await hooks.pre({ filter, options });

        return this.collection.deleteMany(filter, options);

      }


      /**
       * Deletes one document by query.
       * 
       * @param filter the Mongodb filter for finding the desired documents to update.
       * @param options Mongodb update options.
       */
      static async deleteOne(filter: FilterQuery<P>, options?: CommonOptions) {

        const hooks = this.getHooks('deleteOne');

        filter = this.normalizeFilter(filter);

        if (hooks.pre)
          await hooks.pre({ filter, options });

        return this.collection.deleteOne(filter, options);

      }

      /**
       * Deletes one document by id.
       * 
       * @param filter the Mongodb filter for finding the desired documents to update.
       * @param options Mongodb update options.
       */
      static async deleteById(id: LikeObjectID, options?: CommonOptions) {

        const hooks = this.getHooks('deleteById');

        const filter = { _id: this.toObjectID(id) };

        if (hooks.pre)
          await hooks.pre({ filter, options });

        return this.collection.deleteOne(filter, options);

      }

      // CLASS PROPERTIES //

      created: number;
      modified: number;
      deleted: number;

      // CONSTRUCTOR //
      // May need to change this fine for now.
      constructor(props?: S) {
        if (props)
          Object.getOwnPropertyNames(props).forEach(k => this[k] = props[k]);
      }

      // CLASS GETTERS & SETTERS //

      get id(): LikeObjectID {
        return _id;
      }

      set id(id: LikeObjectID) {
        _id = id;
      }

      // CLASS METHODS //

      /**
       * Saves changes persisting instance in database.
       * 
       * @param options MongoDB update options.
       */
      async save(options?: UpdateOneOptions) {

        options = options || {};
        options.upsert = false;

        this.modified = Date.now();

        const doc = getDoc<P>(this);

        Klass.validate(doc);

        return new Promise<UpdateWriteOpResult>((resolve, reject) => {

          if (!this.id)
            return reject(new ValidationError([`Cannot save to collection "${name}" with
          missing id, did you mean ".create()"?`], doc, 'id'));

          resolve(Klass.updateById(Klass.toObjectID(this.id), doc, options));

        });

      }

      /**
       * Creates and persists instance to database.
       * 
       * @param options Mongodb create options.
       */
      async create(options?: CollectionInsertOneOptions) {

        const date = Date.now();
        this.created = date;
        this.modified = date;

        let doc = getDoc<P>(this);

        Klass.validate(doc);

        return new Promise<InsertOneWriteOpResult>(async (resolve, reject) => {

          if (this.id)
            return reject(new ValidationError([`Cannot create for collection with existing 
            id "${name}", did you mean ".save()"?`], doc, 'id'));

          const result = await Klass.create(doc, options);

          doc = (result.ops && result.ops[0]) || {};

          Object.keys(doc).forEach(k => {
            if (k === '_id') {
              this.id = doc[k];
            }
            else if (typeof this[k] === 'undefined') {
              this[k] = doc[k];
            }
          });

          resolve(result);

        });

      }

      /**
       * Deletes document persisting in database.
       * 
       * @param options Mongodb delete options.
       */
      async delete(options?: CommonOptions) {
        return Klass.deleteById(Klass.toObjectID(this.id), options);
      }

      /**
       * Validates instance against schema.
       * 
       * @param schema optional schema to verify by or uses defined.
       */
      validate(schema?: ObjectSchema<P>) {
        return Klass.validate(getDoc<P>(this), schema);
      }

      /**
       * Checks if instance is valid against schema.
       * 
       * @param schema optional schema to verify by or uses defined.
       */
      isValid(schema?: ObjectSchema<P>) {
        return Klass.isValid(getDoc<P>(this), schema);
      }

    }

    return Model;

  }

  /**
   * Accepts a schema and creates model with static and instance convenience methods.
   * 
   * @param name the name of the schema.
   * @param schema the schema configuration containing document validation.
   * @param collectionName specify the collection name otherwise schema name is used.
   */
  model<S extends object>(name: string, schema?: ISchema<Partial<S>>, collectionName?: string) {

    const _schema = this.schemas[name];

    // Return the existing schema/model by name.
    if (!schema) {
      if (!_schema)
        throw new Error(`Failed to lookup schema ${name}`);
      const Model = this.createModel<S>(name, _schema);
      return Model as typeof Model & IConstructor<S>;
    }

    // Schema already exists.
    if (_schema)
      throw new Error(`Duplicate schema ${name} detected, schema names must be unique`);

    // Default collection name to schema name.
    schema = schema || {};
    schema.collectionName = collectionName || schema.collectionName || name;

    const Model = this.createModel<S>(name, schema);
    return Model as typeof Model & IConstructor<S>;

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
