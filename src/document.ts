
import {
  FilterQuery, UpdateQuery, ObjectId, DeleteWriteOpResultObject,
  CollectionInsertOneOptions, CollectionInsertManyOptions, UpdateManyOptions, UpdateOneOptions,
  CommonOptions, Db, MongoClient, FindOneAndUpdateOption, FindOneAndDeleteOption,
  FindOneAndReplaceOption, MongoCallback, FindAndModifyWriteOpResultObject, InsertOneWriteOpResult,
  InsertWriteOpResult, UpdateWriteOpResult, MongoError
} from 'mongodb';
import {
  ISchema, LikeObjectId, IJoins, IJoin, ICascadeResult, IFindOneOptions,
  Constructor, IDoc, DocumentHook
} from './types';
import { me, isPromise } from './utils';
import { BaseModel as BaseModel } from './model';
import { Mustad } from 'mustad';
import { ObjectSchema, ValidateOptions, object } from 'yup';

export type HookType = 'find' | 'create' | 'update' | 'delete';

const hookMap = {
  find: ['_find'],
  create: ['_create'],
  update: ['_update', 'findUpdate', 'findReplace'],
  delete: ['_delete', 'findDelete']
};

const includeKeys = Object.keys(hookMap).reduce((a, c) => {
  return [...a, ...hookMap[c]];
}, []);

