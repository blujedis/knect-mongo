
import {
  FilterQuery, UpdateQuery, ObjectId, DeleteWriteOpResultObject,
  CollectionInsertOneOptions, CollectionInsertManyOptions, UpdateManyOptions, UpdateOneOptions,
  CommonOptions, Db, MongoClient, FindOneAndUpdateOption,
  MongoCallback, FindAndModifyWriteOpResultObject, InsertOneWriteOpResult,
  InsertWriteOpResult, UpdateWriteOpResult, ObjectID, OptionalId
} from 'mongodb';
import {
  ISchema, LikeObjectId, ICascadeResult, IFindOneOptions,
  Constructor, IDoc, DocumentHook, Joins, IFindOneAndDeleteOption,
  HookType
} from './types';
import { promise, isPromise } from './utils';
import { Model as BaseModel } from './model';
import { Mustad } from 'mustad';
import { KnectMongo } from './knect';

const hookMap = {
  find: ['_find'],
  create: ['_create'],
  update: ['_update', 'findUpdate'],
  delete: ['_delete', 'findDelete'],
  exclude: ['_exclude', 'findExclude']
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
export function initDocument<T extends IDoc, M extends BaseModel<T>>(
  config?: ISchema<T>,
  client?: MongoClient,
  db?: Db,
  Model?: Constructor<M>,
  knect?: KnectMongo,
) {

  let mustad: Mustad<typeof Wrapper>;

  const Wrapper = class Document {

    static knect: KnectMongo = knect;
    static collectionName: string = config && config.collectionName;
    static schema: ISchema<T> = config;

    static get client() {
      return client || this.knect.client;
    }

    static get db() {
      return db || this.knect.db;
    }

    static get collection() {
      return this.db.collection<T>(this.collectionName);
    }

    static get options() {
      return this.knect.options;
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
     * Normalizes query ensures common cases _id are cast to ObjectID.
     * 
     * @param query the Mongodb filter query.
     */
    static toQuery(query: LikeObjectId | FilterQuery<T>) {

      let _query: FilterQuery<T> = query as any;

      if (typeof query !== 'object')
        _query = { _id: query } as FilterQuery<T>;
      // Query contains id but isn't cast to ObjectID.
      if (_query._id && typeof _query._id !== 'object')
        _query._id = this.toObjectID(_query._id as LikeObjectId) as any;

      // Query contains id with $in iterate each and cast to ObjectID.
      else if (_query._id && typeof _query._id === 'object' && (_query._id as any).$in)
        (_query._id as any).$in = (_query._id as any).$in.map(v => this.toObjectID(v));

      // The below happens when an objectId is being converted
      // to a query, it is itself an object so above checks fail.
      if (Object.keys(_query).includes('_bsontype'))
        _query = { _id: _query } as any;

      return _query;

    }

    /**
     * Normalizes update query so that $set is always present.
     * 
     * @param update the update query to be applied.
     */
    static toUpdate(update: UpdateQuery<Partial<T>> | Partial<T> = {}): UpdateQuery<Partial<T>> {
      const hasSpecial = Object.keys(update).reduce((a, c) => {
        if (a === true)
          return a;
        a = c.charAt(0) === '$';
        return a;
      }, false);
      if (!hasSpecial)
        update = { $set: update } as UpdateQuery<T>;
      return update as UpdateQuery<T>;
    }

    /**
     * Normalizes update query so that exclude key is added and seet.
     * 
     * @param update the update query to be applied.
     */
    static toExclude(update: UpdateQuery<Partial<T>> = {}): UpdateQuery<Partial<T>> {
      const hasSpecial = Object.keys(update).reduce((a, c) => {
        if (a === true)
          return a;
        a = c.charAt(0) === '$';
        return a;
      }, false);
      if (!hasSpecial)
        update = { $set: update } as UpdateQuery<T>;
      const excludeKey = this.options.excludeKey as keyof T;
      let excludeValue =
        typeof this.options.excludeValue === 'function' ?
          this.options.excludeValue() :
          this.options.excludeValue;
      excludeValue = excludeValue || Date.now();
      console.log(excludeValue);
      update.$set[excludeKey] = excludeValue as any;
      return update;
    }

    /**
     * Converts Joins<S> to cascade keys.
     * 
     * @param joins object containing joins to build list from.
     * @param filter an array of keys to exclude.
     */
    static toCascades(joins: Joins<T>, ...filter: string[]): string[];

    /**
     * Converts Joins<S> to cascade keys.
     * 
     * @param filter an array of keys to exclude.
     */
    static toCascades(...filter: string[]): string[];

    static toCascades(joins: string | Joins<T>, ...filter: string[]) {

      if (typeof joins === 'string') {
        filter.unshift(joins as string);
        joins = undefined;
      }

      const _joins = joins || (this.schema.joins || {}) as Joins<T>;

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
    static isValid(doc: T) {
      this.knect.options.isValid(this.collectionName, doc, this.schema);
    }

    /**
     * Validates a document against schema.
     * 
     * @param doc the document to be validated.
     */
    static validate(doc: T) {
      return this.knect.options.validate(this.collectionName, doc, this.schema);
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
    static async populate(doc: T, join: string | string[] | Joins<T>): Promise<T>;

    /**
     * Populates documents with specified join.
     * 
     * @param docs the document to populate joins for.
     * @param join the join config, configs or array of join names.
     */
    static async populate(docs: T[], join: string | string[] | Joins<T>): Promise<T[]>;

    static async populate(docs: T | T[], join?: string | string[] | Joins<T>): Promise<T | T[]> {

      const isArray = Array.isArray(docs);

      let joins: Joins<T> = join as any;
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
        }, {} as Joins<T>);
      }

      const _docs = (!isArray ? [docs] : docs) as T[];

      const { err, data } = await promise(Promise.all(_docs.map(async doc => {

        for (const k in joins) {

          if (!joins.hasOwnProperty(k)) continue;

          const conf = joins[k];
          const prop = doc[k];
          const key = conf.key || '_id';

          let values = !Array.isArray(prop) ? [prop] : prop;

          if (key === '_id')
            values = (values as any).map(v => this.toObjectID(v));

          const filter = { [key]: { '$in': values } } as FilterQuery<T>;

          const { err: pErr, data: pData } = await promise(this.db
            .collection<T>(conf.collection)
            .find(filter, conf.options as any)
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
    static unpopulate(doc: T, join?: string | string[] | Joins<T>): T;

    /**
     * Iterates populated prop and restores to join key.
     * 
     * @param docs the documents to be unpopulated.
     * @param join the join string array or Joins<S> object.
     */
    static unpopulate(docs: T[], join?: string | string[] | Joins<T>): T[];

    static unpopulate(docs: T | T[], join?: string | string[] | Joins<T>) {

      const isArray = Array.isArray(docs);

      let joins: Joins<T> = join as any;
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
        }, {} as Joins<T>);
      }

      const _docs = (!isArray ? [docs] : docs) as T[];

      const canPopulate = v =>
        typeof v !== 'undefined' && !ObjectID.isValid(v) && (Array.isArray(v) || typeof v === 'object');

      _docs.forEach(doc => {

        for (const k in joins) {

          if (doc.hasOwnProperty(k) && canPopulate(doc[k])) {

            type DocKey = T[keyof T];

            const _join = joins[k];
            const _prop = doc[k] as DocKey | DocKey[];

            if (Array.isArray(_prop)) {

              (_prop as DocKey[]).forEach((p, i) => {

                if (p instanceof Model)
                  doc[k][i] = p._doc[_join.key];

                else if (typeof p === 'object' && !ObjectID.isValid(p as any))
                  doc[k][i] = p[_join.key as string];

              });

            }

            else if (typeof _prop === 'object') {
              doc[k] = _prop[_join.key] as any;
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
    static async cascade(doc: T, join: string | string[] | Joins<T>): Promise<ICascadeResult<T>>;

    /**
     * Cascades deletes with specified joins.
     * 
     * @param docs the documents to populate joins for.
     * @param join the join string array or Joins<S> object.
     */
    static async cascade(doc: T[], join: string | string[] | Joins<T>): Promise<ICascadeResult<T>[]>;

    static async cascade(
      docs: T | T[],
      join?: string | string[] | Joins<T>) {

      const isArray = Array.isArray(docs);

      let joins: Joins<T> = join as any;
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
        }, {} as Joins<T>);
      }

      const _docs = (!isArray ? [docs] : docs) as T[];

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
                .deleteMany(filter, conf.options as CommonOptions);

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
    static cast<U extends Partial<T>>(doc: U, include?: true, ...props: Array<keyof U>): U;

    /**
     * Casts to new type.
     * 
     * @param doc the document to be cast.
     * @param omit the list of props to omit.
     */
    static cast<U extends Partial<T>>(doc: U, ...omit: Array<keyof U>): U;

    /**
     * Casts to new type.
     * 
     * @param docs the documents to be cast.
     * @param include when true only the specified props are included.
     * @param props the list of props to include if empty, all included.
     */
    static cast<U extends Partial<T>>(docs: U[], include?: true, ...props: Array<keyof U>): U[];

    /**
     * Casts to new type.
     * 
     * @param docs the documents to be cast.
     * @param omit the list of props to omit.
     */
    static cast<U extends Partial<T>>(docs: U[], ...omit: Array<keyof U>): U[];

    static cast<U extends Partial<T>>(doc: U | U[], include?: boolean | keyof U, ...props: Array<keyof U>) {

      if (typeof include === 'string') {
        props.unshift(include);
        include = undefined;
      }

      const _doc = Array.isArray(doc) ? doc[0] : doc;
      const _keys = Object.keys(_doc) as Array<keyof U>;

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
        doc = (doc as U[]).map(d => {
          return clean(doc);
        });
        return doc as U[];
      }

      return clean(doc) as U;

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
    static async _handleResponse<R, E>(
      p: R | Promise<R> | Promise<R>,
      cb?: (err: E, data: R) => void): Promise<R> {
      const prom = (!isPromise(p) ? Promise.resolve(p) : p) as Promise<R>;

      return prom.then(res => {
        if (cb)
          cb(null, res);
        return res;
      })
        .catch(err => {
          if (cb)
            cb(err, null);
          throw err;
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
      query?: FilterQuery<T>,
      options?: IFindOneOptions<T>,
      isMany: boolean = false) {

      query = this.toQuery(query || {});
      options = options || {};

      let result: { err?: Error, data?: T | T[]; };

      if (isMany)
        result = await promise(this.collection.find(query, options as any).toArray());
      else
        result = await promise(this.collection.findOne(query, options as any) as any);

      if (result.err)
        return Promise.reject(result.err);

      if (!options.populate) {
        if (isMany)
          return result.data as T[];
        return result.data as T;
      }

      if (isMany)
        return this.populate(result.data as T[], options.populate);
      return this.populate(result.data as T, options.populate);

    }

    /**
     * Common handler to create single or multiple documents in database.
     * 
     * @param docs the documents to be persisted to database.
     * @param options Mongodb insert many options.
     */
    static _create(
      doc: OptionalId<T> | OptionalId<T>[],
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
      query: FilterQuery<T>,
      update: UpdateQuery<Partial<T>> | Partial<T>,
      options?: UpdateOneOptions | UpdateManyOptions,
      isMany: boolean = false) {
      if (isMany)
        return this.collection.updateMany(query, update, options);
      return this.collection.updateOne(query, update, options);
    }

    /**
     * Common update handler to update single or multiple documents by query.
     * 
     * @param query the Mongodb filter for finding the desired documents to update.
     * @param update the update query to be applied.
     * @param options Mongodb update options.
     * @param isMany when true update many.
     */
    static _exclude(
      query: FilterQuery<T>,
      update: UpdateQuery<Partial<T>> | Partial<T>,
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
      query: FilterQuery<T>,
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
    static find(query?: FilterQuery<T>, options?: IFindOneOptions<T>) {
      return this._find(query, options, true) as Promise<T[]>;
    }

    /**
     * Finds a collection of documents by query excluding documents defined by "excludeKey".
     * 
     * @param query the Mongodb filter query.
     * @param options Mongodb find options.
     */
    static findIncluded(query: FilterQuery<T> = {}, options?: IFindOneOptions<T>, cb?: MongoCallback<T | null>) {
      query.$or = query.$or || [];
      const excludeKey = this.options.excludeKey as any;
      query.$or = [
        { [excludeKey]: { $exists: false } },
        { [excludeKey]: null },
        ...query.$or
      ];
      return this._handleResponse(this._find(query, options, true) as any, cb) as unknown as Promise<T[]>;
    }

    static findOneIncluded(query: FilterQuery<T> = {}, options?: IFindOneOptions<T>, cb?: MongoCallback<T | null>) {
      query.$or = query.$or || [];
      const excludeKey = this.options.excludeKey as any;
      query.$or = [
        { [excludeKey]: { $exists: false } },
        { [excludeKey]: null },
        ...query.$or
      ];
      return this._handleResponse(this._find(query, options, false) as Promise<T>, cb);
    }

    /**
     * Finds one document by query.
     * 
     * @param query the Mongodb filter query.
     * @param options Mongodb find options.
     * @param cb an optional callback instead of using promise.
     */
    static findOne(
      query: FilterQuery<T>,
      options: IFindOneOptions<T>,
      cb?: MongoCallback<T | null>): Promise<T>;

    /**
     * Finds one document by query.
     * 
     * @param query the Mongodb filter query.
     * @param cb an optional callback instead of using promise.
     */
    static findOne(
      query: FilterQuery<T>,
      cb?: MongoCallback<T | null>,
    ): Promise<T>;

    static findOne(
      query: LikeObjectId | FilterQuery<T>,
      options?: IFindOneOptions<T> | MongoCallback<T | null>,
      cb?: MongoCallback<T | null>) {
      if (typeof options === 'function') {
        cb = options;
        options = undefined;
      }
      const _query = this.toQuery(query);
      return this._handleResponse(this._find(_query, options as IFindOneOptions<T>, false) as Promise<T>, cb);
    }

    /**
     * Finds one document by id.
     * 
     * @param id the id of the document to find.
     * @param options Mongodb find options.
     * @param cb an optional callback instead of using promise.
     */
    static findId(id: LikeObjectId, options: IFindOneOptions<T>, cb?: MongoCallback<T | null>): Promise<T>;

    /**
     * Finds one document by id.
     * 
     * @param id the id of the document to find.
     * @param cb an optional callback instead of using promise.
     */
    static findId(id: LikeObjectId, cb?: MongoCallback<T | null>): Promise<T>;

    static findId(
      id: LikeObjectId,
      options?: IFindOneOptions<T> | MongoCallback<T | null>,
      cb?: MongoCallback<T | null>) {
      return this.findOne({ _id: id as any }, options as IFindOneOptions<T>, cb);
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
      options?: IFindOneOptions<T>,
      cb?: MongoCallback<M & T | null>): Promise<M & T>;

    /**
     * Finds one document by query then converts to Model.
     * 
     * @param query the query for finding the document.
     * @param options optional find one options.
     * @param cb an optional callback instead of using promise.
     */
    static async findModel(
      query: FilterQuery<T>,
      options?: IFindOneOptions<T>,
      cb?: MongoCallback<M & T | null>): Promise<M & T>;

    static async findModel(
      query: LikeObjectId | FilterQuery<T>,
      options?: IFindOneOptions<T> | MongoCallback<M & T | null>,
      cb?: MongoCallback<M & T | null>) {

      if (typeof options === 'function') {
        cb = options as any;
        options = undefined;
      }

      const _query = this.toQuery(query);
      const { err, data } = await promise(this._find(_query, options as IFindOneOptions<T>, false));

      if (err)
        return Promise.reject(err);

      const model = new Model(data as T, Document) as M & T;

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
      query: LikeObjectId | FilterQuery<T>,
      update: UpdateQuery<Partial<T>> | Partial<T>,
      options?: FindOneAndUpdateOption<T>,
      cb?: MongoCallback<FindAndModifyWriteOpResultObject<T>>) {
      const _query = this.toQuery(query);
      const _update = this.toUpdate(update);
      options = { ...options };
      if (typeof options.returnOriginal === 'undefined')
        options.returnOriginal = false;
      return this._handleResponse(this.collection.findOneAndUpdate(_query, _update, options), cb);
    }

    /**
     * Finds a document and then updates.
     * 
     * @param query the filter for finding the document.
     * @param update the update to be applied.
     * @param options the update options.
     * @param cb optional callback to use instead of Promise.
     */
    static findExclude(
      query: LikeObjectId | FilterQuery<T>,
      update: UpdateQuery<Partial<T>> | Partial<T>,
      options?: FindOneAndUpdateOption<T>,
      cb?: MongoCallback<FindAndModifyWriteOpResultObject<T>>) {
      const _query = this.toQuery(query);
      let _update = this.toUpdate(update);
      _update = this.toExclude(_update);
      console.log(_update);
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
      query: LikeObjectId | FilterQuery<T>,
      options?: IFindOneAndDeleteOption<T>,
      cb?: MongoCallback<FindAndModifyWriteOpResultObject<T>>) {
      const _query = this.toQuery(query);
      return this._handleResponse(this.collection.findOneAndDelete(_query, options), cb);
    }

    /**
     * Creates multiple documents in database.
     * 
     * @param docs the documents to be persisted to database.
     * @param options Mongodb insert many options.
     * @param cb optional callback to use instead of promise.
     */
    static create(
      docs: OptionalId<T>[],
      options: CollectionInsertManyOptions,
      cb?: MongoCallback<InsertWriteOpResult<T & { _id: any; }>>): Promise<InsertWriteOpResult<T & { _id: any; }>>;

    /**
     * Creates multiple documents in database.
     * 
     * @param docs the documents to be persisted to database.
     * @param cb optional callback to use instead of promise.
     */
    static create(
      docs: OptionalId<T>[],
      cb?: MongoCallback<InsertWriteOpResult<T & { _id: any; }>>): Promise<InsertWriteOpResult<T & { _id: any; }>>;

    static create(
      docs: OptionalId<T>[],
      options?: CollectionInsertManyOptions | MongoCallback<InsertWriteOpResult<T & { _id: any; }>>,
      cb?: MongoCallback<InsertWriteOpResult<T & { _id: any; }>>) {
      if (typeof options === 'function') {
        cb = options;
        options = undefined;
      }
      const creator = this._create(docs, options as CollectionInsertManyOptions) as any;
      return this._handleResponse(creator as Promise<InsertWriteOpResult<T & { _id: any; }>>, cb);
    }

    /**
     * Creates document in database.
     * 
     * @param doc the document to be persisted to database.
     * @param options Mongodb insert one options.
     * @param cb optional callback to use instead of promise.
     */
    static createOne(
      doc: OptionalId<T>,
      options: CollectionInsertOneOptions,
      cb?:
        MongoCallback<InsertOneWriteOpResult<T & { _id: any; }>>): Promise<InsertOneWriteOpResult<T & { _id: any; }>>;

    /**
     * Creates document in database.
     * 
     * @param doc the document to be persisted to database.
     * @param cb optional callback to use instead of promise.
     */
    static createOne(
      doc: OptionalId<T>,
      cb?:
        MongoCallback<InsertOneWriteOpResult<T & { _id: any; }>>): Promise<InsertOneWriteOpResult<T & { _id: any; }>>;

    static createOne(
      doc: OptionalId<T>,
      options?: CollectionInsertOneOptions | MongoCallback<InsertOneWriteOpResult<T & { _id: any; }>>,
      cb?: MongoCallback<InsertOneWriteOpResult<T & { _id: any; }>>) {
      if (typeof options === 'function') {
        cb = options;
        options = undefined;
      }
      const creator = this._create(doc, options as CollectionInsertOneOptions) as any;
      return this._handleResponse(creator as Promise<InsertOneWriteOpResult<T & { _id: any; }>>, cb);
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
      query: FilterQuery<T>,
      update: UpdateQuery<Partial<T>> | Partial<T>,
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
      query: FilterQuery<T>,
      update: UpdateQuery<Partial<T>> | Partial<T>,
      cb?: MongoCallback<UpdateWriteOpResult>): Promise<UpdateWriteOpResult>;

    static update(
      query: FilterQuery<T>,
      update: UpdateQuery<Partial<T>> | Partial<T>,
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
      update: UpdateQuery<Partial<T>> | Partial<T>,
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
      update: UpdateQuery<Partial<T>> | Partial<T>,
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
      query: FilterQuery<T>,
      update: UpdateQuery<Partial<T>> | Partial<T>,
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
      query: FilterQuery<T>,
      update: UpdateQuery<Partial<T>> | Partial<T>,
      cb?: MongoCallback<UpdateWriteOpResult>): Promise<UpdateWriteOpResult>;

    static updateOne(
      query: LikeObjectId | FilterQuery<T>,
      update: UpdateQuery<Partial<T>> | Partial<T>,
      options?: UpdateOneOptions | MongoCallback<UpdateWriteOpResult>,
      cb?: MongoCallback<UpdateWriteOpResult>) {

      if (typeof options === 'function') {
        cb = options;
        options = undefined;
      }

      const _query = this.toQuery(query);
      update = this.toUpdate(update);

      return this._handleResponse(this._update(_query, update, options as UpdateOneOptions, false), cb);

    }

    /**
     * Excludes multiple documents by query by updating and tagging documents as 
     * exlcuded/deleted without removing.
     * 
     * @param query the Mongodb filter for finding the desired documents to exclude softly.
     * @param update the exclude query to be applied.
     * @param options Mongodb update options.
     * @param cb optional callback to use instead of promise.
     */
    static exclude(
      query: FilterQuery<T>,
      update: UpdateQuery<Partial<T>> | Partial<T>,
      options: UpdateManyOptions,
      cb?: MongoCallback<UpdateWriteOpResult>): Promise<UpdateWriteOpResult>;

    /**
     * Excludes multiple documents by query by updating and tagging documents as 
     * exlcuded/deleted without removing.
     * 
     * @param query the Mongodb filter for finding the desired documents to exclude softly.
     * @param update the exclude query to be applied.
     * @param cb optional callback to use instead of promise.
     */
    static exclude(
      query: FilterQuery<T>,
      update?: UpdateQuery<Partial<T>> | Partial<T>,
      cb?: MongoCallback<UpdateWriteOpResult>): Promise<UpdateWriteOpResult>;

    static exclude(
      query: FilterQuery<T>,
      update?: UpdateQuery<Partial<T>> | Partial<T>,
      options?: UpdateManyOptions | MongoCallback<UpdateWriteOpResult>,
      cb?: MongoCallback<UpdateWriteOpResult>) {

      if (typeof options === 'function') {
        cb = options;
        options = undefined;
      }

      query = this.toQuery(query);
      update = this.toUpdate(update);
      update = this.toExclude(update);

      return this._handleResponse(this._exclude(query, update, options as UpdateManyOptions, true), cb);

    }

    /**
     * Excludes one document by id marking as deleted.
     * 
     * @param id the id of the document to be excluded softly.
     * @param update the exclude query to be applied.
     * @param options Mongodb update options.
     * @param cb optional callback to use instead of promise.
     */
    static excludeOne(
      id: LikeObjectId,
      update: UpdateQuery<Partial<T>> | Partial<T>,
      options: UpdateOneOptions,
      cb?: MongoCallback<UpdateWriteOpResult>): Promise<UpdateWriteOpResult>;

    /**
     * Excludes one document by id marking as deleted.
     * 
     * @param id the id of the document to be excluded softly.
     * @param update the exclude query to be applied.
     * @param cb optional callback to use instead of promise.
     */
    static excludeOne(
      id: LikeObjectId,
      update: UpdateQuery<Partial<T>> | Partial<T>,
      cb?: MongoCallback<UpdateWriteOpResult>): Promise<UpdateWriteOpResult>;

    /**
     * Excludes one document by id marking as deleted.
     * 
     * @param query the Mongodb filter for finding the desired documents to exclude softly.
     * @param update the exclude query to be applied.
     * @param options Mongodb update options.
     * @param cb optional callback to use instead of promise.
     */
    static excludeOne(
      query: FilterQuery<T>,
      update: UpdateQuery<Partial<T>> | Partial<T>,
      options: UpdateOneOptions,
      cb?: MongoCallback<UpdateWriteOpResult>): Promise<UpdateWriteOpResult>;

    /**
     * Excludes one document by id marking as deleted.
     * 
     * @param query the Mongodb filter for finding the desired documents to exclude softly.
     * @param update the exclude query to be applied.
     * @param cb optional callback to use instead of promise.
     */
    static excludeOne(
      query: FilterQuery<T>,
      update?: UpdateQuery<Partial<T>> | Partial<T>,
      cb?: MongoCallback<UpdateWriteOpResult>): Promise<UpdateWriteOpResult>;

    static excludeOne(
      query: LikeObjectId | FilterQuery<T>,
      update?: UpdateQuery<Partial<T>> | Partial<T>,
      options?: UpdateOneOptions | MongoCallback<UpdateWriteOpResult>,
      cb?: MongoCallback<UpdateWriteOpResult>) {
      if (typeof options === 'function') {
        cb = options;
        options = undefined;
      }

      const _query = this.toQuery(query);
      update = this.toUpdate(update);
      update = this.toExclude(update);

      return this._handleResponse(this._exclude(_query, update, options as UpdateOneOptions, false), cb);
    }

    /**
     * Deletes multiple documents by query.
     * 
     * @param query the Mongodb filter for finding the desired documents to delete.
     * @param options Mongodb delete options.
     * @param cb optional callback to use instead of promise.
     */
    static delete(
      query: FilterQuery<T>,
      options: CommonOptions,
      cb?: MongoCallback<DeleteWriteOpResultObject>): Promise<DeleteWriteOpResultObject>;

    /**
     * Deletes multiple documents by query.
     * 
     * @param query the Mongodb filter for finding the desired documents to delete.
     * @param cb optional callback to use instead of promise.
     */
    static delete(
      query: FilterQuery<T>,
      cb?: MongoCallback<DeleteWriteOpResultObject>): Promise<DeleteWriteOpResultObject>;

    static delete(
      query: FilterQuery<T>,
      options?: CommonOptions | MongoCallback<DeleteWriteOpResultObject>,
      cb?: MongoCallback<DeleteWriteOpResultObject>) {

      if (typeof options === 'function') {
        cb = options;
        options = undefined;
      }

      query = this.toQuery(query);
      return this._handleResponse(this._delete(query, options as CommonOptions, true), cb);
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
      query: FilterQuery<T>,
      options?: CommonOptions & { bypassDocumentValidation?: boolean; },
      cb?: MongoCallback<DeleteWriteOpResultObject>): Promise<DeleteWriteOpResultObject>;

    /**
     * Deletes one document by query.
     * 
     * @param query the Mongodb filter for finding the desired documents to delete.
     * @param cb optional callback to use instead of promise.
     */
    static deleteOne(
      query: FilterQuery<T>,
      cb?: MongoCallback<DeleteWriteOpResultObject>): Promise<DeleteWriteOpResultObject>;

    static deleteOne(
      query: LikeObjectId | FilterQuery<T>,
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

    constructor(doc?: T, isClone = false) {
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
