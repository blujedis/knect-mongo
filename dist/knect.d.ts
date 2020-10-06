import { MongoClient, MongoClientOptions, Db } from 'mongodb';
import { Model as BaseModel } from './model';
import { ISchema, IDoc, Constructor, IOptions } from './types';
export declare const MONGO_CLIENT_DEFAULTS: {
    useNewUrlParser: boolean;
    useUnifiedTopology: boolean;
};
export declare class KnectMongo {
    static instance: KnectMongo;
    dbname: string;
    client: MongoClient;
    db: Db;
    schemas: Map<string, ISchema<any>>;
    options: IOptions;
    constructor(options?: IOptions);
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
    connect(uri?: string, options?: MongoClientOptions): Promise<MongoClient>;
    /**
     * Sets the database.
     *
     * @param name the database name to connect to.
     */
    setDb(name: string): Promise<Db>;
    /**
     * Accepts a schema and creates model with static and instance convenience methods.
     *
     * @param ns the namespace for the schema.
     * @param schema the schema configuration containing document validation.
     */
    model<T extends IDoc>(ns: string, schema?: ISchema<T>): {
        new (doc?: T, isClone?: boolean): {};
        knect: KnectMongo;
        collectionName: string;
        schema: ISchema<T>;
        readonly client: MongoClient;
        readonly db: Db;
        readonly collection: import("mongodb").Collection<T>;
        readonly options: IOptions;
        toObjectID(id: string | number | import("bson").ObjectId): import("bson").ObjectId;
        toObjectID(ids: (string | number | import("bson").ObjectId)[]): import("bson").ObjectId[];
        toQuery(query: string | number | import("bson").ObjectId | import("mongodb").FilterQuery<T>): import("mongodb").FilterQuery<T>;
        toUpdate(update?: Partial<T> | import("mongodb").UpdateQuery<Partial<T>>): import("mongodb").UpdateQuery<Partial<T>>;
        toExclude(update?: import("mongodb").UpdateQuery<Partial<T>>): import("mongodb").UpdateQuery<Partial<T>>;
        toCascades(joins: import("./types").Joins<T>, ...filter: string[]): string[];
        toCascades(...filter: string[]): string[];
        isValid(doc: T): void;
        validate(doc: T): Promise<T>;
        populate(doc: T, join: string | string[] | import("./types").Joins<T>): Promise<T>;
        populate(docs: T[], join: string | string[] | import("./types").Joins<T>): Promise<T[]>;
        unpopulate(doc: T, join?: string | string[] | import("./types").Joins<T>): T;
        unpopulate(docs: T[], join?: string | string[] | import("./types").Joins<T>): T[];
        cascade(doc: T, join: string | string[] | import("./types").Joins<T>): Promise<import("./types").ICascadeResult<T>>;
        cascade(doc: T[], join: string | string[] | import("./types").Joins<T>): Promise<import("./types").ICascadeResult<T>[]>;
        cast<U extends Partial<T>>(doc: U, include?: true, ...props: (keyof U)[]): U;
        cast<U_1 extends Partial<T>>(doc: U_1, ...omit: (keyof U_1)[]): U_1;
        cast<U_2 extends Partial<T>>(docs: U_2[], include?: true, ...props: (keyof U_2)[]): U_2[];
        cast<U_3 extends Partial<T>>(docs: U_3[], ...omit: (keyof U_3)[]): U_3[];
        _handleResponse<R, E>(p: R | Promise<R>, cb?: (err: E, data: R) => void): Promise<R>;
        _find(query?: import("mongodb").FilterQuery<T>, options?: import("./types").IFindOneOptions<T>, isMany?: boolean): Promise<T | T[]>;
        _create(doc: import("mongodb").OptionalId<T> | import("mongodb").OptionalId<T>[], options?: import("mongodb").CollectionInsertOneOptions | import("mongodb").CollectionInsertManyOptions): Promise<import("mongodb").InsertWriteOpResult<import("mongodb").WithId<T>>> | Promise<import("mongodb").InsertOneWriteOpResult<import("mongodb").WithId<T>>>;
        _update(query: import("mongodb").FilterQuery<T>, update: Partial<T> | import("mongodb").UpdateQuery<Partial<T>>, options?: import("mongodb").UpdateOneOptions | import("mongodb").UpdateManyOptions, isMany?: boolean): Promise<import("mongodb").UpdateWriteOpResult>;
        _exclude(query: import("mongodb").FilterQuery<T>, update: Partial<T> | import("mongodb").UpdateQuery<Partial<T>>, options?: import("mongodb").UpdateOneOptions | import("mongodb").UpdateManyOptions, isMany?: boolean): Promise<import("mongodb").UpdateWriteOpResult>;
        _delete(query: import("mongodb").FilterQuery<T>, options?: import("mongodb").CommonOptions & {
            bypassDocumentValidation?: boolean;
        }, isMany?: boolean): Promise<import("mongodb").DeleteWriteOpResultObject>;
        find(query?: import("mongodb").FilterQuery<T>, options?: import("./types").IFindOneOptions<T>): Promise<T[]>;
        findIncluded(query?: import("mongodb").FilterQuery<T>, options?: import("./types").IFindOneOptions<T>): Promise<T[]>;
        findOne(query: import("mongodb").FilterQuery<T>, options: import("./types").IFindOneOptions<T>, cb?: import("mongodb").MongoCallback<T>): Promise<T>;
        findOne(query: import("mongodb").FilterQuery<T>, cb?: import("mongodb").MongoCallback<T>): Promise<T>;
        findId(id: string | number | import("bson").ObjectId, options: import("./types").IFindOneOptions<T>, cb?: import("mongodb").MongoCallback<T>): Promise<T>;
        findId(id: string | number | import("bson").ObjectId, cb?: import("mongodb").MongoCallback<T>): Promise<T>;
        findModel(id: string | number | import("bson").ObjectId, options?: import("./types").IFindOneOptions<T>, cb?: import("mongodb").MongoCallback<BaseModel<T> & T>): Promise<BaseModel<T> & T>;
        findModel(query: import("mongodb").FilterQuery<T>, options?: import("./types").IFindOneOptions<T>, cb?: import("mongodb").MongoCallback<BaseModel<T> & T>): Promise<BaseModel<T> & T>;
        findUpdate(query: string | number | import("bson").ObjectId | import("mongodb").FilterQuery<T>, update: Partial<T> | import("mongodb").UpdateQuery<Partial<T>>, options?: import("mongodb").FindOneAndUpdateOption<T>, cb?: import("mongodb").MongoCallback<import("mongodb").FindAndModifyWriteOpResultObject<T>>): Promise<import("mongodb").FindAndModifyWriteOpResultObject<T>>;
        findExclude(query: string | number | import("bson").ObjectId | import("mongodb").FilterQuery<T>, update: Partial<T> | import("mongodb").UpdateQuery<Partial<T>>, options?: import("mongodb").FindOneAndUpdateOption<T>, cb?: import("mongodb").MongoCallback<import("mongodb").FindAndModifyWriteOpResultObject<T>>): Promise<import("mongodb").FindAndModifyWriteOpResultObject<T>>;
        findDelete(query: string | number | import("bson").ObjectId | import("mongodb").FilterQuery<T>, options?: import("./types").IFindOneAndDeleteOption<T>, cb?: import("mongodb").MongoCallback<import("mongodb").FindAndModifyWriteOpResultObject<T>>): Promise<import("mongodb").FindAndModifyWriteOpResultObject<T>>;
        create(docs: import("mongodb").OptionalId<T>[], options: import("mongodb").CollectionInsertManyOptions, cb?: import("mongodb").MongoCallback<import("mongodb").InsertWriteOpResult<T & {
            _id: any;
        }>>): Promise<import("mongodb").InsertWriteOpResult<T & {
            _id: any;
        }>>;
        create(docs: import("mongodb").OptionalId<T>[], cb?: import("mongodb").MongoCallback<import("mongodb").InsertWriteOpResult<T & {
            _id: any;
        }>>): Promise<import("mongodb").InsertWriteOpResult<T & {
            _id: any;
        }>>;
        createOne(doc: import("mongodb").OptionalId<T>, options: import("mongodb").CollectionInsertOneOptions, cb?: import("mongodb").MongoCallback<import("mongodb").InsertOneWriteOpResult<T & {
            _id: any;
        }>>): Promise<import("mongodb").InsertOneWriteOpResult<T & {
            _id: any;
        }>>;
        createOne(doc: import("mongodb").OptionalId<T>, cb?: import("mongodb").MongoCallback<import("mongodb").InsertOneWriteOpResult<T & {
            _id: any;
        }>>): Promise<import("mongodb").InsertOneWriteOpResult<T & {
            _id: any;
        }>>;
        update(query: import("mongodb").FilterQuery<T>, update: Partial<T> | import("mongodb").UpdateQuery<Partial<T>>, options: import("mongodb").UpdateManyOptions, cb?: import("mongodb").MongoCallback<import("mongodb").UpdateWriteOpResult>): Promise<import("mongodb").UpdateWriteOpResult>;
        update(query: import("mongodb").FilterQuery<T>, update: Partial<T> | import("mongodb").UpdateQuery<Partial<T>>, cb?: import("mongodb").MongoCallback<import("mongodb").UpdateWriteOpResult>): Promise<import("mongodb").UpdateWriteOpResult>;
        updateOne(id: string | number | import("bson").ObjectId, update: Partial<T> | import("mongodb").UpdateQuery<Partial<T>>, options: import("mongodb").UpdateOneOptions, cb?: import("mongodb").MongoCallback<import("mongodb").UpdateWriteOpResult>): Promise<import("mongodb").UpdateWriteOpResult>;
        updateOne(id: string | number | import("bson").ObjectId, update: Partial<T> | import("mongodb").UpdateQuery<Partial<T>>, cb?: import("mongodb").MongoCallback<import("mongodb").UpdateWriteOpResult>): Promise<import("mongodb").UpdateWriteOpResult>;
        updateOne(query: import("mongodb").FilterQuery<T>, update: Partial<T> | import("mongodb").UpdateQuery<Partial<T>>, options: import("mongodb").UpdateOneOptions, cb?: import("mongodb").MongoCallback<import("mongodb").UpdateWriteOpResult>): Promise<import("mongodb").UpdateWriteOpResult>;
        updateOne(query: import("mongodb").FilterQuery<T>, update: Partial<T> | import("mongodb").UpdateQuery<Partial<T>>, cb?: import("mongodb").MongoCallback<import("mongodb").UpdateWriteOpResult>): Promise<import("mongodb").UpdateWriteOpResult>;
        exclude(query: import("mongodb").FilterQuery<T>, update: Partial<T> | import("mongodb").UpdateQuery<Partial<T>>, options: import("mongodb").UpdateManyOptions, cb?: import("mongodb").MongoCallback<import("mongodb").UpdateWriteOpResult>): Promise<import("mongodb").UpdateWriteOpResult>;
        exclude(query: import("mongodb").FilterQuery<T>, update?: Partial<T> | import("mongodb").UpdateQuery<Partial<T>>, cb?: import("mongodb").MongoCallback<import("mongodb").UpdateWriteOpResult>): Promise<import("mongodb").UpdateWriteOpResult>;
        excludeOne(id: string | number | import("bson").ObjectId, update: Partial<T> | import("mongodb").UpdateQuery<Partial<T>>, options: import("mongodb").UpdateOneOptions, cb?: import("mongodb").MongoCallback<import("mongodb").UpdateWriteOpResult>): Promise<import("mongodb").UpdateWriteOpResult>;
        excludeOne(id: string | number | import("bson").ObjectId, update: Partial<T> | import("mongodb").UpdateQuery<Partial<T>>, cb?: import("mongodb").MongoCallback<import("mongodb").UpdateWriteOpResult>): Promise<import("mongodb").UpdateWriteOpResult>;
        excludeOne(query: import("mongodb").FilterQuery<T>, update: Partial<T> | import("mongodb").UpdateQuery<Partial<T>>, options: import("mongodb").UpdateOneOptions, cb?: import("mongodb").MongoCallback<import("mongodb").UpdateWriteOpResult>): Promise<import("mongodb").UpdateWriteOpResult>;
        excludeOne(query: import("mongodb").FilterQuery<T>, update?: Partial<T> | import("mongodb").UpdateQuery<Partial<T>>, cb?: import("mongodb").MongoCallback<import("mongodb").UpdateWriteOpResult>): Promise<import("mongodb").UpdateWriteOpResult>;
        delete(query: import("mongodb").FilterQuery<T>, options: import("mongodb").CommonOptions, cb?: import("mongodb").MongoCallback<import("mongodb").DeleteWriteOpResultObject>): Promise<import("mongodb").DeleteWriteOpResultObject>;
        delete(query: import("mongodb").FilterQuery<T>, cb?: import("mongodb").MongoCallback<import("mongodb").DeleteWriteOpResultObject>): Promise<import("mongodb").DeleteWriteOpResultObject>;
        deleteOne(id: string | number | import("bson").ObjectId, options: import("mongodb").CommonOptions & {
            bypassDocumentValidation?: boolean;
        }, cb?: import("mongodb").MongoCallback<import("mongodb").DeleteWriteOpResultObject>): Promise<import("mongodb").DeleteWriteOpResultObject>;
        deleteOne(id: string | number | import("bson").ObjectId, cb?: import("mongodb").MongoCallback<import("mongodb").DeleteWriteOpResultObject>): Promise<import("mongodb").DeleteWriteOpResultObject>;
        deleteOne(query: import("mongodb").FilterQuery<T>, options?: import("mongodb").CommonOptions & {
            bypassDocumentValidation?: boolean;
        }, cb?: import("mongodb").MongoCallback<import("mongodb").DeleteWriteOpResultObject>): Promise<import("mongodb").DeleteWriteOpResultObject>;
        deleteOne(query: import("mongodb").FilterQuery<T>, cb?: import("mongodb").MongoCallback<import("mongodb").DeleteWriteOpResultObject>): Promise<import("mongodb").DeleteWriteOpResultObject>;
        pre<A1 = any, A2 = any, A3 = any>(type: import("./types").HookType, handler: import("./types").DocumentHook<A1, A2, A3>): any;
        post<A1_1 = any, A2_1 = any, A3_1 = any>(type: import("./types").HookType, handler: import("./types").DocumentHook<A1_1, A2_1, A3_1>): any;
    } & Constructor<BaseModel<T> & T>;
}
