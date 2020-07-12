
import {
  FilterQuery, UpdateQuery, ObjectId, DeleteWriteOpResultObject,
  CollectionInsertOneOptions, CollectionInsertManyOptions, UpdateManyOptions, UpdateOneOptions,
  CommonOptions, Db, MongoClient, FindOneAndUpdateOption,
  MongoCallback, FindAndModifyWriteOpResultObject, InsertOneWriteOpResult,
  InsertWriteOpResult, UpdateWriteOpResult, ObjectID, OptionalId
} from 'mongodb';
import {
  ISchema, LikeObjectId, ICascadeResult, IFindOneOptions,
  Constructor, IDoc, DocumentHook, Joins, KeyOf, IFindOneAndDeleteOption
} from './types';
import { promise, isPromise } from './utils';
import { Model as BaseModel } from './model';
import { Mustad } from 'mustad';
import { KnectMongo } from './knect';

export type HookType = 'find' | 'create' | 'update' | 'delete';

const hookMap = {
  find: ['_find'],
  create: ['_create'],
  update: ['_update', 'findUpdate'],
  delete: ['_delete', 'findDelete']
};

const includeKeys = Object.keys(hookMap).reduce((a, c) => {
  return [...a, ...hookMap[c]];
}, []);

/**
 * Initializes a new Knect Document.
 * 
 * @param config the configuration with schema.
 * @param client the MongoClient instance.
 * @param db the Mongo database connection.
 * @param Model the BaseModel type for creating models.
 */
