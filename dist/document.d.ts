import { FilterQuery, UpdateQuery, ObjectId, DeleteWriteOpResultObject, CollectionInsertOneOptions, CollectionInsertManyOptions, UpdateManyOptions, UpdateOneOptions, CommonOptions, Db, MongoClient, FindOneAndUpdateOption, FindOneAndDeleteOption, FindOneAndReplaceOption, MongoCallback, FindAndModifyWriteOpResultObject, InsertOneWriteOpResult, InsertWriteOpResult, UpdateWriteOpResult } from 'mongodb';
import { ISchema, LikeObjectId, IJoins, IJoin, ICascadeResult, IFindOneOptions, Constructor, IDoc, DocumentHook } from './types';
import { BaseModel as BaseModel } from './model';
import { ObjectSchema, ValidateOptions } from 'yup';
export declare type HookType = 'find' | 'create' | 'update' | 'delete';
export declare function initDocument<S extends IDoc, M extends BaseModel<S>>(config?: ISchema<S>, client?: MongoClient, db?: Db, Model?: Constructor<M>): {
    new (doc?: S): {};
    client: MongoClient;
    db: Db;
    collectionName: string;
    schema: ISchema<S>;
    readonly collection: import("mongodb").Collection<S>;
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
     * Converts to simple object document.
     *
     * @param doc the document context to convert.
     */
    toDoc(doc: any): Partial<S>;
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
    populate(doc: S, join: string | string[] | IJoins): Promise<S>;
    /**
     * Populates document with specified joins.
     *
     * @param doc the document to populate joins for.
     * @param join the join config, configs or array of join names.
     */
    populate(docs: S[], join: string | string[] | IJoins): Promise<S[]>;
    /**
     * Cascades delete with specified joins.
     *
     * @param doc the document to populate joins for.
     * @param joins an array or IJoins object of joins.
     */
    cascade(doc: S, joins: string[] | IJoins): Promise<ICascadeResult<S>>;
    /**
     * Cascades delete with specified joins.
     *
     * @param doc the document to populate joins for.
     * @param joins an array or IJoins object of joins.
     */
    cascade(doc: S[], joins: string[] | IJoins): Promise<ICascadeResult<S>[]>;
    /**
     * Cascades delete with specified joins.
     *
     * @param doc the document to populate joins for.
     * @param joins an array or IJoins object of joins.
     */
    cascade(doc: S, key: string, join: IJoin): Promise<ICascadeResult<S>>;
    /**
     * Cascades delete with specified joins.
     *
     * @param doc the document to populate joins for.
     * @param joins an array or IJoins object of joins.
     */
    cascade(doc: S[], key: string, join: IJoin): Promise<ICascadeResult<S>[]>;
    /**
     * Internal method to handle all responses.
     *
     * @param promise a promise to be handled.
     * @param cb an optional callback to be called with error or data.
     */
    _handleResponse<T, E>(promise: T | Promise<T>, cb?: (err: E, data: T) => void): Promise<T>;
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
    _create(doc: S | S[], options?: CollectionInsertOneOptions | CollectionInsertManyOptions): Promise<InsertWriteOpResult<Pick<S, Exclude<keyof S, "_id">> & {
        _id: S extends {
            _id: infer U;
        } ? {} extends U ? Exclude<U, {}> : unknown extends U ? ObjectId : U : ObjectId;
    }>> | Promise<InsertOneWriteOpResult<Pick<S, Exclude<keyof S, "_id">> & {
        _id: S extends {
            _id: infer U;
        } ? {} extends U ? Exclude<U, {}> : unknown extends U ? ObjectId : U : ObjectId;
    }>>;
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
    findOne(id: LikeObjectId, options: IFindOneOptions, cb?: MongoCallback<S>): Promise<S>;
    /**
     * Finds one document by query.
     *
     * @param id the id of the document to find.
     * @param options Mongodb find options.
     * @param cb an optional callback instead of using promise.
     */
    findOne(id: LikeObjectId, cb?: MongoCallback<S>): Promise<S>;
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
    findModel<L extends BaseModel<S>>(id: LikeObjectId, FindModel: Constructor<L>, options: IFindOneOptions, cb?: MongoCallback<L>): Promise<L>;
    /**
     * Finds one document by query then converts to Model.
     *
     * @param id the id of the document to find.
     * @param FindModel the model to convert result to.
     * @param options optional find one options.
     * @param cb an optional callback instead of using promise.
     */
    findModel<L_1 extends BaseModel<S>>(query: FilterQuery<S>, FindModel: Constructor<L_1>, options: IFindOneOptions, cb?: MongoCallback<L_1>): Promise<L_1>;
    /**
     * Finds one document by query then converts to Model.
     *
     * @param id the id of the document to find.
     * @param FindModel the model to convert result to.
     * @param options optional find one options.
     * @param cb an optional callback instead of using promise.
     */
    findModel<L_2 extends BaseModel<S>>(id: LikeObjectId, FindModel: Constructor<L_2>, cb?: MongoCallback<L_2>): Promise<L_2>;
    /**
     * Finds one document by query then converts to Model.
     *
     * @param id the id of the document to find.
     * @param FindModel the model to convert result to.
     * @param options optional find one options.
     * @param cb an optional callback instead of using promise.
     */
    findModel<L_3 extends BaseModel<S>>(query: FilterQuery<S>, FindModel: Constructor<L_3>, cb?: MongoCallback<L_3>): Promise<L_3>;
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
    findDelete(query: string | number | ObjectId | FilterQuery<S>, options?: FindOneAndDeleteOption, cb?: MongoCallback<FindAndModifyWriteOpResultObject<S>>): Promise<FindAndModifyWriteOpResultObject<S>>;
    /**
     * Finds a document and then replaces it.
     *
     * @param query the filter for finding the document.
     * @param doc the doc used to replace existing.
     * @param options the update options.
     * @param cb optional callback to use instead of Promise.
     */
    findReplace(query: string | number | ObjectId | FilterQuery<S>, doc: S, options?: FindOneAndReplaceOption, cb?: MongoCallback<FindAndModifyWriteOpResultObject<S>>): Promise<FindAndModifyWriteOpResultObject<S>>;
    /**
     * Creates multiple documents in database.
     *
     * @param docs the documents to be persisted to database.
     * @param options Mongodb insert many options.
     * @param cb optional callback to use instead of promise.
     */
    create(docs: S[], options: CollectionInsertManyOptions, cb?: MongoCallback<InsertWriteOpResult<S>>): Promise<InsertWriteOpResult<S>>;
    /**
     * Creates multiple documents in database.
     *
     * @param docs the documents to be persisted to database.
     * @param options Mongodb insert many options.
     * @param cb optional callback to use instead of promise.
     */
    create(docs: S[], cb?: MongoCallback<InsertWriteOpResult<S>>): Promise<InsertWriteOpResult<S>>;
    /**
     * Creates document in database.
     *
     * @param doc the document to be persisted to database.
     * @param options Mongodb insert one options.
     * @param cb optional callback to use instead of promise.
     */
    createOne(doc: S, options: CollectionInsertOneOptions, cb?: MongoCallback<InsertOneWriteOpResult<S>>): Promise<InsertOneWriteOpResult<S>>;
    /**
     * Creates document in database.
     *
     * @param doc the document to be persisted to database.
     * @param options Mongodb insert one options.
     * @param cb optional callback to use instead of promise.
     */
    createOne(doc: S, cb?: MongoCallback<InsertOneWriteOpResult<S>>): Promise<InsertOneWriteOpResult<S>>;
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
    updateOne(id: LikeObjectId, update: Partial<S> | UpdateQuery<Partial<S>>, options: UpdateOneOptions, cb?: MongoCallback<UpdateWriteOpResult>): Promise<UpdateWriteOpResult>;
    /**
     * Updates one document by id.
     *
     * @param id the id of the document to update by.
     * @param update the update query to be applied.
     * @param options Mongodb update options.
     * @param cb optional callback to use instead of promise.
     */
    updateOne(id: LikeObjectId, update: Partial<S> | UpdateQuery<Partial<S>>, cb?: MongoCallback<UpdateWriteOpResult>): Promise<UpdateWriteOpResult>;
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
