import { MongoClient, MongoClientOptions, Db } from 'mongodb';
import { ISchema, Constructor } from './types';
import { Model } from './model';
import { ModelMap } from './map';
export declare const MONGO_CLIENT_DEFAULTS: {
    useNewUrlParser: boolean;
    useUnifiedTopology: boolean;
};
export declare class KnectMongo {
    dbname: string;
    db: Db;
    client: MongoClient;
    models: ModelMap;
    delimiter: string;
    /**
     * Ensures schema is valid configuration.
     *
     * @param name the name of the schema.
     * @param schema the schema object.
     */
    private normalizeSchema;
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
     */
    model<S extends object>(ns: string, schema?: ISchema<S>): {
        new (doc?: S): {};
        knect: KnectMongo;
        collectionName: string;
        schema: ISchema<S>;
        readonly client: MongoClient;
        readonly db: Db;
        readonly collection: import("mongodb").Collection<S>;
        toObjectID(id: string | number | import("bson").ObjectId): import("bson").ObjectId;
        toObjectID(ids: (string | number | import("bson").ObjectId)[]): import("bson").ObjectId[];
        toQuery(query: string | number | import("bson").ObjectId | import("mongodb").FilterQuery<S>): import("mongodb").FilterQuery<S>;
        toUpdate(update: Partial<S> | import("mongodb").UpdateQuery<Partial<S>>): import("mongodb").UpdateQuery<Partial<S>>;
        toCascades(joins: import("./types").Joins<S>, ...filter: string[]): string[];
        toCascades(...filter: string[]): string[];
        isValid(doc: S, schema?: import("yup").ObjectSchema<S>, options?: import("yup").ValidateOptions): boolean;
        validate(doc: S, schema?: import("yup").ObjectSchema<S>, options?: import("yup").ValidateOptions): S;
        populate(doc: S, join: string | string[] | import("./types").Joins<S>): Promise<S>;
        populate(docs: S[], join: string | string[] | import("./types").Joins<S>): Promise<S[]>;
        unpopulate(doc: S, join?: string | string[] | import("./types").Joins<S>): S;
        unpopulate(docs: S[], join?: string | string[] | import("./types").Joins<S>): S[];
        cascade(doc: S, join: string | string[] | import("./types").Joins<S>): Promise<import("./types").ICascadeResult<S>>;
        cascade(doc: S[], join: string | string[] | import("./types").Joins<S>): Promise<import("./types").ICascadeResult<S>[]>;
        cast<T extends Partial<S>>(doc: T, include?: true, ...props: Extract<keyof T, string>[]): T;
        cast<T_1 extends Partial<S>>(doc: T_1, ...omit: Extract<keyof T_1, string>[]): T_1;
        cast<T_2 extends Partial<S>>(docs: T_2[], include?: true, ...props: Extract<keyof T_2, string>[]): T_2[];
        cast<T_3 extends Partial<S>>(docs: T_3[], ...omit: Extract<keyof T_3, string>[]): T_3[];
        _handleResponse<T_4, E>(promise: T_4 | Promise<T_4>, cb?: (err: E, data: T_4) => void): Promise<T_4>;
        _find(query?: import("mongodb").FilterQuery<S>, options?: import("./types").IFindOneOptions, isMany?: boolean): Promise<S | S[]>;
        _create(doc: import("mongodb").OptionalId<S> | import("mongodb").OptionalId<S>[], options?: import("mongodb").CollectionInsertOneOptions | import("mongodb").CollectionInsertManyOptions): Promise<import("mongodb").InsertWriteOpResult<import("mongodb").WithId<S>>> | Promise<import("mongodb").InsertOneWriteOpResult<import("mongodb").WithId<S>>>;
        _update(query: import("mongodb").FilterQuery<S>, update: Partial<S> | import("mongodb").UpdateQuery<Partial<S>>, options?: import("mongodb").UpdateOneOptions | import("mongodb").UpdateManyOptions, isMany?: boolean): Promise<import("mongodb").UpdateWriteOpResult>;
        _delete(query: import("mongodb").FilterQuery<S>, options?: import("mongodb").CommonOptions & {
            bypassDocumentValidation?: boolean;
        }, isMany?: boolean): Promise<import("mongodb").DeleteWriteOpResultObject>;
        find(query?: import("mongodb").FilterQuery<S>, options?: import("./types").IFindOneOptions): Promise<S[]>;
        findOne(id: string | number | import("bson").ObjectId, options: import("./types").IFindOneOptions, cb?: import("mongodb").MongoCallback<S>): Promise<S>;
        findOne(id: string | number | import("bson").ObjectId, cb?: import("mongodb").MongoCallback<S>): Promise<S>;
        findOne(query: import("mongodb").FilterQuery<S>, options: import("./types").IFindOneOptions, cb?: import("mongodb").MongoCallback<S>): Promise<S>;
        findOne(query: import("mongodb").FilterQuery<S>, cb?: import("mongodb").MongoCallback<S>): Promise<S>;
        findModel(id: string | number | import("bson").ObjectId, options?: import("./types").IFindOneOptions, cb?: import("mongodb").MongoCallback<Model<any> & S>): Promise<Model<any> & S>;
        findModel(query: import("mongodb").FilterQuery<S>, options?: import("./types").IFindOneOptions, cb?: import("mongodb").MongoCallback<Model<any> & S>): Promise<Model<any> & S>;
        findUpdate(query: string | number | import("bson").ObjectId | import("mongodb").FilterQuery<S>, update: Partial<S> | import("mongodb").UpdateQuery<Partial<S>>, options?: import("mongodb").FindOneAndUpdateOption, cb?: import("mongodb").MongoCallback<import("mongodb").FindAndModifyWriteOpResultObject<S>>): Promise<import("mongodb").FindAndModifyWriteOpResultObject<S>>;
        findDelete(query: string | number | import("bson").ObjectId | import("mongodb").FilterQuery<S>, options?: import("./types").IFindOneAndDeleteOption<S>, cb?: import("mongodb").MongoCallback<import("mongodb").FindAndModifyWriteOpResultObject<S>>): Promise<import("mongodb").FindAndModifyWriteOpResultObject<S>>;
        create(docs: import("mongodb").OptionalId<S>[], options: import("mongodb").CollectionInsertManyOptions, cb?: import("mongodb").MongoCallback<import("mongodb").InsertWriteOpResult<S & {
            _id: any;
        }>>): Promise<import("mongodb").InsertWriteOpResult<S & {
            _id: any;
        }>>;
        create(docs: import("mongodb").OptionalId<S>[], cb?: import("mongodb").MongoCallback<import("mongodb").InsertWriteOpResult<S & {
            _id: any;
        }>>): Promise<import("mongodb").InsertWriteOpResult<S & {
            _id: any;
        }>>;
        createOne(doc: import("mongodb").OptionalId<S>, options: import("mongodb").CollectionInsertOneOptions, cb?: import("mongodb").MongoCallback<import("mongodb").InsertOneWriteOpResult<S & {
            _id: any;
        }>>): Promise<import("mongodb").InsertOneWriteOpResult<S & {
            _id: any;
        }>>;
        createOne(doc: import("mongodb").OptionalId<S>, cb?: import("mongodb").MongoCallback<import("mongodb").InsertOneWriteOpResult<S & {
            _id: any;
        }>>): Promise<import("mongodb").InsertOneWriteOpResult<S & {
            _id: any;
        }>>;
        update(query: import("mongodb").FilterQuery<S>, update: Partial<S> | import("mongodb").UpdateQuery<Partial<S>>, options: import("mongodb").UpdateManyOptions, cb?: import("mongodb").MongoCallback<import("mongodb").UpdateWriteOpResult>): Promise<import("mongodb").UpdateWriteOpResult>;
        update(query: import("mongodb").FilterQuery<S>, update: Partial<S> | import("mongodb").UpdateQuery<Partial<S>>, cb?: import("mongodb").MongoCallback<import("mongodb").UpdateWriteOpResult>): Promise<import("mongodb").UpdateWriteOpResult>;
        updateOne(id: string | number | import("bson").ObjectId, update: Partial<S> | import("mongodb").UpdateQuery<Partial<S>>, options: import("mongodb").UpdateOneOptions, cb?: import("mongodb").MongoCallback<import("mongodb").UpdateWriteOpResult>): Promise<import("mongodb").UpdateWriteOpResult>;
        updateOne(id: string | number | import("bson").ObjectId, update: Partial<S> | import("mongodb").UpdateQuery<Partial<S>>, cb?: import("mongodb").MongoCallback<import("mongodb").UpdateWriteOpResult>): Promise<import("mongodb").UpdateWriteOpResult>;
        updateOne(query: import("mongodb").FilterQuery<S>, update: Partial<S> | import("mongodb").UpdateQuery<Partial<S>>, options: import("mongodb").UpdateOneOptions, cb?: import("mongodb").MongoCallback<import("mongodb").UpdateWriteOpResult>): Promise<import("mongodb").UpdateWriteOpResult>;
        updateOne(query: import("mongodb").FilterQuery<S>, update: Partial<S> | import("mongodb").UpdateQuery<Partial<S>>, cb?: import("mongodb").MongoCallback<import("mongodb").UpdateWriteOpResult>): Promise<import("mongodb").UpdateWriteOpResult>;
        delete(query: import("mongodb").FilterQuery<S>, options: import("mongodb").CommonOptions, cb?: import("mongodb").MongoCallback<import("mongodb").DeleteWriteOpResultObject>): Promise<import("mongodb").DeleteWriteOpResultObject>;
        delete(query: import("mongodb").FilterQuery<S>, cb?: import("mongodb").MongoCallback<import("mongodb").DeleteWriteOpResultObject>): Promise<import("mongodb").DeleteWriteOpResultObject>;
        deleteOne(id: string | number | import("bson").ObjectId, options: import("mongodb").CommonOptions & {
            bypassDocumentValidation?: boolean;
        }, cb?: import("mongodb").MongoCallback<import("mongodb").DeleteWriteOpResultObject>): Promise<import("mongodb").DeleteWriteOpResultObject>;
        deleteOne(id: string | number | import("bson").ObjectId, cb?: import("mongodb").MongoCallback<import("mongodb").DeleteWriteOpResultObject>): Promise<import("mongodb").DeleteWriteOpResultObject>;
        deleteOne(query: import("mongodb").FilterQuery<S>, options?: import("mongodb").CommonOptions & {
            bypassDocumentValidation?: boolean;
        }, cb?: import("mongodb").MongoCallback<import("mongodb").DeleteWriteOpResultObject>): Promise<import("mongodb").DeleteWriteOpResultObject>;
        deleteOne(query: import("mongodb").FilterQuery<S>, cb?: import("mongodb").MongoCallback<import("mongodb").DeleteWriteOpResultObject>): Promise<import("mongodb").DeleteWriteOpResultObject>;
        pre<A1 = any, A2 = any, A3 = any>(type: import("./document").HookType, handler: import("./types").DocumentHook<A1, A2, A3>): any;
        post<A1_1 = any, A2_1 = any, A3_1 = any>(type: import("./document").HookType, handler: import("./types").DocumentHook<A1_1, A2_1, A3_1>): any;
    } & Constructor<Model<S> & S>;
}
declare const _default: KnectMongo;
export default _default;