export function initDocument<S extends IDoc, M extends BaseModel<S>>(
  config?: ISchema<S>,
  client?: MongoClient,
  db?: Db,
  Model?: Constructor<M>,
  knect?: KnectMongo,
  ) {

  let mustad: Mustad<typeof Wrapper>;

  const Wrapper = class Document {

    static knect: KnectMongo = knect;
    static collectionName: string = config && config.collectionName;
    static schema: ISchema<S> = config;

    static get client() {
      return client || this.knect.client;
    }

    static get db() {
      return db || this.knect.db;
    }

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
      if (!hasSpecial)
        update = { $set: update } as UpdateQuery<S>;
      return update as UpdateQuery<S>;
    }

    /**
     * Converts Joins<S> to cascade keys.
     * 
     * @param joins object containing joins to build list from.
     * @param filter an array of keys to exclude.
     */
    static toCascades(joins: Joins<S>, ...filter: string[]): string[];

    /**
     * Converts Joins<S> to cascade keys.
     * 
     * @param filter an array of keys to exclude.
     */
    static toCascades(...filter: string[]): string[];

    static toCascades(joins: string | Joins<S>, ...filter: string[]) {

      if (typeof joins === 'string') {
        filter.unshift(joins as string);
        joins = undefined;
      }

      const _joins = joins || (this.schema.joins || {}) as Joins<S>;

      return Object.keys(_joins).reduce((a, c) => {
        if (!_joins[c].cascade || filter.includes(c))
          return a;
        return [...a, c];
      }, [] as string[]);

    }

    /**
     * Checks is document is valid against schema.
     * 
     * @param doc the document to be validated.
     */
    static isValid(doc: S) {
      this.knect.options.isValid(this.collectionName, doc);
    }

    /**
     * Validates a document against schema.
     * 
     * @param doc the document to be validated.
     */
    static validate(doc: S) {
      return this.knect.options.validate(this.collectionName, doc);
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
    static async populate(doc: S, join: string | string[] | Joins<S>): Promise<S>;

    /**
     * Populates documents with specified join.
     * 
     * @param docs the document to populate joins for.
     * @param join the join config, configs or array of join names.
     */
    static async populate(docs: S[], join: string | string[] | Joins<S>): Promise<S[]>;

    static async populate(docs: S | S[], join?: string | string[] | Joins<S>): Promise<S | S[]> {

      const isArray = Array.isArray(docs);

      let joins: Joins<S> = join as any;
      join = typeof join === 'string' ? [join] : join;
      join = join || Object.keys(this.schema.joins || {});

      // Hotpath nothing to do.
      if (!joins && !(join as string[]).length)
        return docs;

      // Iterate array and get join configs.
      if (Array.isArray(join)) {
        joins = join.reduce((a, c) => {
          const j = this.schema.joins[c];
          if (j) a[c] = j;
          return a;
        }, {} as Joins<S>);
      }

      const _docs = (!isArray ? [docs] : docs) as S[];

      const { err, data } = await promise(Promise.all(_docs.map(async doc => {

        for (const k in joins) {

          if (!joins.hasOwnProperty(k)) continue;

          const conf = joins[k];
          const prop = doc[k];
          const key = conf.key || '_id';

          let values = !Array.isArray(prop) ? [prop] : prop;

          if (key === '_id')
            values = (values as any).map(v => this.toObjectID(v));

          const filter = { [key]: { '$in': values } } as FilterQuery<S>;

          const { err: pErr, data: pData } = await promise(this.db
            .collection<S>(conf.collection)
            .find(filter, conf.options)
            .toArray());

          if (pErr)
            return Promise.reject(pErr);

          doc[k] = pData[0] as any;

          if (Array.isArray(prop))
            doc[k] = pData as any;

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
     * Iterates populated prop and restores to join key.
     * 
     * @param doc the document to be unpopulated.
     * @param join the join string array or Joins<S> object.
     */
    static unpopulate(doc: S, join?: string | string[] | Joins<S>): S;

    /**
     * Iterates populated prop and restores to join key.
     * 
     * @param docs the documents to be unpopulated.
     * @param join the join string array or Joins<S> object.
     */
    static unpopulate(docs: S[], join?: string | string[] | Joins<S>): S[];

    static unpopulate(docs: S | S[], join?: string | string[] | Joins<S>) {

      const isArray = Array.isArray(docs);

      let joins: Joins<S> = join as any;
      join = typeof join === 'string' ? [join] : join;
      join = join || Object.keys(this.schema.joins || {});

      // Hotpath nothing to do.
      if (!joins && !(join as string[]).length)
        return docs;

      // Iterate array and get join configs.
      if (Array.isArray(join)) {
        joins = join.reduce((a, c) => {
          const j = this.schema.joins[c];
          if (j) a[c] = j;
          return a;
        }, {} as Joins<S>);
      }

      const _docs = (!isArray ? [docs] : docs) as S[];

      const canPopulate = v =>
        typeof v !== 'undefined' && !ObjectID.isValid(v) && (Array.isArray(v) || typeof v === 'object');

      _docs.forEach(doc => {

        for (const k in joins) {

          if (doc.hasOwnProperty(k) && canPopulate(doc[k])) {

            type DocKey = S[Extract<keyof S, string>];

            const _join = joins[k];
            const _prop = doc[k] as DocKey | DocKey[];

            if (Array.isArray(_prop)) {

              (_prop as DocKey[]).forEach((p, i) => {

                if (p instanceof Model)
                  doc[k][i] = p._doc[_join.key];

                else if (typeof p === 'object' && !ObjectID.isValid(p as any))
                  doc[k][i] = p[_join.key];

              });

            }

            else if (typeof _prop === 'object') {
              doc[k] = _prop[_join.key];
            }

          }
        }

      });

      if (!isArray)
        return _docs[0];

      return _docs;

    }

    /**
     * Cascades delete with specified joins.
     * 
     * @param doc the document to populate joins for.
     * @param join the join string array or Joins<S> object.
     */
    static async cascade(doc: S, join: string | string[] | Joins<S>): Promise<ICascadeResult<S>>;

    /**
     * Cascades deletes with specified joins.
     * 
     * @param docs the documents to populate joins for.
     * @param join the join string array or Joins<S> object.
     */
    static async cascade(doc: S[], join: string | string[] | Joins<S>): Promise<ICascadeResult<S>[]>;

    static async cascade(
      docs: S | S[],
      join?: string | string[] | Joins<S>) {

      const isArray = Array.isArray(docs);

      let joins: Joins<S> = join as any;
      join = typeof join === 'string' ? [join] : join;

      // Hotpath nothing to do.
      if (!joins && !(join as string[]).length)
        return null;

      // Iterate array and get join configs.
      if (Array.isArray(join)) {
        joins = join.reduce((a, c) => {
          const j = this.schema.joins[c];
          if (j) a[c] = j;
          return a;
        }, {} as Joins<S>);
      }

      const _docs = (!isArray ? [docs] : docs) as S[];

      const session = this.client.startSession();
      session.startTransaction();

      try {

        const result = await Promise.all(_docs.map(async d => {

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
                values = (values as any).map(v => this.toObjectID(v));

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
     * Casts to new type.
     * 
     * @param doc the document to be cast.
     * @param include when true only the specified props are included.
     * @param props the list of props to include if empty, all included.
     */
    static cast<T extends Partial<S>>(doc: T, include?: true, ...props: Array<KeyOf<T>>): T;

    /**
     * Casts to new type.
     * 
     * @param doc the document to be cast.
     * @param omit the list of props to omit.
     */
    static cast<T extends Partial<S>>(doc: T, ...omit: Array<KeyOf<T>>): T;

    /**
     * Casts to new type.
     * 
     * @param docs the documents to be cast.
     * @param include when true only the specified props are included.
     * @param props the list of props to include if empty, all included.
     */
    static cast<T extends Partial<S>>(docs: T[], include?: true, ...props: Array<KeyOf<T>>): T[];

    /**
     * Casts to new type.
     * 
     * @param docs the documents to be cast.
     * @param omit the list of props to omit.
     */
    static cast<T extends Partial<S>>(docs: T[], ...omit: Array<KeyOf<T>>): T[];

    static cast<T extends Partial<S>>(doc: T | T[], include?: boolean | KeyOf<T>, ...props: Array<KeyOf<T>>) {

      if (typeof include === 'string') {
        props.unshift(include);
        include = undefined;
      }

      const _doc = Array.isArray(doc) ? doc[0] : doc;
      const _keys = Object.keys(_doc) as Array<KeyOf<T>>;

      if (include === true) {
        props = props.length ? props : _keys;
      }
      else {
        props = _keys.filter(k => !props.includes(k));
      }

      function clean(d) {
        for (const k in d) {
          if (!props.includes(k as any))
            delete d[k];
        }
        return d;
      }

      if (Array.isArray(doc)) {
        doc = (doc as T[]).map(d => {
          return clean(doc);
        });
        return doc as T[];
      }

      return clean(doc) as T;

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
      p: T | Promise<T>,
      cb?: (err: E, data: T) => void): Promise<T> {
      const prom = (!isPromise(p) ? Promise.resolve(p) : p) as Promise<T>;

      return prom.then(res => {
        if (cb)
          cb(null, res);
        return res;
      })
        .catch(err => {
          if (cb)
            cb(err, null);

          throw err;
          // return err;
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

      let result: { err?: Error, data?: S | S[]; };

      if (isMany)
        result = await promise(this.collection.find(query, options).toArray());
      else
        result = await promise(this.collection.findOne(query, options));

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
      doc: OptionalId<S> | OptionalId<S>[],
      options: CollectionInsertOneOptions | CollectionInsertManyOptions = {}) {

      if (Array.isArray(doc)) {
        doc.reduce((a, c) => {
          a.push(c);
          return a;
        }, []);
        return this.collection.insertMany(doc, options);
      }

      else {
        return this.collection.insertOne(doc, options);
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
        return this.collection.updateMany(query, update, options);
      return this.collection.updateOne(query, update, options);
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
      options?: CommonOptions & { bypassDocumentValidation?: boolean; },
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
    static async findModel(
      id: LikeObjectId,
      options?: IFindOneOptions,
      cb?: MongoCallback<M & S | null>): Promise<M & S>;

    /**
     * Finds one document by query then converts to Model.
     * 
     * @param query the query for finding the document.
     * @param options optional find one options.
     * @param cb an optional callback instead of using promise.
     */
    static async findModel(
      query: FilterQuery<S>,
      options?: IFindOneOptions,
      cb?: MongoCallback<M & S | null>): Promise<M & S>;

    static async findModel(
      query: LikeObjectId | FilterQuery<S>,
      options?: IFindOneOptions | MongoCallback<M & S | null>,
      cb?: MongoCallback<M & S | null>) {

      if (typeof options === 'function') {
        cb = options as any;
        options = undefined;
      }

      const _query = this.toQuery(query);
      const { err, data } = await promise(this._find(_query, options as IFindOneOptions, false));

      if (err)
        return Promise.reject(err);

      const model = new Model(data as S, Document) as M & S;

      return this._handleResponse(model, cb);

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
      options?: IFindOneAndDeleteOption<S>,
      cb?: MongoCallback<FindAndModifyWriteOpResultObject<S>>) {
      const _query = this.toQuery(query);
      return this._handleResponse(this.collection.findOneAndDelete(_query, options), cb);
    }

    // Maybe consider adding this back in at some point.
    /**
     * Finds a document and then replaces it.
     * 
     * @param query the filter for finding the document.
     * @param doc the doc used to replace existing.
     * @param options the update options.
     * @param cb optional callback to use instead of Promise.
     */
    // static findReplace(
    //   query: LikeObjectId | FilterQuery<S>,
    //   doc: S,
    //   options?: FindOneAndReplaceOption,
    //   cb?: MongoCallback<FindAndModifyWriteOpResultObject<S>>) {
    //   const _query = this.toQuery(query);
    //   return this._handleResponse(this.collection.findOneAndReplace(_query, doc, options), cb);
    // }

    /**
     * Creates multiple documents in database.
     * 
     * @param docs the documents to be persisted to database.
     * @param options Mongodb insert many options.
     * @param cb optional callback to use instead of promise.
     */
    static create(
      docs: OptionalId<S>[],
      options: CollectionInsertManyOptions,
      cb?: MongoCallback<InsertWriteOpResult<S & { _id: any; }>>): Promise<InsertWriteOpResult<S & { _id: any; }>>;

    /**
     * Creates multiple documents in database.
     * 
     * @param docs the documents to be persisted to database.
     * @param cb optional callback to use instead of promise.
     */
    static create(
      docs: OptionalId<S>[],
      cb?: MongoCallback<InsertWriteOpResult<S & { _id: any; }>>): Promise<InsertWriteOpResult<S & { _id: any; }>>;

    static create(
      docs: OptionalId<S>[],
      options?: CollectionInsertManyOptions | MongoCallback<InsertWriteOpResult<S & { _id: any; }>>,
      cb?: MongoCallback<InsertWriteOpResult<S & { _id: any; }>>) {
      if (typeof options === 'function') {
        cb = options;
        options = undefined;
      }
      const creator = this._create(docs, options as CollectionInsertManyOptions) as any;
      return this._handleResponse(creator as Promise<InsertWriteOpResult<S & { _id: any; }>>, cb);
    }

    /**
     * Creates document in database.
     * 
     * @param doc the document to be persisted to database.
     * @param options Mongodb insert one options.
     * @param cb optional callback to use instead of promise.
     */
    static createOne(
      doc: OptionalId<S>,
      options: CollectionInsertOneOptions,
      cb?:
        MongoCallback<InsertOneWriteOpResult<S & { _id: any; }>>): Promise<InsertOneWriteOpResult<S & { _id: any; }>>;

    /**
     * Creates document in database.
     * 
     * @param doc the document to be persisted to database.
     * @param cb optional callback to use instead of promise.
     */
    static createOne(
      doc: OptionalId<S>,
      cb?:
        MongoCallback<InsertOneWriteOpResult<S & { _id: any; }>>): Promise<InsertOneWriteOpResult<S & { _id: any; }>>;

    static createOne(
      doc: OptionalId<S>,
      options?: CollectionInsertOneOptions | MongoCallback<InsertOneWriteOpResult<S & { _id: any; }>>,
      cb?: MongoCallback<InsertOneWriteOpResult<S & { _id: any; }>>) {
      if (typeof options === 'function') {
        cb = options;
        options = undefined;
      }
      const creator = this._create(doc, options as CollectionInsertOneOptions) as any;
      return this._handleResponse(creator as Promise<InsertOneWriteOpResult<S & { _id: any; }>>, cb);
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

      return this._handleResponse(this._update(query, update, options as UpdateManyOptions, true), cb);

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

      console.log('\n-- updateOne options --');
      console.log('query:', _query);
      console.log('update:', update);
      console.log();

      return this._handleResponse(this._update(_query, update, options as UpdateOneOptions, false), cb);

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
      options: CommonOptions & { bypassDocumentValidation?: boolean; },
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
      options?: CommonOptions & { bypassDocumentValidation?: boolean; },
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
      options?: CommonOptions & { bypassDocumentValidation?: boolean; } | MongoCallback<DeleteWriteOpResultObject>,
      cb?: MongoCallback<DeleteWriteOpResultObject>) {

      if (typeof options === 'function') {
        cb = options;
        options = undefined;
      }
      const _query = this.toQuery(query);
      return this._handleResponse(
        this._delete(_query, options as CommonOptions & { bypassDocumentValidation?: boolean; }, false), cb);
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

    constructor(doc?: S, isClone = false) {
      if (!Document.db || !Document.client)
        throw new Error(`Failed to initialize model with "db" or "client" of undefined.`);
      return new Model(doc, Document, isClone);
    }

  };

  // If no config only return the derived type.
  // Otherwise wrap with Mustad hooks.
  if (config)
    mustad = new Mustad(Wrapper, { include: includeKeys });

  return Wrapper;

}
