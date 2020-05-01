import { FilterQuery, UpdateQuery, ObjectId, DeleteWriteOpResultObject, CollectionInsertOneOptions, CollectionInsertManyOptions, UpdateManyOptions, UpdateOneOptions, CommonOptions, Db, MongoClient, FindOneAndUpdateOption, MongoCallback, FindAndModifyWriteOpResultObject, InsertOneWriteOpResult, InsertWriteOpResult, UpdateWriteOpResult } from 'mongodb';
import { ISchema, ICascadeResult, IFindOneOptions, Constructor, IDoc, DocumentHook, Joins, IFindOneAndDeleteOption } from './types';
import { Model as BaseModel } from './model';
import { ObjectSchema, ValidateOptions } from 'yup';
import { KnectMongo } from './knect';
export declare type HookType = 'find' | 'create' | 'update' | 'delete';
/**
 * Initializes a new Knect Document.
 *
 * @param config the configuration with schema.
 * @param client the MongoClient instance.
 * @param db the Mongo database connection.
 * @param Model the BaseModel type for creating models.
 */
export declare function initDocument<S extends IDoc, M extends BaseModel<S>>(config?: ISchema<S>, client?: MongoClient, db?: Db, Model?: Constructor<M>, knect?: KnectMongo): {
    new (doc?: S): {};
    knect: KnectMongo;
    collectionName: string;
    schema: ISchema<S>;
    readonly client: MongoClient;
    readonly db: Db;
    readonly collection: import("mongodb").Collection<S>;
    /**
     * Convert value to ObjectID.
     *
     * @param id the Like id value to convert to Mongodb ObjectID.
     */
    toObjectID(id: string | number | ObjectId): ObjectId;
    /**
     * Convert value to ObjectID.
     *
     * @param id the Like id value to convert to Mongodb ObjectID.
     */
    toObjectID(ids: (string | number | ObjectId)[]): ObjectId[];
    /**
     * Normalizes query.
     *
     * @param query the Mongodb filter query.
     */
    toQuery(query: string | number | ObjectId | FilterQuery<S>): FilterQuery<S>;
    /**
     * Normalizes update query so that $set is always present.
     *
     * @param update the update query to be applied.
     */
    toUpdate(update: Partial<S> | UpdateQuery<Partial<S>>): UpdateQuery<Partial<S>>;
    /**
     * Converts Joins<S> to cascade keys.
     *
     * @param joins object containing joins to build list from.
     * @param filter an array of keys to exclude.
     */
    toCascades(joins: Joins<S>, ...filter: string[]): string[];
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
     * @param schema the schema to validate against.
     * @param options the validation options to be applied.
     */
    isValid(doc: S, schema?: ObjectSchema<S>, options?: ValidateOptions): boolean;
    /**
     * Validates a document against schema.
     *
     * @param doc the document to be validated.
     * @param schema the schema to validate against.
     * @param options the validation options to be applied.
     */
    validate(doc: S, schema?: ObjectSchema<S>, options?: ValidateOptions): S;
    /**
     * Populates document with specified joins.
     *
     * @param doc the document to populate joins for.
     * @param join the join config, configs or array of join names.
     */
    populate(doc: S, join: string | string[] | Joins<S>): Promise<S>;
    /**
     * Populates document with specified joins.
     *
     * @param doc the document to populate joins for.
     * @param join the join config, configs or array of join names.
     */
    populate(docs: S[], join: string | string[] | Joins<S>): Promise<S[]>;
    /**
     * Iterates populated prop and restores to join key.
     *
     * @param doc the document to be unpopulated.
     * @param join the join string array or Joins<S> object.
     */
    unpopulate(doc: S, join?: string | string[] | Joins<S>): S;
    /**
     * Iterates populated prop and restores to join key.
     *
     * @param doc the document to be unpopulated.
     * @param join the join string array or Joins<S> object.
     */
    unpopulate(docs: S[], join?: string | string[] | Joins<S>): S[];
    /**
     * Cascades delete with specified joins.
     *
     * @param doc the document to populate joins for.
     * @param join the join string array or Joins<S> object.
     */
    cascade(doc: S, join: string | string[] | Joins<S>): Promise<ICascadeResult<S>>;
    /**
     * Cascades delete with specified joins.
     *
     * @param doc the document to populate joins for.
     * @param join the join string array or Joins<S> object.
     */
    cascade(doc: S[], join: string | string[] | Joins<S>): Promise<ICascadeResult<S>[]>;
    /**
     * Casts to new type.
     *
     * @param doc the document to be cast.
     * @param include when true only the specified props are included.
     * @param props the list of props to include if empty, all included.
     */
    cast<T extends Partial<S>>(doc: T, include?: true, ...props: Extract<keyof T, string>[]): T;
    /**
     * Casts to new type.
     *
     * @param doc the document to be cast.
     * @param include when true only the specified props are included.
     * @param props the list of props to include if empty, all included.
     */
    cast<T_1 extends Partial<S>>(doc: T_1, ...omit: Extract<keyof T_1, string>[]): T_1;
    /**
     * Casts to new type.
     *
     * @param doc the document to be cast.
     * @param include when true only the specified props are included.
     * @param props the list of props to include if empty, all included.
     */
    cast<T_2 extends Partial<S>>(docs: T_2[], include?: true, ...props: Extract<keyof T_2, string>[]): T_2[];
    /**
     * Casts to new type.
     *
     * @param doc the document to be cast.
     * @param include when true only the specified props are included.
     * @param props the list of props to include if empty, all included.
     */
    cast<T_3 extends Partial<S>>(docs: T_3[], ...omit: Extract<keyof T_3, string>[]): T_3[];
    /**
     * Internal method to handle all responses.
     *
     * @param promise a promise to be handled.
     * @param cb an optional callback to be called with error or data.
     */
    _handleResponse<T_4, E>(promise: T_4 | Promise<T_4>, cb?: (err: E, data: T_4) => void): Promise<T_4>;
    /**
     * Common handler finds a document or collection of documents by query.
     *
     * @param query the Mongodb filter query.
     * @param options Mongodb find options.
     * @param isMany when true find many.
     * @param cb optional callback instead of promise.
     */
    _find(query?: FilterQuery<S>, options?: IFindOneOptions, isMany?: boolean): Promise<S | S[]>;
    /**
     * Common handler to create single or multiple documents in database.
     *
     * @param docs the documents to be persisted to database.
     * @param options Mongodb insert many options.
     */
    _create(doc: S | S[], options?: CollectionInsertOneOptions | CollectionInsertManyOptions): Promise<InsertWriteOpResult<import("mongodb").WithId<S>>> | Promise<InsertOneWriteOpResult<import("mongodb").WithId<S>>>;
    /**
     * Common update handler to update single or multiple documents by query.
     *
     * @param query the Mongodb filter for finding the desired documents to update.
     * @param update the update query to be applied.
     * @param options Mongodb update options.
     * @param isMany when true update many.
     */
    _update(query: FilterQuery<S>, update: Partial<S> | UpdateQuery<Partial<S>>, options?: UpdateOneOptions | UpdateManyOptions, isMany?: boolean): Promise<UpdateWriteOpResult>;
    /**
     * Common delete hander to delete multiple or single documents by query.
     *
     * @param query the Mongodb filter for finding the desired documents to update.
     * @param options Mongodb update options.
     * @param isMany when true uses collection.deleteMany().
     */
    _delete(query: FilterQuery<S>, options?: CommonOptions & {
        bypassDocumentValidation?: boolean;
    }, isMany?: boolean): Promise<DeleteWriteOpResultObject>;
    /**
     * Finds a collection of documents by query.
     *
     * @param query the Mongodb filter query.
     * @param options Mongodb find options.
     */
    find(query?: FilterQuery<S>, options?: IFindOneOptions): Promise<S[]>;
    /**
     * Finds one document by query.
     *
     * @param id the id of the document to find.
     * @param options Mongodb find options.
     * @param cb an optional callback instead of using promise.
     */
    findOne(id: string | number | ObjectId, options: IFindOneOptions, cb?: MongoCallback<S>): Promise<S>;
    /**
     * Finds one document by query.
     *
     * @param id the id of the document to find.
     * @param options Mongodb find options.
     * @param cb an optional callback instead of using promise.
     */
    findOne(id: string | number | ObjectId, cb?: MongoCallback<S>): Promise<S>;
    /**
     * Finds one document by query.
     *
     * @param id the id of the document to find.
     * @param options Mongodb find options.
     * @param cb an optional callback instead of using promise.
     */
    findOne(query: FilterQuery<S>, options: IFindOneOptions, cb?: MongoCallback<S>): Promise<S>;
    /**
     * Finds one document by query.
     *
     * @param id the id of the document to find.
     * @param options Mongodb find options.
     * @param cb an optional callback instead of using promise.
     */
    findOne(query: FilterQuery<S>, cb?: MongoCallback<S>): Promise<S>;
    /**
     * Finds one document by query then converts to Model.
     *
     * @param id the id of the document to find.
     * @param FindModel the model to convert result to.
     * @param options optional find one options.
     * @param cb an optional callback instead of using promise.
     */
    findModel(id: string | number | ObjectId, options?: IFindOneOptions, cb?: MongoCallback<M & S>): Promise<M & S>;
    /**
     * Finds one document by query then converts to Model.
     *
     * @param id the id of the document to find.
     * @param FindModel the model to convert result to.
     * @param options optional find one options.
     * @param cb an optional callback instead of using promise.
     */
    findModel(query: FilterQuery<S>, options?: IFindOneOptions, cb?: MongoCallback<M & S>): Promise<M & S>;
    /**
     * Finds a document and then updates.
     *
     * @param query the filter for finding the document.
     * @param update the update to be applied.
     * @param options the update options.
     * @param cb optional callback to use instead of Promise.
     */
    findUpdate(query: string | number | ObjectId | FilterQuery<S>, update: Partial<S> | UpdateQuery<Partial<S>>, options?: FindOneAndUpdateOption, cb?: MongoCallback<FindAndModifyWriteOpResultObject<S>>): Promise<FindAndModifyWriteOpResultObject<S>>;
    /**
     * Finds a document and then deletes.
     *
     * @param query the filter for finding the document.
     * @param options the update options.
     * @param cb optional callback to use instead of Promise.
     */
    findDelete(query: string | number | ObjectId | FilterQuery<S>, options?: IFindOneAndDeleteOption<S>, cb?: MongoCallback<FindAndModifyWriteOpResultObject<S>>): Promise<FindAndModifyWriteOpResultObject<S>>;
    /**
     * Finds a document and then replaces it.
     *
     * @param query the filter for finding the document.
     * @param doc the doc used to replace existing.
     * @param options the update options.
     * @param cb optional callback to use instead of Promise.
     */
    /**
     * Creates multiple documents in database.
     *
     * @param docs the documents to be persisted to database.
     * @param options Mongodb insert many options.
     * @param cb optional callback to use instead of promise.
     */
    create(docs: S[], options: CollectionInsertManyOptions, cb?: MongoCallback<InsertWriteOpResult<S & {
        _id: any;
    }>>): Promise<InsertWriteOpResult<S & {
        _id: any;
    }>>;
    /**
     * Finds a document and then replaces it.
     *
     * @param query the filter for finding the document.
     * @param doc the doc used to replace existing.
     * @param options the update options.
     * @param cb optional callback to use instead of Promise.
     */
    /**
     * Creates multiple documents in database.
     *
     * @param docs the documents to be persisted to database.
     * @param options Mongodb insert many options.
     * @param cb optional callback to use instead of promise.
     */
    create(docs: S[], cb?: MongoCallback<InsertWriteOpResult<S & {
        _id: any;
    }>>): Promise<InsertWriteOpResult<S & {
        _id: any;
    }>>;
    /**
     * Creates document in database.
     *
     * @param doc the document to be persisted to database.
     * @param options Mongodb insert one options.
     * @param cb optional callback to use instead of promise.
     */
    createOne(doc: S, options: CollectionInsertOneOptions, cb?: MongoCallback<InsertOneWriteOpResult<S & {
        _id: any;
    }>>): Promise<InsertOneWriteOpResult<S & {
        _id: any;
    }>>;
    /**
     * Creates document in database.
     *
     * @param doc the document to be persisted to database.
     * @param options Mongodb insert one options.
     * @param cb optional callback to use instead of promise.
     */
    createOne(doc: S, cb?: MongoCallback<InsertOneWriteOpResult<S & {
        _id: any;
    }>>): Promise<InsertOneWriteOpResult<S & {
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
    update(query: FilterQuery<S>, update: Partial<S> | UpdateQuery<Partial<S>>, options: UpdateManyOptions, cb?: MongoCallback<UpdateWriteOpResult>): Promise<UpdateWriteOpResult>;
    /**
     * Updates multiple documents by query.
     *
     * @param query the Mongodb filter for finding the desired documents to update.
     * @param update the update query to be applied.
     * @param options Mongodb update options.
     * @param cb optional callback to use instead of promise.
     */
    update(query: FilterQuery<S>, update: Partial<S> | UpdateQuery<Partial<S>>, cb?: MongoCallback<UpdateWriteOpResult>): Promise<UpdateWriteOpResult>;
    /**
     * Updates one document by id.
     *
     * @param id the id of the document to update by.
     * @param update the update query to be applied.
     * @param options Mongodb update options.
     * @param cb optional callback to use instead of promise.
     */
    updateOne(id: string | number | ObjectId, update: Partial<S> | UpdateQuery<Partial<S>>, options: UpdateOneOptions, cb?: MongoCallback<UpdateWriteOpResult>): Promise<UpdateWriteOpResult>;
    /**
     * Updates one document by id.
     *
     * @param id the id of the document to update by.
     * @param update the update query to be applied.
     * @param options Mongodb update options.
     * @param cb optional callback to use instead of promise.
     */
    updateOne(id: string | number | ObjectId, update: Partial<S> | UpdateQuery<Partial<S>>, cb?: MongoCallback<UpdateWriteOpResult>): Promise<UpdateWriteOpResult>;
    /**
     * Updates one document by id.
     *
     * @param id the id of the document to update by.
     * @param update the update query to be applied.
     * @param options Mongodb update options.
     * @param cb optional callback to use instead of promise.
     */
    updateOne(query: FilterQuery<S>, update: Partial<S> | UpdateQuery<Partial<S>>, options: UpdateOneOptions, cb?: MongoCallback<UpdateWriteOpResult>): Promise<UpdateWriteOpResult>;
    /**
     * Updates one document by id.
     *
     * @param id the id of the document to update by.
     * @param update the update query to be applied.
     * @param options Mongodb update options.
     * @param cb optional callback to use instead of promise.
     */
    updateOne(query: FilterQuery<S>, update: Partial<S> | UpdateQuery<Partial<S>>, cb?: MongoCallback<UpdateWriteOpResult>): Promise<UpdateWriteOpResult>;
    /**
     * Deletes multiple documents by query.
     *
     * @param query the Mongodb filter for finding the desired documents to delete.
     * @param options Mongodb delete options.
     * @param cb optional callback to use instead of promise.
     */
    delete(query: FilterQuery<S>, options: CommonOptions, cb?: MongoCallback<DeleteWriteOpResultObject>): Promise<DeleteWriteOpResultObject>;
    /**
     * Deletes multiple documents by query.
     *
     * @param query the Mongodb filter for finding the desired documents to delete.
     * @param options Mongodb delete options.
     * @param cb optional callback to use instead of promise.
     */
    delete(query: FilterQuery<S>, cb?: MongoCallback<DeleteWriteOpResultObject>): Promise<DeleteWriteOpResultObject>;
    /**
     * Deletes one document by id.
     *
     * @param id the id of the document to be deleted.
     * @param options Mongodb delete options.
     * @param cb optional callback to use instead of promise.
     */
    deleteOne(id: string | number | ObjectId, options: CommonOptions & {
        bypassDocumentValidation?: boolean;
    }, cb?: MongoCallback<DeleteWriteOpResultObject>): Promise<DeleteWriteOpResultObject>;
    /**
     * Deletes one document by id.
     *
     * @param id the id of the document to be deleted.
     * @param options Mongodb delete options.
     * @param cb optional callback to use instead of promise.
     */
    deleteOne(id: string | number | ObjectId, cb?: MongoCallback<DeleteWriteOpResultObject>): Promise<DeleteWriteOpResultObject>;
    /**
     * Deletes one document by id.
     *
     * @param id the id of the document to be deleted.
     * @param options Mongodb delete options.
     * @param cb optional callback to use instead of promise.
     */
    deleteOne(query: FilterQuery<S>, options?: CommonOptions & {
        bypassDocumentValidation?: boolean;
    }, cb?: MongoCallback<DeleteWriteOpResultObject>): Promise<DeleteWriteOpResultObject>;
    /**
     * Deletes one document by id.
     *
     * @param id the id of the document to be deleted.
     * @param options Mongodb delete options.
     * @param cb optional callback to use instead of promise.
     */
    deleteOne(query: FilterQuery<S>, cb?: MongoCallback<DeleteWriteOpResultObject>): Promise<DeleteWriteOpResultObject>;
    pre<A1 = any, A2 = any, A3 = any>(type: HookType, handler: DocumentHook<A1, A2, A3>): any;
    post<A1_1 = any, A2_1 = any, A3_1 = any>(type: HookType, handler: DocumentHook<A1_1, A2_1, A3_1>): any;
};