export function initDocument<S extends IDoc, M extends BaseModel<S>>(
  config: ISchema<S> = {},
  client?: MongoClient,
  db?: Db,
  Model?: Constructor<M>) {

  let mustad: Mustad<typeof Wrapper>;

  const Wrapper = class Document {

    static client: MongoClient = client;
    static db: Db = db;
    static collectionName: string = config.collectionName;
    static schema: ISchema<S> = config;

    static get collection() {
      return this.db.collection<S>(this.collectionName);
    }

    /////////////
    // HELPERS //
    /////////////

    /**
     * Convert value to ObjectID.
     * 
     * @param id the Like id value to convert to Mongodb ObjectID.
     */
    static toObjectID(id: LikeObjectId): ObjectId;

    /**
     * Convert values to ObjectIDs.
     * 
     * @param ids array of values to convert to Mongodb ObjectID.
     */
    static toObjectID(ids: LikeObjectId[]): ObjectId[];
    static toObjectID(ids: LikeObjectId | LikeObjectId[]): ObjectId | ObjectId[] {

      const isArray = Array.isArray(ids);

      if (!isArray)
        ids = [ids] as any;

      const result = (ids as any).map(id => {
        if (typeof id === 'string' || typeof id === 'number')
          return new ObjectId(id);
        return id;
      }) as ObjectId[];

      if (isArray)
        return result;

      return result[0];

    }

    /**
     * Normalizes query.
     * 
     * @param query the Mongodb filter query.
     */
    static toQuery(query: LikeObjectId | FilterQuery<S>) {
      let _query: FilterQuery<S> = query as any;
      if (typeof query !== 'object')
        _query = { _id: query } as FilterQuery<S>;

      if (_query._id)
        _query._id = this.toObjectID(_query._id as LikeObjectId) as any;
      return _query;
    }

    /**
     * Normalizes update query so that $set is always present.
     * 
     * @param update the update query to be applied.
     */
    static toUpdate(update: UpdateQuery<Partial<S>> | Partial<S>): UpdateQuery<Partial<S>> {
      const hasSpecial = Object.keys(update).reduce((a, c) => {
        if (a === true)
          return a;
        a = c.charAt(0) === '$';
        return a;
      }, false);
      if (hasSpecial)
        (update as any).$set = (update as any).$set || {};
      else
        update = { $set: update };
      return update as any;
    }

    /**
     * Converts to simple object document.
     * 
     * @param doc the document context to convert.
     */
    static toDoc(doc: any) {
      return Object.getOwnPropertyNames(doc)
        .reduce((a, c) => {
          a[c] = doc[c];
          return a;
        }, {} as Partial<S>);
    }

    /**
     * Checks is document is valid against schema.
     * 
     * @param doc the document to be validated.
     * @param schema the schema to validate against.
     * @param options the validation options to be applied.
     */
    static isValid(doc: S, schema?: ObjectSchema<S>, options?: ValidateOptions) {
      schema = (this.schema.props || object()) as ObjectSchema<S>;
      return schema.isValidSync(doc, options);
    }

    /**
     * Validates a document against schema.
     * 
     * @param doc the document to be validated.
     * @param schema the schema to validate against.
     * @param options the validation options to be applied.
     */
    static validate(doc: S, schema?: ObjectSchema<S>, options?: ValidateOptions) {
      schema = (this.schema.props || object()) as ObjectSchema<S>;
      return schema.validateSync(doc, options);
    }

    ////////////////////////
    // POPULATE & CASCADE //
    ////////////////////////

    /**
     * Populates document with specified joins.
     * 
     * @param doc the document to populate joins for.
     * @param join the join config, configs or array of join names.
     */
    static async populate(doc: S, join: string | string[] | IJoins): Promise<S>;

    /**
     * Populates documents with specified join.
     * 
     * @param docs the document to populate joins for.
     * @param join the join config, configs or array of join names.
     */
    static async populate(docs: S[], join: string | string[] | IJoins): Promise<S[]>;

    static async populate(docs: S | S[], join?: string | string[] | IJoins): Promise<S | S[]> {

      let joins: IJoins = join as any;

      const isArray = Array.isArray(docs);

      if (typeof join === 'string')
        join = [join];

      // Iterate array and get join configs.
      if (Array.isArray(join)) {
        if (typeof join[0] === 'string') {
          joins = join.reduce((a, c) => {
            const j = this.schema.joins[c];
            if (j) a[c] = j;
            return a;
          }, {});
        }
      }

      const _docs = (!isArray ? [docs] : docs) as S[];

      const { err, data } = await me(Promise.all(_docs.map(async doc => {

        for (const k in joins) {

          if (!joins.hasOwnProperty(k)) continue;

          const conf = joins[k];
          const prop = doc[k];
          const key = conf.key || '_id';

          let values = !Array.isArray(prop) ? [prop] : prop;

          if (key === '_id')
            values = this.toObjectID(values);

          const filter = { [key]: { '$in': values } } as FilterQuery<S>;

          const { err: pErr, data: pData } = await me(this.db
            .collection<S>(conf.collection)
            .find(filter, conf.options)
            .toArray());

          if (pErr)
            return Promise.reject(pErr);

          doc[k] = pData[0];

          if (Array.isArray(prop))
            doc[k] = pData;

        }

        return doc;

      })));

      if (err)
        return Promise.reject(err);

      if (!isArray)
        return Promise.resolve(data[0]);

      return Promise.resolve(data);

    }

    /**
     * Cascades delete with specified joins.
     * 
     * @param doc the document to populate joins for.
     * @param joins an array or IJoins object of joins.
     */
    static async cascade(doc: S, joins: string[] | IJoins): Promise<ICascadeResult<S>>;

    /**
     * Cascades deletes with specified joins.
     * 
     * @param docs the documents to populate joins for.
     * @param joins an array or IJoins object of joins.
     */
    static async cascade(doc: S[], joins: string[] | IJoins): Promise<ICascadeResult<S>[]>;

    /**
     * Cascades delete with specified join.
     * 
     * @param doc the document to populate joins for.
     * @param key the join key property name.
     * @param join the join configuration object.
     */
    static async cascade(doc: S, key: string, join: IJoin): Promise<ICascadeResult<S>>;

    /**
     * Cascades deletes with specified join.
     * 
     * @param docs the document to populate joins for.
     * @param key the join key property name.
     * @param join the join configuration object.
     */
    static async cascade(doc: S[], key: string, join: IJoin): Promise<ICascadeResult<S>[]>;
    static async cascade(doc: S | S[], key: any, join?: IJoin): Promise<ICascadeResult<S> | ICascadeResult<S>[]> {

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

      const docs = (!isArray ? [doc] : doc) as S[];

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

    //////////////////
    // CRUD METHODS //
    //////////////////

    /**
     * Internal method to handle all responses.
     * 
     * @param promise a promise to be handled.
     * @param cb an optional callback to be called with error or data.
     */
    static async _handleResponse<T, E>(
      promise: T | Promise<T>,
      cb?: (err: E, data: T) => void): Promise<T> {
      const prom = (!isPromise(promise) ? Promise.resolve(promise) : promise) as Promise<T>;
      return prom.then(res => {
        if (cb)
          cb(null, res);
        return res;
      })
        .catch(err => {
          if (cb)
            cb(err, null);
          return err;
        });
    }

    /**
     * Common handler finds a document or collection of documents by query.
     * 
     * @param query the Mongodb filter query.
     * @param options Mongodb find options.
     * @param isMany when true find many.
     * @param cb optional callback instead of promise.
     */
    static async _find(
      query?: FilterQuery<S>,
      options?: IFindOneOptions,
      isMany: boolean = false) {

      query = this.toQuery(query || {});
      options = options || {};

      let result: { err?: Error, data?: S | S[] };

      if (isMany)
        result = await me(this.collection.find(query, options).toArray());
      else
        result = await me(this.collection.findOne(query, options));

      if (result.err)
        return Promise.reject(result.err);

      if (!options.populate) {
        if (isMany)
          return result.data as S[];
        return result.data as S;
      }

      if (isMany)
        return this.populate(result.data as S[], options.populate);
      return this.populate(result.data as S, options.populate);

    }

    /**
     * Common handler to create single or multiple documents in database.
     * 
     * @param docs the documents to be persisted to database.
     * @param options Mongodb insert many options.
     */
    static _create(
      doc: S | S[],
      options: CollectionInsertOneOptions | CollectionInsertManyOptions = {}) {

      if (Array.isArray(doc)) {
        doc.reduce((a, c) => {
          a.push(c);
          return a;
        }, []);
        return this.collection.insertMany(doc as any, options);
      }

      else {
        return this.collection.insertOne(doc as any, options);
      }

    }

    /**
     * Common update handler to update single or multiple documents by query.
     * 
     * @param query the Mongodb filter for finding the desired documents to update.
     * @param update the update query to be applied.
     * @param options Mongodb update options.
     * @param isMany when true update many.
     */
    static _update(
      query: FilterQuery<S>,
      update: UpdateQuery<Partial<S>> | Partial<S>,
      options?: UpdateOneOptions | UpdateManyOptions,
      isMany: boolean = false) {
      if (isMany)
        return this.collection.updateMany(query, update as any, options);
      return this.collection.updateOne(query, update as any, options);
    }

    /**
     * Common delete hander to delete multiple or single documents by query.
     * 
     * @param query the Mongodb filter for finding the desired documents to update.
     * @param options Mongodb update options.
     * @param isMany when true uses collection.deleteMany().
     */
    static _delete(
      query: FilterQuery<S>,
      options?: CommonOptions & { bypassDocumentValidation?: boolean },
      isMany: boolean = false) {
      if (isMany)
        return this.collection.deleteMany(query, options);
      return this.collection.deleteOne(query, options);
    }

    /**
     * Finds a collection of documents by query.
     * 
     * @param query the Mongodb filter query.
     * @param options Mongodb find options.
     */
    static find(query?: FilterQuery<S>, options?: IFindOneOptions) {
      return this._find(query, options, true) as Promise<S[]>;
    }

    /**
     * Finds one document by query.
     * 
     * @param id the id of the document to find.
     * @param options Mongodb find options.
     * @param cb an optional callback instead of using promise.
     */
    static findOne(
      id: LikeObjectId,
      options: IFindOneOptions,
      cb?: MongoCallback<S | null>): Promise<S>;

    /**
     * Finds one document by query.
     * 
     * @param id the id of the document to find.
     * @param cb an optional callback instead of using promise.
     */
    static findOne(
      id: LikeObjectId,
      cb?: MongoCallback<S | null>,
    ): Promise<S>;

    /**
     * Finds one document by query.
     * 
     * @param query the Mongodb filter query.
     * @param options Mongodb find options.
     * @param cb an optional callback instead of using promise.
     */
    static findOne(
      query: FilterQuery<S>,
      options: IFindOneOptions,
      cb?: MongoCallback<S | null>): Promise<S>;

    /**
     * Finds one document by query.
     * 
     * @param query the Mongodb filter query.
     * @param cb an optional callback instead of using promise.
     */
    static findOne(
      query: FilterQuery<S>,
      cb?: MongoCallback<S | null>,
    ): Promise<S>;

    static findOne(
      query: LikeObjectId | FilterQuery<S>,
      options?: IFindOneOptions | MongoCallback<S | null>,
      cb?: MongoCallback<S | null>) {
      if (typeof options === 'function') {
        cb = options;
        options = undefined;
      }
      const _query = this.toQuery(query);
      return this._handleResponse(this._find(_query, options as IFindOneOptions, false) as Promise<S>, cb);
    }

    /**
     * Finds one document by query then converts to Model.
     * 
     * @param id the id of the document to find.
     * @param FindModel the model to convert result to.
     * @param options optional find one options.
     * @param cb an optional callback instead of using promise.
     */
    static async findModel<L extends BaseModel<S>>(
      id: LikeObjectId,
      FindModel: Constructor<L>,
      options: IFindOneOptions,
      cb?: MongoCallback<L | null>): Promise<L>;

    /**
     * Finds one document by query then converts to Model.
     * 
     * @param query the query for finding the document.
     * @param FindModel the model to convert result to.
     * @param options optional find one options.
     * @param cb an optional callback instead of using promise.
     */
    static async findModel<L extends BaseModel<S>>(
      query: FilterQuery<S>,
      FindModel: Constructor<L>,
      options: IFindOneOptions,
      cb?: MongoCallback<L | null>): Promise<L>;

    /**
     * Finds one document by query then converts to Model.
     * 
     * @param id the id of the document to find.
     * @param FindModel the model to convert result to.
     * @param cb an optional callback instead of using promise.
     */
    static async findModel<L extends BaseModel<S>>(
      id: LikeObjectId,
      FindModel: Constructor<L>,
      cb?: MongoCallback<L | null>): Promise<L>;

    /**
     * Finds one document by query then converts to Model.
     * 
     * @param query the query for finding the document.
     * @param FindModel the model to convert result to.
     * @param cb an optional callback instead of using promise.
     */
    static async findModel<L extends BaseModel<S>>(
      query: FilterQuery<S>,
      FindModel: Constructor<L>,
      cb?: MongoCallback<L | null>): Promise<L>;

    static async findModel<L extends BaseModel<S>>(
      query: LikeObjectId | FilterQuery<S>,
      FindModel: Constructor<L>,
      options?: IFindOneOptions | MongoCallback<L | null>,
      cb?: MongoCallback<L | null>) {

      if (typeof options === 'function') {
        cb = options as any;
        options = undefined;
      }

      const _query = this.toQuery(query);
      const { err, data } = await me(this._find(_query, options as IFindOneOptions, false));

      if (err)
        return Promise.reject(err);

      return this._handleResponse(new FindModel(data), cb);

    }

    /**
     * Finds a document and then updates.
     * 
     * @param query the filter for finding the document.
     * @param update the update to be applied.
     * @param options the update options.
     * @param cb optional callback to use instead of Promise.
     */
    static findUpdate(
      query: LikeObjectId | FilterQuery<S>,
      update: UpdateQuery<Partial<S>> | Partial<S>,
      options?: FindOneAndUpdateOption,
      cb?: MongoCallback<FindAndModifyWriteOpResultObject<S>>) {
      const _query = this.toQuery(query);
      const _update = this.toUpdate(update);
      return this._handleResponse(this.collection.findOneAndUpdate(_query, _update, options), cb);
    }

    /**
     * Finds a document and then deletes.
     * 
     * @param query the filter for finding the document.
     * @param options the update options.
     * @param cb optional callback to use instead of Promise.
     */
    static findDelete(
      query: LikeObjectId | FilterQuery<S>,
      options?: FindOneAndDeleteOption,
      cb?: MongoCallback<FindAndModifyWriteOpResultObject<S>>) {
      const _query = this.toQuery(query);
      return this._handleResponse(this.collection.findOneAndDelete(_query, options), cb);
    }

    /**
     * Finds a document and then replaces it.
     * 
     * @param query the filter for finding the document.
     * @param doc the doc used to replace existing.
     * @param options the update options.
     * @param cb optional callback to use instead of Promise.
     */
    static findReplace(
      query: LikeObjectId | FilterQuery<S>,
      doc: S,
      options?: FindOneAndReplaceOption,
      cb?: MongoCallback<FindAndModifyWriteOpResultObject<S>>) {
      const _query = this.toQuery(query);
      return this._handleResponse(this.collection.findOneAndReplace(_query, doc, options), cb);
    }

    /**
     * Creates multiple documents in database.
     * 
     * @param docs the documents to be persisted to database.
     * @param options Mongodb insert many options.
     * @param cb optional callback to use instead of promise.
     */
    static create(
      docs: S[],
      options: CollectionInsertManyOptions,
      cb?: MongoCallback<InsertWriteOpResult<S>>): Promise<InsertWriteOpResult<S>>;

    /**
     * Creates multiple documents in database.
     * 
     * @param docs the documents to be persisted to database.
     * @param cb optional callback to use instead of promise.
     */
    static create(
      docs: S[],
      cb?: MongoCallback<InsertWriteOpResult<S>>): Promise<InsertWriteOpResult<S>>;

    static create(
      docs: S[],
      options?: CollectionInsertManyOptions | MongoCallback<InsertWriteOpResult<S>>,
      cb?: MongoCallback<InsertWriteOpResult<S>>) {
      if (typeof options === 'function') {
        cb = options;
        options = undefined;
      }
      const creator = this._create(docs, options as CollectionInsertManyOptions) as any;
      return this._handleResponse(creator as Promise<InsertWriteOpResult<S>>, cb);
    }

    /**
     * Creates document in database.
     * 
     * @param doc the document to be persisted to database.
     * @param options Mongodb insert one options.
     * @param cb optional callback to use instead of promise.
     */
    static createOne(
      doc: S,
      options: CollectionInsertOneOptions,
      cb?: MongoCallback<InsertOneWriteOpResult<S>>): Promise<InsertOneWriteOpResult<S>>;

    /**
     * Creates document in database.
     * 
     * @param doc the document to be persisted to database.
     * @param cb optional callback to use instead of promise.
     */
    static createOne(
      doc: S,
      cb?: MongoCallback<InsertOneWriteOpResult<S>>): Promise<InsertOneWriteOpResult<S>>;

    static createOne(
      doc: S,
      options?: CollectionInsertOneOptions | MongoCallback<InsertOneWriteOpResult<S>>,
      cb?: MongoCallback<InsertOneWriteOpResult<S>>) {
      if (typeof options === 'function') {
        cb = options;
        options = undefined;
      }
      const creator = this._create(doc, options as CollectionInsertOneOptions) as any;
      return this._handleResponse(creator as Promise<InsertOneWriteOpResult<S>>, cb);
    }

    /**
     * Updates multiple documents by query.
     * 
     * @param query the Mongodb filter for finding the desired documents to update.
     * @param update the update query to be applied.
     * @param options Mongodb update options.
     * @param cb optional callback to use instead of promise.
     */
    static update(
      query: FilterQuery<S>,
      update: UpdateQuery<Partial<S>> | Partial<S>,
      options: UpdateManyOptions,
      cb?: MongoCallback<UpdateWriteOpResult>): Promise<UpdateWriteOpResult>;

    /**
     * Updates multiple documents by query.
     * 
     * @param query the Mongodb filter for finding the desired documents to update.
     * @param update the update query to be applied.
     * @param cb optional callback to use instead of promise.
     */
    static update(
      query: FilterQuery<S>,
      update: UpdateQuery<Partial<S>> | Partial<S>,
      cb?: MongoCallback<UpdateWriteOpResult>): Promise<UpdateWriteOpResult>;

    static update(
      query: FilterQuery<S>,
      update: UpdateQuery<Partial<S>> | Partial<S>,
      options?: UpdateManyOptions | MongoCallback<UpdateWriteOpResult>,
      cb?: MongoCallback<UpdateWriteOpResult>) {

      if (typeof options === 'function') {
        cb = options;
        options = undefined;
      }

      query = this.toQuery(query);
      update = this.toUpdate(update);

      return this._handleResponse(this._update(query, update as any, options as UpdateManyOptions, true), cb);

    }

    /**
     * Updates one document by id.
     * 
     * @param id the id of the document to update by.
     * @param update the update query to be applied.
     * @param options Mongodb update options.
     * @param cb optional callback to use instead of promise.
     */
    static updateOne(
      id: LikeObjectId,
      update: UpdateQuery<Partial<S>> | Partial<S>,
      options: UpdateOneOptions,
      cb?: MongoCallback<UpdateWriteOpResult>): Promise<UpdateWriteOpResult>;

    /**
     * Updates one document by id.
     * 
     * @param id the id of the document to update by.
     * @param update the update query to be applied.
     * @param cb optional callback to use instead of promise.
     */
    static updateOne(
      id: LikeObjectId,
      update: UpdateQuery<Partial<S>> | Partial<S>,
      cb?: MongoCallback<UpdateWriteOpResult>): Promise<UpdateWriteOpResult>;

    /**
     * Updates one document by query.
     * 
     * @param query the Mongodb filter for finding the desired documents to update.
     * @param update the update query to be applied.
     * @param options Mongodb update options.
     * @param cb optional callback to use instead of promise.
     */
    static updateOne(
      query: FilterQuery<S>,
      update: UpdateQuery<Partial<S>> | Partial<S>,
      options: UpdateOneOptions,
      cb?: MongoCallback<UpdateWriteOpResult>): Promise<UpdateWriteOpResult>;

    /**
     * Updates one document by query.
     * 
     * @param query the Mongodb filter for finding the desired documents to update.
     * @param update the update query to be applied.
     * @param cb optional callback to use instead of promise.
     */
    static updateOne(
      query: FilterQuery<S>,
      update: UpdateQuery<Partial<S>> | Partial<S>,
      cb?: MongoCallback<UpdateWriteOpResult>): Promise<UpdateWriteOpResult>;

    static updateOne(
      query: LikeObjectId | FilterQuery<S>,
      update: UpdateQuery<Partial<S>> | Partial<S>,
      options?: UpdateOneOptions | MongoCallback<UpdateWriteOpResult>,
      cb?: MongoCallback<UpdateWriteOpResult>) {

      if (typeof options === 'function') {
        cb = options;
        options = undefined;
      }

      const _query = this.toQuery(query);
      update = this.toUpdate(update);

      return this._handleResponse(this._update(_query, update as any, options as UpdateOneOptions, false), cb);

    }

    /**
     * Deletes multiple documents by query.
     * 
     * @param query the Mongodb filter for finding the desired documents to delete.
     * @param options Mongodb delete options.
     * @param cb optional callback to use instead of promise.
     */
    static delete(
      query: FilterQuery<S>,
      options: CommonOptions,
      cb?: MongoCallback<DeleteWriteOpResultObject>): Promise<DeleteWriteOpResultObject>;

    /**
     * Deletes multiple documents by query.
     * 
     * @param query the Mongodb filter for finding the desired documents to delete.
     * @param cb optional callback to use instead of promise.
     */
    static delete(
      query: FilterQuery<S>,
      cb?: MongoCallback<DeleteWriteOpResultObject>): Promise<DeleteWriteOpResultObject>;

    static delete(
      filter: FilterQuery<S>,
      options?: CommonOptions | MongoCallback<DeleteWriteOpResultObject>,
      cb?: MongoCallback<DeleteWriteOpResultObject>) {

      if (typeof options === 'function') {
        cb = options;
        options = undefined;
      }

      filter = this.toQuery(filter);
      return this._handleResponse(this._delete(filter, options as CommonOptions, true), cb);
    }

    /**
     * Deletes one document by id.
     * 
     * @param id the id of the document to be deleted.
     * @param options Mongodb delete options.
     * @param cb optional callback to use instead of promise.
     */
    static deleteOne(
      id: LikeObjectId,
      options: CommonOptions & { bypassDocumentValidation?: boolean },
      cb?: MongoCallback<DeleteWriteOpResultObject>): Promise<DeleteWriteOpResultObject>;

    /**
     * Deletes one document by id.
     * 
     * @param id the id of the document to be deleted.
     * @param cb optional callback to use instead of promise.
     */
    static deleteOne(
      id: LikeObjectId,
      cb?: MongoCallback<DeleteWriteOpResultObject>): Promise<DeleteWriteOpResultObject>;

    /**
     * Deletes one document by query.
     * 
     * @param query the Mongodb filter for finding the desired documents to delete.
     * @param options Mongodb delete options.
     * @param cb optional callback to use instead of promise.
     */
    static deleteOne(
      query: FilterQuery<S>,
      options?: CommonOptions & { bypassDocumentValidation?: boolean },
      cb?: MongoCallback<DeleteWriteOpResultObject>): Promise<DeleteWriteOpResultObject>;

    /**
     * Deletes one document by query.
     * 
     * @param query the Mongodb filter for finding the desired documents to delete.
     * @param cb optional callback to use instead of promise.
     */
    static deleteOne(
      query: FilterQuery<S>,
      cb?: MongoCallback<DeleteWriteOpResultObject>): Promise<DeleteWriteOpResultObject>;

    static deleteOne(
      query: LikeObjectId | FilterQuery<S>,
      options?: CommonOptions & { bypassDocumentValidation?: boolean } | MongoCallback<DeleteWriteOpResultObject>,
      cb?: MongoCallback<DeleteWriteOpResultObject>) {

      if (typeof options === 'function') {
        cb = options;
        options = undefined;
      }
      const _query = this.toQuery(query);
      return this._handleResponse(
        this._delete(_query, options as CommonOptions & { bypassDocumentValidation?: boolean }, false), cb);
    }

    static pre<A1 = any, A2 = any, A3 = any>(type: HookType, handler: DocumentHook<A1, A2, A3>) {
      const methods = hookMap[type];
      if (!methods)
        throw new Error(`Cannot create hook for "${type}" using methods of undefined.`);
      // Bind each handler.
      mustad.pre(methods, handler);
      return this;
    }

    static post<A1 = any, A2 = any, A3 = any>(type: HookType, handler: DocumentHook<A1, A2, A3>) {
      const methods = hookMap[type];
      if (!methods)
        throw new Error(`Cannot create hook for "${type}" using methods of undefined.`);
      // Bind each handler.
      mustad.post(methods, handler);
      return this;
    }

    constructor(doc?: S) {
      if (!Document.db || !Document.client)
        throw new Error(`Failed to initialize model with "db" or "client" of undefined.`);
      return new Model(doc, Document);
    }

  };

  mustad = new Mustad(Wrapper, { include: includeKeys });

  return Wrapper;

}
