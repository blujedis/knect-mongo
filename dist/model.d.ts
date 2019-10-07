import { ObjectId, UpdateOneOptions, CollectionInsertOneOptions, FindOneAndDeleteOption, FindOneAndUpdateOption } from 'mongodb';
import { IDoc, IModelSaveResult } from './types';
import { ObjectSchema } from 'yup';
declare const doctype: {
    new (doc?: IDoc): {};
    client: import("mongodb").MongoClient;
    db: import("mongodb").Db;
    collectionName: string;
    schema: import("./types").ISchema<IDoc>;
    readonly collection: import("mongodb").Collection<IDoc>;
    toObjectID(id: import("./types").LikeObjectId): ObjectId;
    toObjectID(ids: import("./types").LikeObjectId[]): ObjectId[];
    toQuery(query: string | number | ObjectId | import("mongodb").FilterQuery<IDoc>): import("mongodb").FilterQuery<IDoc>;
    toUpdate(update: Partial<IDoc> | import("mongodb").UpdateQuery<Partial<IDoc>>): import("mongodb").UpdateQuery<Partial<IDoc>>;
    toDoc(doc: any): Partial<IDoc>;
    isValid(doc: IDoc, schema?: ObjectSchema<IDoc>, options?: import("yup").ValidateOptions): boolean;
    validate(doc: IDoc, schema?: ObjectSchema<IDoc>, options?: import("yup").ValidateOptions): IDoc;
    populate(doc: IDoc, join: string | string[] | import("./types").IJoins): Promise<IDoc>;
    populate(docs: IDoc[], join: string | string[] | import("./types").IJoins): Promise<IDoc[]>;
    cascade(doc: IDoc, joins: string[] | import("./types").IJoins): Promise<import("./types").ICascadeResult<IDoc>>;
    cascade(doc: IDoc[], joins: string[] | import("./types").IJoins): Promise<import("./types").ICascadeResult<IDoc>[]>;
    cascade(doc: IDoc, key: string, join: import("./types").IJoin): Promise<import("./types").ICascadeResult<IDoc>>;
    cascade(doc: IDoc[], key: string, join: import("./types").IJoin): Promise<import("./types").ICascadeResult<IDoc>[]>;
    _handleResponse<T, E>(promise: T | Promise<T>, cb?: (err: E, data: T) => void): Promise<T>;
    _find(query?: import("mongodb").FilterQuery<IDoc>, options?: import("./types").IFindOneOptions, isMany?: boolean): Promise<IDoc | IDoc[]>;
    _create(doc: IDoc | IDoc[], options?: CollectionInsertOneOptions | import("mongodb").CollectionInsertManyOptions): Promise<import("mongodb").InsertWriteOpResult<Pick<IDoc, never> & {
        _id: ObjectId;
    }>> | Promise<import("mongodb").InsertOneWriteOpResult<Pick<IDoc, never> & {
        _id: ObjectId;
    }>>;
    _update(query: import("mongodb").FilterQuery<IDoc>, update: Partial<IDoc> | import("mongodb").UpdateQuery<Partial<IDoc>>, options?: UpdateOneOptions | import("mongodb").UpdateManyOptions, isMany?: boolean): Promise<import("mongodb").UpdateWriteOpResult>;
    _delete(query: import("mongodb").FilterQuery<IDoc>, options?: import("mongodb").CommonOptions & {
        bypassDocumentValidation?: boolean;
    }, isMany?: boolean): Promise<import("mongodb").DeleteWriteOpResultObject>;
    find(query?: import("mongodb").FilterQuery<IDoc>, options?: import("./types").IFindOneOptions): Promise<IDoc[]>;
    findOne(id: import("./types").LikeObjectId, options: import("./types").IFindOneOptions, cb?: import("mongodb").MongoCallback<IDoc>): Promise<IDoc>;
    findOne(id: import("./types").LikeObjectId, cb?: import("mongodb").MongoCallback<IDoc>): Promise<IDoc>;
    findOne(query: import("mongodb").FilterQuery<IDoc>, options: import("./types").IFindOneOptions, cb?: import("mongodb").MongoCallback<IDoc>): Promise<IDoc>;
    findOne(query: import("mongodb").FilterQuery<IDoc>, cb?: import("mongodb").MongoCallback<IDoc>): Promise<IDoc>;
    findModel<L extends BaseModel<IDoc>>(id: import("./types").LikeObjectId, FindModel: import("./types").Constructor<L>, options: import("./types").IFindOneOptions, cb?: import("mongodb").MongoCallback<L>): Promise<L>;
    findModel<L_1 extends BaseModel<IDoc>>(query: import("mongodb").FilterQuery<IDoc>, FindModel: import("./types").Constructor<L_1>, options: import("./types").IFindOneOptions, cb?: import("mongodb").MongoCallback<L_1>): Promise<L_1>;
    findModel<L_2 extends BaseModel<IDoc>>(id: import("./types").LikeObjectId, FindModel: import("./types").Constructor<L_2>, cb?: import("mongodb").MongoCallback<L_2>): Promise<L_2>;
    findModel<L_3 extends BaseModel<IDoc>>(query: import("mongodb").FilterQuery<IDoc>, FindModel: import("./types").Constructor<L_3>, cb?: import("mongodb").MongoCallback<L_3>): Promise<L_3>;
    findUpdate(query: string | number | ObjectId | import("mongodb").FilterQuery<IDoc>, update: Partial<IDoc> | import("mongodb").UpdateQuery<Partial<IDoc>>, options?: FindOneAndUpdateOption, cb?: import("mongodb").MongoCallback<import("mongodb").FindAndModifyWriteOpResultObject<IDoc>>): Promise<import("mongodb").FindAndModifyWriteOpResultObject<IDoc>>;
    findDelete(query: string | number | ObjectId | import("mongodb").FilterQuery<IDoc>, options?: FindOneAndDeleteOption, cb?: import("mongodb").MongoCallback<import("mongodb").FindAndModifyWriteOpResultObject<IDoc>>): Promise<import("mongodb").FindAndModifyWriteOpResultObject<IDoc>>;
    findReplace(query: string | number | ObjectId | import("mongodb").FilterQuery<IDoc>, doc: IDoc, options?: import("mongodb").FindOneAndReplaceOption, cb?: import("mongodb").MongoCallback<import("mongodb").FindAndModifyWriteOpResultObject<IDoc>>): Promise<import("mongodb").FindAndModifyWriteOpResultObject<IDoc>>;
    create(docs: IDoc[], options: import("mongodb").CollectionInsertManyOptions, cb?: import("mongodb").MongoCallback<import("mongodb").InsertWriteOpResult<IDoc>>): Promise<import("mongodb").InsertWriteOpResult<IDoc>>;
    create(docs: IDoc[], cb?: import("mongodb").MongoCallback<import("mongodb").InsertWriteOpResult<IDoc>>): Promise<import("mongodb").InsertWriteOpResult<IDoc>>;
    createOne(doc: IDoc, options: CollectionInsertOneOptions, cb?: import("mongodb").MongoCallback<import("mongodb").InsertOneWriteOpResult<IDoc>>): Promise<import("mongodb").InsertOneWriteOpResult<IDoc>>;
    createOne(doc: IDoc, cb?: import("mongodb").MongoCallback<import("mongodb").InsertOneWriteOpResult<IDoc>>): Promise<import("mongodb").InsertOneWriteOpResult<IDoc>>;
    update(query: import("mongodb").FilterQuery<IDoc>, update: Partial<IDoc> | import("mongodb").UpdateQuery<Partial<IDoc>>, options: import("mongodb").UpdateManyOptions, cb?: import("mongodb").MongoCallback<import("mongodb").UpdateWriteOpResult>): Promise<import("mongodb").UpdateWriteOpResult>;
    update(query: import("mongodb").FilterQuery<IDoc>, update: Partial<IDoc> | import("mongodb").UpdateQuery<Partial<IDoc>>, cb?: import("mongodb").MongoCallback<import("mongodb").UpdateWriteOpResult>): Promise<import("mongodb").UpdateWriteOpResult>;
    updateOne(id: import("./types").LikeObjectId, update: Partial<IDoc> | import("mongodb").UpdateQuery<Partial<IDoc>>, options: UpdateOneOptions, cb?: import("mongodb").MongoCallback<import("mongodb").UpdateWriteOpResult>): Promise<import("mongodb").UpdateWriteOpResult>;
    updateOne(id: import("./types").LikeObjectId, update: Partial<IDoc> | import("mongodb").UpdateQuery<Partial<IDoc>>, cb?: import("mongodb").MongoCallback<import("mongodb").UpdateWriteOpResult>): Promise<import("mongodb").UpdateWriteOpResult>;
    updateOne(query: import("mongodb").FilterQuery<IDoc>, update: Partial<IDoc> | import("mongodb").UpdateQuery<Partial<IDoc>>, options: UpdateOneOptions, cb?: import("mongodb").MongoCallback<import("mongodb").UpdateWriteOpResult>): Promise<import("mongodb").UpdateWriteOpResult>;
    updateOne(query: import("mongodb").FilterQuery<IDoc>, update: Partial<IDoc> | import("mongodb").UpdateQuery<Partial<IDoc>>, cb?: import("mongodb").MongoCallback<import("mongodb").UpdateWriteOpResult>): Promise<import("mongodb").UpdateWriteOpResult>;
    delete(query: import("mongodb").FilterQuery<IDoc>, options: import("mongodb").CommonOptions, cb?: import("mongodb").MongoCallback<import("mongodb").DeleteWriteOpResultObject>): Promise<import("mongodb").DeleteWriteOpResultObject>;
    delete(query: import("mongodb").FilterQuery<IDoc>, cb?: import("mongodb").MongoCallback<import("mongodb").DeleteWriteOpResultObject>): Promise<import("mongodb").DeleteWriteOpResultObject>;
    deleteOne(id: import("./types").LikeObjectId, options: import("mongodb").CommonOptions & {
        bypassDocumentValidation?: boolean;
    }, cb?: import("mongodb").MongoCallback<import("mongodb").DeleteWriteOpResultObject>): Promise<import("mongodb").DeleteWriteOpResultObject>;
    deleteOne(id: import("./types").LikeObjectId, cb?: import("mongodb").MongoCallback<import("mongodb").DeleteWriteOpResultObject>): Promise<import("mongodb").DeleteWriteOpResultObject>;
    deleteOne(query: import("mongodb").FilterQuery<IDoc>, options?: import("mongodb").CommonOptions & {
        bypassDocumentValidation?: boolean;
    }, cb?: import("mongodb").MongoCallback<import("mongodb").DeleteWriteOpResultObject>): Promise<import("mongodb").DeleteWriteOpResultObject>;
    deleteOne(query: import("mongodb").FilterQuery<IDoc>, cb?: import("mongodb").MongoCallback<import("mongodb").DeleteWriteOpResultObject>): Promise<import("mongodb").DeleteWriteOpResultObject>;
    pre<A1 = any, A2 = any, A3 = any>(type: import("./document").HookType, handler: import("./types").DocumentHook<A1, A2, A3>): any;
    post<A1_1 = any, A2_1 = any, A3_1 = any>(type: import("./document").HookType, handler: import("./types").DocumentHook<A1_1, A2_1, A3_1>): any;
};
declare type Document = typeof doctype;
export declare class BaseModel<S extends IDoc> {
    private _Document;
    _id: ObjectId;
    _doc: S;
    constructor(doc: S, document: Document);
    /**
     * Creates and persists instance to database.
     *
     * @param options Mongodb create options.
     */
    private create;
    /**
     * Updates a single record by id.
     *
     * @param options the update options.
     */
    private update;
    /**
     * Saves changes persisting instance in database.
     *
     * @param options MongoDB update options.
     */
    save(options?: UpdateOneOptions | CollectionInsertOneOptions): Promise<IModelSaveResult<S>>;
    /**
     * Deletes document persisting in database.
     *
     * @param options Mongodb delete options.
     */
    delete(options?: FindOneAndDeleteOption): Promise<import("mongodb").FindAndModifyWriteOpResultObject<IDoc>>;
    /**
     * Propulates child values based on join configurations.
     *
     * @param names the names of joins that should be populated.
     */
    populate(...names: string[]): Promise<IDoc>;
    /**
     * Validates instance against schema.
     *
     * @param schema optional schema to verify by or uses defined.
     */
    validate(schema?: ObjectSchema<S>): IDoc;
    /**
     * Checks if instance is valid against schema.
     *
     * @param schema optional schema to verify by or uses defined.
     */
    isValid(schema?: ObjectSchema<S>): boolean;
}
export {};
