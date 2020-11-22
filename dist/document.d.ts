import { FilterQuery, UpdateQuery, ObjectId, DeleteWriteOpResultObject, CollectionInsertOneOptions, CollectionInsertManyOptions, UpdateManyOptions, UpdateOneOptions, CommonOptions, Db, MongoClient, FindOneAndUpdateOption, MongoCallback, FindAndModifyWriteOpResultObject, InsertOneWriteOpResult, InsertWriteOpResult, UpdateWriteOpResult, OptionalId } from 'mongodb';
import { ISchema, LikeObjectId, ICascadeResult, IFindOneOptions, Constructor, IDoc, DocumentHook, Joins, IFindOneAndDeleteOption, HookType } from './types';
import { Model as BaseModel } from './model';
import { KnectMongo } from './knect';
/**
 * Initializes a new Knect Document.
 *
 * @param config the configuration with schema.
 * @param client the MongoClient instance.
 * @param db the Mongo database connection.
 * @param Model the BaseModel type for creating models.
 */
export declare function initDocument<T extends IDoc, M extends BaseModel<T>>(config?: ISchema<T>, client?: MongoClient, db?: Db, Model?: Constructor<M>, knect?: KnectMongo): {
    new (doc?: T, isClone?: boolean): {};
    knect: KnectMongo;
    collectionName: string;
    schema: ISchema<T>;
    readonly client: MongoClient;
    readonly db: Db;
    readonly collection: import("mongodb").Collection<T>;
    readonly options: import("./types").IOptions;
    /**
     * Convert value to ObjectID.
     *
     * @param id the Like id value to convert to Mongodb ObjectID.
     */
    toObjectID(id: LikeObjectId): ObjectId;
    /**
     * Convert value to ObjectID.
     *
     * @param id the Like id value to convert to Mongodb ObjectID.
     */
    toObjectID(ids: LikeObjectId[]): ObjectId[];
    /**
     * Normalizes query ensures common cases _id are cast to ObjectID.
     *
     * @param query the Mongodb filter query.
     */
    toQuery(query: LikeObjectId | FilterQuery<T>): FilterQuery<T>;
    /**
     * Normalizes update query so that $set is always present.
     *
     * @param update the update query to be applied.
     */
    toUpdate(update?: UpdateQuery<Partial<T>> | Partial<T>): UpdateQuery<Partial<T>>;
    /**
     * Normalizes update query so that exclude key is added and seet.
     *
     * @param update the update query to be applied.
     */
    toExclude(update?: UpdateQuery<Partial<T>>): UpdateQuery<Partial<T>>;
    /**
     * Converts Joins<S> to cascade keys.
     *
     * @param joins object containing joins to build list from.
     * @param filter an array of keys to exclude.
     */
    toCascades(joins: Joins<T>, ...filter: string[]): string[];
    /**
     * Converts Joins<S> to cascade keys.
     *
     * @param joins object containing joins to build list from.
     * @param filter an array of keys to exclude.
     */
    toCascades(...filter: string[]): string[];
    /**
     * Checks is document is valid against schema.
     *
     * @param doc the document to be validated.
     */
    isValid(doc: T): void;
    /**
     * Validates a document against schema.
     *
     * @param doc the document to be validated.
     */
    validate(doc: T): Promise<T>;
    /**
     * Populates document with specified joins.
     *
     * @param doc the document to populate joins for.
     * @param join the join config, configs or array of join names.
     */
    populate(doc: T, join: string | string[] | Joins<T>): Promise<T>;
    /**
     * Populates document with specified joins.
     *
     * @param doc the document to populate joins for.
     * @param join the join config, configs or array of join names.
     */
    populate(docs: T[], join: string | string[] | Joins<T>): Promise<T[]>;
    /**
     * Iterates populated prop and restores to join key.
     *
     * @param doc the document to be unpopulated.
     * @param join the join string array or Joins<S> object.
     */
    unpopulate(doc: T, join?: string | string[] | Joins<T>): T;
    /**
     * Iterates populated prop and restores to join key.
     *
     * @param doc the document to be unpopulated.
     * @param join the join string array or Joins<S> object.
     */
    unpopulate(docs: T[], join?: string | string[] | Joins<T>): T[];
    /**
     * Cascades delete with specified joins.
     *
     * @param doc the document to populate joins for.
     * @param join the join string array or Joins<S> object.
     */
    cascade(doc: T, join: string | string[] | Joins<T>): Promise<ICascadeResult<T>>;
    /**
     * Cascades delete with specified joins.
     *
     * @param doc the document to populate joins for.
     * @param join the join string array or Joins<S> object.
     */
    cascade(doc: T[], join: string | string[] | Joins<T>): Promise<ICascadeResult<T>[]>;
    /**
     * Casts to new type.
     *
     * @param doc the document to be cast.
     * @param include when true only the specified props are included.
     * @param props the list of props to include if empty, all included.
     */
    cast<U extends Partial<T>>(doc: U, include?: true, ...props: (keyof U)[]): U;
    /**
     * Casts to new type.
     *
     * @param doc the document to be cast.
     * @param include when true only the specified props are included.
     * @param props the list of props to include if empty, all included.
     */
    cast<U_1 extends Partial<T>>(doc: U_1, ...omit: (keyof U_1)[]): U_1;
    /**
     * Casts to new type.
     *
     * @param doc the document to be cast.
     * @param include when true only the specified props are included.
     * @param props the list of props to include if empty, all included.
     */
    cast<U_2 extends Partial<T>>(docs: U_2[], include?: true, ...props: (keyof U_2)[]): U_2[];
    /**
     * Casts to new type.
     *
     * @param doc the document to be cast.
     * @param include when true only the specified props are included.
     * @param props the list of props to include if empty, all included.
     */
    cast<U_3 extends Partial<T>>(docs: U_3[], ...omit: (keyof U_3)[]): U_3[];
    /**
     * Internal method to handle all responses.
     *
     * @param promise a promise to be handled.
     * @param cb an optional callback to be called with error or data.
     */
    _handleResponse<R, E>(p: R | Promise<R>, cb?: (err: E, data: R) => void): Promise<R>;
    /**
     * Common handler finds a document or collection of documents by query.
     *
     * @param query the Mongodb filter query.
     * @param options Mongodb find options.
     * @param isMany when true find many.
     * @param cb optional callback instead of promise.
     */
    _find(query?: FilterQuery<T>, options?: IFindOneOptions<T>, isMany?: boolean): Promise<T | T[]>;
    /**
     * Common handler to create single or multiple documents in database.
     *
     * @param docs the documents to be persisted to database.
     * @param options Mongodb insert many options.
     */
    _create(doc: OptionalId<T> | OptionalId<T>[], options?: CollectionInsertOneOptions | CollectionInsertManyOptions): Promise<InsertWriteOpResult<import("mongodb").WithId<T>>> | Promise<InsertOneWriteOpResult<import("mongodb").WithId<T>>>;
    /**
     * Common update handler to update single or multiple documents by query.
     *
     * @param query the Mongodb filter for finding the desired documents to update.
     * @param update the update query to be applied.
     * @param options Mongodb update options.
     * @param isMany when true update many.
     */
    _update(query: FilterQuery<T>, update: UpdateQuery<Partial<T>> | Partial<T>, options?: UpdateOneOptions | UpdateManyOptions, isMany?: boolean): Promise<UpdateWriteOpResult>;
    /**
     * Common update handler to update single or multiple documents by query.
     *
     * @param query the Mongodb filter for finding the desired documents to update.
     * @param update the update query to be applied.
     * @param options Mongodb update options.
     * @param isMany when true update many.
     */
    _exclude(query: FilterQuery<T>, update: UpdateQuery<Partial<T>> | Partial<T>, options?: UpdateOneOptions | UpdateManyOptions, isMany?: boolean): Promise<UpdateWriteOpResult>;
    /**
     * Common delete hander to delete multiple or single documents by query.
     *
     * @param query the Mongodb filter for finding the desired documents to update.
     * @param options Mongodb update options.
     * @param isMany when true uses collection.deleteMany().
     */
    _delete(query: FilterQuery<T>, options?: CommonOptions & {
        bypassDocumentValidation?: boolean;
    }, isMany?: boolean): Promise<DeleteWriteOpResultObject>;
    /**
     * Finds a collection of documents by query.
     *
     * @param query the Mongodb filter query.
     * @param options Mongodb find options.
     */
    find(query?: FilterQuery<T>, options?: IFindOneOptions<T>): Promise<T[]>;
    /**
     * Finds a collection of documents by query excluding documents defined by "excludeKey".
     *
     * @param query the Mongodb filter query.
     * @param options Mongodb find options.
     */
    findIncluded(query?: FilterQuery<T>, options?: IFindOneOptions<T>, cb?: MongoCallback<T | null>): Promise<T[]>;
    findOneIncluded(query?: FilterQuery<T>, options?: IFindOneOptions<T>, cb?: MongoCallback<T | null>): Promise<T>;
    /**
     * Finds one document by query.
     *
     * @param query the Mongodb filter query.
     * @param options Mongodb find options.
     * @param cb an optional callback instead of using promise.
     */
    findOne(query: FilterQuery<T>, options: IFindOneOptions<T>, cb?: MongoCallback<T | null>): Promise<T>;
    /**
     * Finds one document by query.
     *
     * @param query the Mongodb filter query.
     * @param options Mongodb find options.
     * @param cb an optional callback instead of using promise.
     */
    findOne(query: FilterQuery<T>, cb?: MongoCallback<T | null>): Promise<T>;
    /**
     * Finds one document by id.
     *
     * @param id the id of the document to find.
     * @param options Mongodb find options.
     * @param cb an optional callback instead of using promise.
     */
    findId(id: LikeObjectId, options: IFindOneOptions<T>, cb?: MongoCallback<T | null>): Promise<T>;
    /**
     * Finds one document by id.
     *
     * @param id the id of the document to find.
     * @param options Mongodb find options.
     * @param cb an optional callback instead of using promise.
     */
    findId(id: LikeObjectId, cb?: MongoCallback<T | null>): Promise<T>;
    /**
     * Finds one document by query then converts to Model.
     *
     * @param id the id of the document to find.
     * @param FindModel the model to convert result to.
     * @param options optional find one options.
     * @param cb an optional callback instead of using promise.
     */
    findModel(id: LikeObjectId, options?: IFindOneOptions<T>, cb?: MongoCallback<(M & T) | null>): Promise<M & T>;
    /**
     * Finds one document by query then converts to Model.
     *
     * @param id the id of the document to find.
     * @param FindModel the model to convert result to.
     * @param options optional find one options.
     * @param cb an optional callback instead of using promise.
     */
    findModel(query: FilterQuery<T>, options?: IFindOneOptions<T>, cb?: MongoCallback<(M & T) | null>): Promise<M & T>;
    /**
     * Finds a document and then updates.
     *
     * @param query the filter for finding the document.
     * @param update the update to be applied.
     * @param options the update options.
     * @param cb optional callback to use instead of Promise.
     */
    findUpdate(query: LikeObjectId | FilterQuery<T>, update: UpdateQuery<Partial<T>> | Partial<T>, options?: FindOneAndUpdateOption<T>, cb?: MongoCallback<FindAndModifyWriteOpResultObject<T>>): Promise<FindAndModifyWriteOpResultObject<T>>;
    /**
     * Finds a document and then updates.
     *
     * @param query the filter for finding the document.
     * @param update the update to be applied.
     * @param options the update options.
     * @param cb optional callback to use instead of Promise.
     */
    findExclude(query: LikeObjectId | FilterQuery<T>, update: UpdateQuery<Partial<T>> | Partial<T>, options?: FindOneAndUpdateOption<T>, cb?: MongoCallback<FindAndModifyWriteOpResultObject<T>>): Promise<FindAndModifyWriteOpResultObject<T>>;
    /**
     * Finds a document and then deletes.
     *
     * @param query the filter for finding the document.
     * @param options the update options.
     * @param cb optional callback to use instead of Promise.
     */
    findDelete(query: LikeObjectId | FilterQuery<T>, options?: IFindOneAndDeleteOption<T>, cb?: MongoCallback<FindAndModifyWriteOpResultObject<T>>): Promise<FindAndModifyWriteOpResultObject<T>>;
    /**
     * Creates multiple documents in database.
     *
     * @param docs the documents to be persisted to database.
     * @param options Mongodb insert many options.
     * @param cb optional callback to use instead of promise.
     */
    create(docs: OptionalId<T>[], options: CollectionInsertManyOptions, cb?: MongoCallback<InsertWriteOpResult<T & {
        _id: any;
    }>>): Promise<InsertWriteOpResult<T & {
        _id: any;
    }>>;
    /**
     * Creates multiple documents in database.
     *
     * @param docs the documents to be persisted to database.
     * @param options Mongodb insert many options.
     * @param cb optional callback to use instead of promise.
     */
    create(docs: OptionalId<T>[], cb?: MongoCallback<InsertWriteOpResult<T & {
        _id: any;
    }>>): Promise<InsertWriteOpResult<T & {
        _id: any;
    }>>;
    /**
     * Creates document in database.
     *
     * @param doc the document to be persisted to database.
     * @param options Mongodb insert one options.
     * @param cb optional callback to use instead of promise.
     */
    createOne(doc: OptionalId<T>, options: CollectionInsertOneOptions, cb?: MongoCallback<InsertOneWriteOpResult<T & {
        _id: any;
    }>>): Promise<InsertOneWriteOpResult<T & {
        _id: any;
    }>>;
    /**
     * Creates document in database.
     *
     * @param doc the document to be persisted to database.
     * @param options Mongodb insert one options.
     * @param cb optional callback to use instead of promise.
     */
    createOne(doc: OptionalId<T>, cb?: MongoCallback<InsertOneWriteOpResult<T & {
        _id: any;
    }>>): Promise<InsertOneWriteOpResult<T & {
        _id: any;
    }>>;
    /**
     * Updates multiple documents by query.
     *
     * @param query the Mongodb filter for finding the desired documents to update.
     * @param update the update query to be applied.
     * @param options Mongodb update options.
     * @param cb optional callback to use instead of promise.
     */
    update(query: FilterQuery<T>, update: UpdateQuery<Partial<T>> | Partial<T>, options: UpdateManyOptions, cb?: MongoCallback<UpdateWriteOpResult>): Promise<UpdateWriteOpResult>;
    /**
     * Updates multiple documents by query.
     *
     * @param query the Mongodb filter for finding the desired documents to update.
     * @param update the update query to be applied.
     * @param options Mongodb update options.
     * @param cb optional callback to use instead of promise.
     */
    update(query: FilterQuery<T>, update: UpdateQuery<Partial<T>> | Partial<T>, cb?: MongoCallback<UpdateWriteOpResult>): Promise<UpdateWriteOpResult>;
    /**
     * Updates one document by id.
     *
     * @param id the id of the document to update by.
     * @param update the update query to be applied.
     * @param options Mongodb update options.
     * @param cb optional callback to use instead of promise.
     */
    updateOne(id: LikeObjectId, update: UpdateQuery<Partial<T>> | Partial<T>, options: UpdateOneOptions, cb?: MongoCallback<UpdateWriteOpResult>): Promise<UpdateWriteOpResult>;
    /**
     * Updates one document by id.
     *
     * @param id the id of the document to update by.
     * @param update the update query to be applied.
     * @param options Mongodb update options.
     * @param cb optional callback to use instead of promise.
     */
    updateOne(id: LikeObjectId, update: UpdateQuery<Partial<T>> | Partial<T>, cb?: MongoCallback<UpdateWriteOpResult>): Promise<UpdateWriteOpResult>;
    /**
     * Updates one document by id.
     *
     * @param id the id of the document to update by.
     * @param update the update query to be applied.
     * @param options Mongodb update options.
     * @param cb optional callback to use instead of promise.
     */
    updateOne(query: FilterQuery<T>, update: UpdateQuery<Partial<T>> | Partial<T>, options: UpdateOneOptions, cb?: MongoCallback<UpdateWriteOpResult>): Promise<UpdateWriteOpResult>;
    /**
     * Updates one document by id.
     *
     * @param id the id of the document to update by.
     * @param update the update query to be applied.
     * @param options Mongodb update options.
     * @param cb optional callback to use instead of promise.
     */
    updateOne(query: FilterQuery<T>, update: UpdateQuery<Partial<T>> | Partial<T>, cb?: MongoCallback<UpdateWriteOpResult>): Promise<UpdateWriteOpResult>;
    /**
     * Excludes multiple documents by query by updating and tagging documents as
     * exlcuded/deleted without removing.
     *
     * @param query the Mongodb filter for finding the desired documents to exclude softly.
     * @param update the exclude query to be applied.
     * @param options Mongodb update options.
     * @param cb optional callback to use instead of promise.
     */
    exclude(query: FilterQuery<T>, update: UpdateQuery<Partial<T>> | Partial<T>, options: UpdateManyOptions, cb?: MongoCallback<UpdateWriteOpResult>): Promise<UpdateWriteOpResult>;
    /**
     * Excludes multiple documents by query by updating and tagging documents as
     * exlcuded/deleted without removing.
     *
     * @param query the Mongodb filter for finding the desired documents to exclude softly.
     * @param update the exclude query to be applied.
     * @param options Mongodb update options.
     * @param cb optional callback to use instead of promise.
     */
    exclude(query: FilterQuery<T>, update?: UpdateQuery<Partial<T>> | Partial<T>, cb?: MongoCallback<UpdateWriteOpResult>): Promise<UpdateWriteOpResult>;
    /**
     * Excludes one document by id marking as deleted.
     *
     * @param id the id of the document to be excluded softly.
     * @param update the exclude query to be applied.
     * @param options Mongodb update options.
     * @param cb optional callback to use instead of promise.
     */
    excludeOne(id: LikeObjectId, update: UpdateQuery<Partial<T>> | Partial<T>, options: UpdateOneOptions, cb?: MongoCallback<UpdateWriteOpResult>): Promise<UpdateWriteOpResult>;
    /**
     * Excludes one document by id marking as deleted.
     *
     * @param id the id of the document to be excluded softly.
     * @param update the exclude query to be applied.
     * @param options Mongodb update options.
     * @param cb optional callback to use instead of promise.
     */
    excludeOne(id: LikeObjectId, update: UpdateQuery<Partial<T>> | Partial<T>, cb?: MongoCallback<UpdateWriteOpResult>): Promise<UpdateWriteOpResult>;
    /**
     * Excludes one document by id marking as deleted.
     *
     * @param id the id of the document to be excluded softly.
     * @param update the exclude query to be applied.
     * @param options Mongodb update options.
     * @param cb optional callback to use instead of promise.
     */
    excludeOne(query: FilterQuery<T>, update: UpdateQuery<Partial<T>> | Partial<T>, options: UpdateOneOptions, cb?: MongoCallback<UpdateWriteOpResult>): Promise<UpdateWriteOpResult>;
    /**
     * Excludes one document by id marking as deleted.
     *
     * @param id the id of the document to be excluded softly.
     * @param update the exclude query to be applied.
     * @param options Mongodb update options.
     * @param cb optional callback to use instead of promise.
     */
    excludeOne(query: FilterQuery<T>, update?: UpdateQuery<Partial<T>> | Partial<T>, cb?: MongoCallback<UpdateWriteOpResult>): Promise<UpdateWriteOpResult>;
    /**
     * Deletes multiple documents by query.
     *
     * @param query the Mongodb filter for finding the desired documents to delete.
     * @param options Mongodb delete options.
     * @param cb optional callback to use instead of promise.
     */
    delete(query: FilterQuery<T>, options: CommonOptions, cb?: MongoCallback<DeleteWriteOpResultObject>): Promise<DeleteWriteOpResultObject>;
    /**
     * Deletes multiple documents by query.
     *
     * @param query the Mongodb filter for finding the desired documents to delete.
     * @param options Mongodb delete options.
     * @param cb optional callback to use instead of promise.
     */
    delete(query: FilterQuery<T>, cb?: MongoCallback<DeleteWriteOpResultObject>): Promise<DeleteWriteOpResultObject>;
    /**
     * Deletes one document by id.
     *
     * @param id the id of the document to be deleted.
     * @param options Mongodb delete options.
     * @param cb optional callback to use instead of promise.
     */
    deleteOne(id: LikeObjectId, options: CommonOptions & {
        bypassDocumentValidation?: boolean;
    }, cb?: MongoCallback<DeleteWriteOpResultObject>): Promise<DeleteWriteOpResultObject>;
    /**
     * Deletes one document by id.
     *
     * @param id the id of the document to be deleted.
     * @param options Mongodb delete options.
     * @param cb optional callback to use instead of promise.
     */
    deleteOne(id: LikeObjectId, cb?: MongoCallback<DeleteWriteOpResultObject>): Promise<DeleteWriteOpResultObject>;
    /**
     * Deletes one document by id.
     *
     * @param id the id of the document to be deleted.
     * @param options Mongodb delete options.
     * @param cb optional callback to use instead of promise.
     */
    deleteOne(query: FilterQuery<T>, options?: CommonOptions & {
        bypassDocumentValidation?: boolean;
    }, cb?: MongoCallback<DeleteWriteOpResultObject>): Promise<DeleteWriteOpResultObject>;
    /**
     * Deletes one document by id.
     *
     * @param id the id of the document to be deleted.
     * @param options Mongodb delete options.
     * @param cb optional callback to use instead of promise.
     */
    deleteOne(query: FilterQuery<T>, cb?: MongoCallback<DeleteWriteOpResultObject>): Promise<DeleteWriteOpResultObject>;
    pre<A1 = any, A2 = any, A3 = any>(type: HookType, handler: DocumentHook<A1, A2, A3>): any;
    post<A1_1 = any, A2_1 = any, A3_1 = any>(type: HookType, handler: DocumentHook<A1_1, A2_1, A3_1>): any;
};
