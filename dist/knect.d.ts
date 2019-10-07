import { MongoClient, MongoClientOptions, Db } from 'mongodb';
import { ISchema, Constructor } from './types';
import { BaseModel } from './model';
export declare const MONGO_CLIENT_DEFAULTS: {
    useNewUrlParser: boolean;
    useUnifiedTopology: boolean;
};
export declare class KnectMongo {
    dbname: string;
    db: Db;
    client: MongoClient;
    schemas: Map<string, ISchema<any>>;
    delimiter: string;
    /**
     * Accepts a schema and creates model with static and instance convenience methods.
     *
     * @param name the name of the collection
     * @param schema the schema configuration containing document validation.
     */
    private createModel;
    /**
     * Connects to Mongodb instance.
     *
     * @param uri the Mongodb connection uri.
     * @param options Mongodb client connection options.
     */
    connect(uri: string, options?: MongoClientOptions): Promise<Db>;
    /**
     * Accepts a schema and creates model with static and instance convenience methods.
     *
     * @param ns the namespace for the schema.
     * @param schema the schema configuration containing document validation.
     * @param collectionName specify the collection name otherwise schema name is used.
     */
    model<S extends object>(ns: string, schema?: ISchema<S>): {
        new (doc?: S): {};
        client: MongoClient;
        db: Db;
        collectionName: string;
        schema: ISchema<S>;
        readonly collection: import("mongodb").Collection<S>;
        toObjectID(id: import("./types").LikeObjectId): import("bson").ObjectId;
        toObjectID(ids: import("./types").LikeObjectId[]): import("bson").ObjectId[];
        toQuery(query: string | number | import("bson").ObjectId | import("mongodb").FilterQuery<S>): import("mongodb").FilterQuery<S>;
        toUpdate(update: Partial<S> | import("mongodb").UpdateQuery<Partial<S>>): import("mongodb").UpdateQuery<Partial<S>>;
        toDoc(doc: any): Partial<S>;
        isValid(doc: S, schema?: import("yup").ObjectSchema<S>, options?: import("yup").ValidateOptions): boolean;
        validate(doc: S, schema?: import("yup").ObjectSchema<S>, options?: import("yup").ValidateOptions): S;
        populate(doc: S, join: string | string[] | import("./types").IJoins): Promise<S>;
        populate(docs: S[], join: string | string[] | import("./types").IJoins): Promise<S[]>;
        cascade(doc: S, joins: string[] | import("./types").IJoins): Promise<import("./types").ICascadeResult<S>>;
        cascade(doc: S[], joins: string[] | import("./types").IJoins): Promise<import("./types").ICascadeResult<S>[]>;
        cascade(doc: S, key: string, join: import("./types").IJoin): Promise<import("./types").ICascadeResult<S>>;
        cascade(doc: S[], key: string, join: import("./types").IJoin): Promise<import("./types").ICascadeResult<S>[]>;
        _handleResponse<T, E>(promise: T | Promise<T>, cb?: (err: E, data: T) => void): Promise<T>;
        _find(query?: import("mongodb").FilterQuery<S>, options?: import("./types").IFindOneOptions, isMany?: boolean): Promise<S | S[]>;
        _create(doc: S | S[], options?: import("mongodb").CollectionInsertOneOptions | import("mongodb").CollectionInsertManyOptions): Promise<import("mongodb").InsertWriteOpResult<Pick<S, Exclude<keyof S, "_id">> & {
            _id: S extends {
                _id: infer U;
            } ? {} extends U ? Exclude<U, {}> : unknown extends U ? import("bson").ObjectId : U : import("bson").ObjectId;
        }>> | Promise<import("mongodb").InsertOneWriteOpResult<Pick<S, Exclude<keyof S, "_id">> & {
            _id: S extends {
                _id: infer U;
            } ? {} extends U ? Exclude<U, {}> : unknown extends U ? import("bson").ObjectId : U : import("bson").ObjectId;
        }>>;
        _update(query: import("mongodb").FilterQuery<S>, update: Partial<S> | import("mongodb").UpdateQuery<Partial<S>>, options?: import("mongodb").UpdateOneOptions | import("mongodb").UpdateManyOptions, isMany?: boolean): Promise<import("mongodb").UpdateWriteOpResult>;
        _delete(query: import("mongodb").FilterQuery<S>, options?: import("mongodb").CommonOptions & {
            bypassDocumentValidation?: boolean;
        }, isMany?: boolean): Promise<import("mongodb").DeleteWriteOpResultObject>;
        find(query?: import("mongodb").FilterQuery<S>, options?: import("./types").IFindOneOptions): Promise<S[]>;
        findOne(id: import("./types").LikeObjectId, options: import("./types").IFindOneOptions, cb?: import("mongodb").MongoCallback<S>): Promise<S>;
        findOne(id: import("./types").LikeObjectId, cb?: import("mongodb").MongoCallback<S>): Promise<S>;
        findOne(query: import("mongodb").FilterQuery<S>, options: import("./types").IFindOneOptions, cb?: import("mongodb").MongoCallback<S>): Promise<S>;
        findOne(query: import("mongodb").FilterQuery<S>, cb?: import("mongodb").MongoCallback<S>): Promise<S>;
        findModel<L extends BaseModel<S>>(id: import("./types").LikeObjectId, FindModel: Constructor<L>, options: import("./types").IFindOneOptions, cb?: import("mongodb").MongoCallback<L>): Promise<L>;
        findModel<L_1 extends BaseModel<S>>(query: import("mongodb").FilterQuery<S>, FindModel: Constructor<L_1>, options: import("./types").IFindOneOptions, cb?: import("mongodb").MongoCallback<L_1>): Promise<L_1>;
        findModel<L_2 extends BaseModel<S>>(id: import("./types").LikeObjectId, FindModel: Constructor<L_2>, cb?: import("mongodb").MongoCallback<L_2>): Promise<L_2>;
        findModel<L_3 extends BaseModel<S>>(query: import("mongodb").FilterQuery<S>, FindModel: Constructor<L_3>, cb?: import("mongodb").MongoCallback<L_3>): Promise<L_3>;
        findUpdate(query: string | number | import("bson").ObjectId | import("mongodb").FilterQuery<S>, update: Partial<S> | import("mongodb").UpdateQuery<Partial<S>>, options?: import("mongodb").FindOneAndUpdateOption, cb?: import("mongodb").MongoCallback<import("mongodb").FindAndModifyWriteOpResultObject<S>>): Promise<import("mongodb").FindAndModifyWriteOpResultObject<S>>;
        findDelete(query: string | number | import("bson").ObjectId | import("mongodb").FilterQuery<S>, options?: import("mongodb").FindOneAndDeleteOption, cb?: import("mongodb").MongoCallback<import("mongodb").FindAndModifyWriteOpResultObject<S>>): Promise<import("mongodb").FindAndModifyWriteOpResultObject<S>>;
        findReplace(query: string | number | import("bson").ObjectId | import("mongodb").FilterQuery<S>, doc: S, options?: import("mongodb").FindOneAndReplaceOption, cb?: import("mongodb").MongoCallback<import("mongodb").FindAndModifyWriteOpResultObject<S>>): Promise<import("mongodb").FindAndModifyWriteOpResultObject<S>>;
        create(docs: S[], options: import("mongodb").CollectionInsertManyOptions, cb?: import("mongodb").MongoCallback<import("mongodb").InsertWriteOpResult<S>>): Promise<import("mongodb").InsertWriteOpResult<S>>;
        create(docs: S[], cb?: import("mongodb").MongoCallback<import("mongodb").InsertWriteOpResult<S>>): Promise<import("mongodb").InsertWriteOpResult<S>>;
        createOne(doc: S, options: import("mongodb").CollectionInsertOneOptions, cb?: import("mongodb").MongoCallback<import("mongodb").InsertOneWriteOpResult<S>>): Promise<import("mongodb").InsertOneWriteOpResult<S>>;
        createOne(doc: S, cb?: import("mongodb").MongoCallback<import("mongodb").InsertOneWriteOpResult<S>>): Promise<import("mongodb").InsertOneWriteOpResult<S>>;
        update(query: import("mongodb").FilterQuery<S>, update: Partial<S> | import("mongodb").UpdateQuery<Partial<S>>, options: import("mongodb").UpdateManyOptions, cb?: import("mongodb").MongoCallback<import("mongodb").UpdateWriteOpResult>): Promise<import("mongodb").UpdateWriteOpResult>;
        update(query: import("mongodb").FilterQuery<S>, update: Partial<S> | import("mongodb").UpdateQuery<Partial<S>>, cb?: import("mongodb").MongoCallback<import("mongodb").UpdateWriteOpResult>): Promise<import("mongodb").UpdateWriteOpResult>;
        updateOne(id: import("./types").LikeObjectId, update: Partial<S> | import("mongodb").UpdateQuery<Partial<S>>, options: import("mongodb").UpdateOneOptions, cb?: import("mongodb").MongoCallback<import("mongodb").UpdateWriteOpResult>): Promise<import("mongodb").UpdateWriteOpResult>;
        updateOne(id: import("./types").LikeObjectId, update: Partial<S> | import("mongodb").UpdateQuery<Partial<S>>, cb?: import("mongodb").MongoCallback<import("mongodb").UpdateWriteOpResult>): Promise<import("mongodb").UpdateWriteOpResult>;
        updateOne(query: import("mongodb").FilterQuery<S>, update: Partial<S> | import("mongodb").UpdateQuery<Partial<S>>, options: import("mongodb").UpdateOneOptions, cb?: import("mongodb").MongoCallback<import("mongodb").UpdateWriteOpResult>): Promise<import("mongodb").UpdateWriteOpResult>;
        updateOne(query: import("mongodb").FilterQuery<S>, update: Partial<S> | import("mongodb").UpdateQuery<Partial<S>>, cb?: import("mongodb").MongoCallback<import("mongodb").UpdateWriteOpResult>): Promise<import("mongodb").UpdateWriteOpResult>;
        delete(query: import("mongodb").FilterQuery<S>, options: import("mongodb").CommonOptions, cb?: import("mongodb").MongoCallback<import("mongodb").DeleteWriteOpResultObject>): Promise<import("mongodb").DeleteWriteOpResultObject>;
        delete(query: import("mongodb").FilterQuery<S>, cb?: import("mongodb").MongoCallback<import("mongodb").DeleteWriteOpResultObject>): Promise<import("mongodb").DeleteWriteOpResultObject>;
        deleteOne(id: import("./types").LikeObjectId, options: import("mongodb").CommonOptions & {
            bypassDocumentValidation?: boolean;
        }, cb?: import("mongodb").MongoCallback<import("mongodb").DeleteWriteOpResultObject>): Promise<import("mongodb").DeleteWriteOpResultObject>;
        deleteOne(id: import("./types").LikeObjectId, cb?: import("mongodb").MongoCallback<import("mongodb").DeleteWriteOpResultObject>): Promise<import("mongodb").DeleteWriteOpResultObject>;
        deleteOne(query: import("mongodb").FilterQuery<S>, options?: import("mongodb").CommonOptions & {
            bypassDocumentValidation?: boolean;
        }, cb?: import("mongodb").MongoCallback<import("mongodb").DeleteWriteOpResultObject>): Promise<import("mongodb").DeleteWriteOpResultObject>;
        deleteOne(query: import("mongodb").FilterQuery<S>, cb?: import("mongodb").MongoCallback<import("mongodb").DeleteWriteOpResultObject>): Promise<import("mongodb").DeleteWriteOpResultObject>;
        pre<A1 = any, A2 = any, A3 = any>(type: import("./document").HookType, handler: import("./types").DocumentHook<A1, A2, A3>): any;
        post<A1_1 = any, A2_1 = any, A3_1 = any>(type: import("./document").HookType, handler: import("./types").DocumentHook<A1_1, A2_1, A3_1>): any;
    } & Constructor<BaseModel<S> & S>;
}
declare const _default: KnectMongo;
export default _default;
