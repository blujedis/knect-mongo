import { ObjectId, FindOneOptions, DeleteWriteOpResultObject, InsertOneWriteOpResult, FindAndModifyWriteOpResultObject, FindOneAndDeleteOption, MongoClientOptions, FilterQuery } from 'mongodb';
import { IHookHandler } from 'mustad';
declare const DocumentModel: {
    new (doc?: IDoc, isClone?: boolean): {};
    knect: import("./knect").KnectMongo;
    collectionName: string;
    schema: ISchema<IDoc>;
    readonly client: import("mongodb").MongoClient;
    readonly db: import("mongodb").Db;
    readonly collection: import("mongodb").Collection<IDoc>;
    readonly options: IOptions;
    toObjectID(id: string | number | ObjectId): ObjectId;
    toObjectID(ids: (string | number | ObjectId)[]): ObjectId[];
    toQuery(query: string | number | ObjectId | FilterQuery<IDoc>): FilterQuery<IDoc>;
    toUpdate(update?: Partial<IDoc> | import("mongodb").UpdateQuery<Partial<IDoc>>): import("mongodb").UpdateQuery<Partial<IDoc>>;
    toExclude(update?: import("mongodb").UpdateQuery<Partial<IDoc>>): import("mongodb").UpdateQuery<Partial<IDoc>>;
    toCascades(joins: Joins<IDoc>, ...filter: string[]): string[];
    toCascades(...filter: string[]): string[];
    isValid(doc: IDoc): void;
    validate(doc: IDoc): Promise<IDoc>;
    populate(doc: IDoc, join: string | string[] | Joins<IDoc>): Promise<IDoc>;
    populate(docs: IDoc[], join: string | string[] | Joins<IDoc>): Promise<IDoc[]>;
    unpopulate(doc: IDoc, join?: string | string[] | Joins<IDoc>): IDoc;
    unpopulate(docs: IDoc[], join?: string | string[] | Joins<IDoc>): IDoc[];
    cascade(doc: IDoc, join: string | string[] | Joins<IDoc>): Promise<ICascadeResult<IDoc>>;
    cascade(doc: IDoc[], join: string | string[] | Joins<IDoc>): Promise<ICascadeResult<IDoc>[]>;
    cast<U extends Partial<IDoc>>(doc: U, include?: true, ...props: (keyof U)[]): U;
    cast<U_1 extends Partial<IDoc>>(doc: U_1, ...omit: (keyof U_1)[]): U_1;
    cast<U_2 extends Partial<IDoc>>(docs: U_2[], include?: true, ...props: (keyof U_2)[]): U_2[];
    cast<U_3 extends Partial<IDoc>>(docs: U_3[], ...omit: (keyof U_3)[]): U_3[];
    _handleResponse<R, E>(p: R | Promise<R>, cb?: (err: E, data: R) => void): Promise<R>;
    _find(query?: FilterQuery<IDoc>, options?: IFindOneOptions<IDoc>, isMany?: boolean): Promise<IDoc | IDoc[]>;
    _create(doc: (Pick<IDoc, never> & {
        _id?: ObjectId;
    }) | (Pick<IDoc, never> & {
        _id?: ObjectId;
    })[], options?: import("mongodb").CollectionInsertOneOptions | import("mongodb").CollectionInsertManyOptions): Promise<import("mongodb").InsertWriteOpResult<import("mongodb").WithId<IDoc>>> | Promise<InsertOneWriteOpResult<import("mongodb").WithId<IDoc>>>;
    _update(query: FilterQuery<IDoc>, update: Partial<IDoc> | import("mongodb").UpdateQuery<Partial<IDoc>>, options?: import("mongodb").UpdateOneOptions | import("mongodb").UpdateManyOptions, isMany?: boolean): Promise<import("mongodb").UpdateWriteOpResult>;
    _exclude(query: FilterQuery<IDoc>, update: Partial<IDoc> | import("mongodb").UpdateQuery<Partial<IDoc>>, options?: import("mongodb").UpdateOneOptions | import("mongodb").UpdateManyOptions, isMany?: boolean): Promise<import("mongodb").UpdateWriteOpResult>;
    _delete(query: FilterQuery<IDoc>, options?: import("mongodb").CommonOptions & {
        bypassDocumentValidation?: boolean;
    }, isMany?: boolean): Promise<DeleteWriteOpResultObject>;
    find(query?: FilterQuery<IDoc>, options?: IFindOneOptions<IDoc>): Promise<IDoc[]>;
    findIncluded(query?: FilterQuery<IDoc>, options?: IFindOneOptions<IDoc>, cb?: import("mongodb").MongoCallback<IDoc>): Promise<IDoc[]>;
    findOneIncluded(query?: FilterQuery<IDoc>, options?: IFindOneOptions<IDoc>, cb?: import("mongodb").MongoCallback<IDoc>): Promise<IDoc>;
    findOne(query: FilterQuery<IDoc>, options: IFindOneOptions<IDoc>, cb?: import("mongodb").MongoCallback<IDoc>): Promise<IDoc>;
    findOne(query: FilterQuery<IDoc>, cb?: import("mongodb").MongoCallback<IDoc>): Promise<IDoc>;
    findId(id: string | number | ObjectId, options: IFindOneOptions<IDoc>, cb?: import("mongodb").MongoCallback<IDoc>): Promise<IDoc>;
    findId(id: string | number | ObjectId, cb?: import("mongodb").MongoCallback<IDoc>): Promise<IDoc>;
    findModel(id: string | number | ObjectId, options?: IFindOneOptions<IDoc>, cb?: import("mongodb").MongoCallback<import("./model").Model<IDoc> & IDoc>): Promise<import("./model").Model<IDoc> & IDoc>;
    findModel(query: FilterQuery<IDoc>, options?: IFindOneOptions<IDoc>, cb?: import("mongodb").MongoCallback<import("./model").Model<IDoc> & IDoc>): Promise<import("./model").Model<IDoc> & IDoc>;
    findUpdate(query: string | number | ObjectId | FilterQuery<IDoc>, update: Partial<IDoc> | import("mongodb").UpdateQuery<Partial<IDoc>>, options?: import("mongodb").FindOneAndUpdateOption<IDoc>, cb?: import("mongodb").MongoCallback<FindAndModifyWriteOpResultObject<IDoc>>): Promise<FindAndModifyWriteOpResultObject<IDoc>>;
    findExclude(query: string | number | ObjectId | FilterQuery<IDoc>, update: Partial<IDoc> | import("mongodb").UpdateQuery<Partial<IDoc>>, options?: import("mongodb").FindOneAndUpdateOption<IDoc>, cb?: import("mongodb").MongoCallback<FindAndModifyWriteOpResultObject<IDoc>>): Promise<FindAndModifyWriteOpResultObject<IDoc>>;
    findDelete(query: string | number | ObjectId | FilterQuery<IDoc>, options?: IFindOneAndDeleteOption<IDoc>, cb?: import("mongodb").MongoCallback<FindAndModifyWriteOpResultObject<IDoc>>): Promise<FindAndModifyWriteOpResultObject<IDoc>>;
    create(docs: (Pick<IDoc, never> & {
        _id?: ObjectId;
    })[], options: import("mongodb").CollectionInsertManyOptions, cb?: import("mongodb").MongoCallback<import("mongodb").InsertWriteOpResult<IDoc & {
        _id: any;
    }>>): Promise<import("mongodb").InsertWriteOpResult<IDoc & {
        _id: any;
    }>>;
    create(docs: (Pick<IDoc, never> & {
        _id?: ObjectId;
    })[], cb?: import("mongodb").MongoCallback<import("mongodb").InsertWriteOpResult<IDoc & {
        _id: any;
    }>>): Promise<import("mongodb").InsertWriteOpResult<IDoc & {
        _id: any;
    }>>;
    createOne(doc: Pick<IDoc, never> & {
        _id?: ObjectId;
    }, options: import("mongodb").CollectionInsertOneOptions, cb?: import("mongodb").MongoCallback<InsertOneWriteOpResult<IDoc & {
        _id: any;
    }>>): Promise<InsertOneWriteOpResult<IDoc & {
        _id: any;
    }>>;
    createOne(doc: Pick<IDoc, never> & {
        _id?: ObjectId;
    }, cb?: import("mongodb").MongoCallback<InsertOneWriteOpResult<IDoc & {
        _id: any;
    }>>): Promise<InsertOneWriteOpResult<IDoc & {
        _id: any;
    }>>;
    update(query: FilterQuery<IDoc>, update: Partial<IDoc> | import("mongodb").UpdateQuery<Partial<IDoc>>, options: import("mongodb").UpdateManyOptions, cb?: import("mongodb").MongoCallback<import("mongodb").UpdateWriteOpResult>): Promise<import("mongodb").UpdateWriteOpResult>;
    update(query: FilterQuery<IDoc>, update: Partial<IDoc> | import("mongodb").UpdateQuery<Partial<IDoc>>, cb?: import("mongodb").MongoCallback<import("mongodb").UpdateWriteOpResult>): Promise<import("mongodb").UpdateWriteOpResult>;
    updateOne(id: string | number | ObjectId, update: Partial<IDoc> | import("mongodb").UpdateQuery<Partial<IDoc>>, options: import("mongodb").UpdateOneOptions, cb?: import("mongodb").MongoCallback<import("mongodb").UpdateWriteOpResult>): Promise<import("mongodb").UpdateWriteOpResult>;
    updateOne(id: string | number | ObjectId, update: Partial<IDoc> | import("mongodb").UpdateQuery<Partial<IDoc>>, cb?: import("mongodb").MongoCallback<import("mongodb").UpdateWriteOpResult>): Promise<import("mongodb").UpdateWriteOpResult>;
    updateOne(query: FilterQuery<IDoc>, update: Partial<IDoc> | import("mongodb").UpdateQuery<Partial<IDoc>>, options: import("mongodb").UpdateOneOptions, cb?: import("mongodb").MongoCallback<import("mongodb").UpdateWriteOpResult>): Promise<import("mongodb").UpdateWriteOpResult>;
    updateOne(query: FilterQuery<IDoc>, update: Partial<IDoc> | import("mongodb").UpdateQuery<Partial<IDoc>>, cb?: import("mongodb").MongoCallback<import("mongodb").UpdateWriteOpResult>): Promise<import("mongodb").UpdateWriteOpResult>;
    exclude(query: FilterQuery<IDoc>, update: Partial<IDoc> | import("mongodb").UpdateQuery<Partial<IDoc>>, options: import("mongodb").UpdateManyOptions, cb?: import("mongodb").MongoCallback<import("mongodb").UpdateWriteOpResult>): Promise<import("mongodb").UpdateWriteOpResult>;
    exclude(query: FilterQuery<IDoc>, update?: Partial<IDoc> | import("mongodb").UpdateQuery<Partial<IDoc>>, cb?: import("mongodb").MongoCallback<import("mongodb").UpdateWriteOpResult>): Promise<import("mongodb").UpdateWriteOpResult>;
    excludeOne(id: string | number | ObjectId, update: Partial<IDoc> | import("mongodb").UpdateQuery<Partial<IDoc>>, options: import("mongodb").UpdateOneOptions, cb?: import("mongodb").MongoCallback<import("mongodb").UpdateWriteOpResult>): Promise<import("mongodb").UpdateWriteOpResult>;
    excludeOne(id: string | number | ObjectId, update: Partial<IDoc> | import("mongodb").UpdateQuery<Partial<IDoc>>, cb?: import("mongodb").MongoCallback<import("mongodb").UpdateWriteOpResult>): Promise<import("mongodb").UpdateWriteOpResult>;
    excludeOne(query: FilterQuery<IDoc>, update: Partial<IDoc> | import("mongodb").UpdateQuery<Partial<IDoc>>, options: import("mongodb").UpdateOneOptions, cb?: import("mongodb").MongoCallback<import("mongodb").UpdateWriteOpResult>): Promise<import("mongodb").UpdateWriteOpResult>;
    excludeOne(query: FilterQuery<IDoc>, update?: Partial<IDoc> | import("mongodb").UpdateQuery<Partial<IDoc>>, cb?: import("mongodb").MongoCallback<import("mongodb").UpdateWriteOpResult>): Promise<import("mongodb").UpdateWriteOpResult>;
    delete(query: FilterQuery<IDoc>, options: import("mongodb").CommonOptions, cb?: import("mongodb").MongoCallback<DeleteWriteOpResultObject>): Promise<DeleteWriteOpResultObject>;
    delete(query: FilterQuery<IDoc>, cb?: import("mongodb").MongoCallback<DeleteWriteOpResultObject>): Promise<DeleteWriteOpResultObject>;
    deleteOne(id: string | number | ObjectId, options: import("mongodb").CommonOptions & {
        bypassDocumentValidation?: boolean;
    }, cb?: import("mongodb").MongoCallback<DeleteWriteOpResultObject>): Promise<DeleteWriteOpResultObject>;
    deleteOne(id: string | number | ObjectId, cb?: import("mongodb").MongoCallback<DeleteWriteOpResultObject>): Promise<DeleteWriteOpResultObject>;
    deleteOne(query: FilterQuery<IDoc>, options?: import("mongodb").CommonOptions & {
        bypassDocumentValidation?: boolean;
    }, cb?: import("mongodb").MongoCallback<DeleteWriteOpResultObject>): Promise<DeleteWriteOpResultObject>;
    deleteOne(query: FilterQuery<IDoc>, cb?: import("mongodb").MongoCallback<DeleteWriteOpResultObject>): Promise<DeleteWriteOpResultObject>;
    pre<A1 = any, A2 = any, A3 = any>(type: HookType, handler: DocumentHook<A1, A2, A3>): any;
    post<A1_1 = any, A2_1 = any, A3_1 = any>(type: HookType, handler: DocumentHook<A1_1, A2_1, A3_1>): any;
};
export interface IMap<T = any> {
    [key: string]: T;
}
export declare type ObjectType<T = any> = Record<keyof T, T[keyof T]>;
export declare type DerivedDocument = typeof DocumentModel;
export declare type DerivedDocument2<T> = typeof DocumentModel & T;
export declare type LikeObjectId = string | number | ObjectId;
export declare type Constructor<T = any> = new (...args: any[]) => T;
export interface ICascadeResult<T = any> {
    doc: T;
    ops: {
        [key: string]: DeleteWriteOpResultObject[];
    };
}
export interface IJoin<T> {
    collection: string;
    key?: keyof T;
    options?: FindOneOptions<T>;
    cascade?: boolean;
}
export declare type Joins<T extends IDoc> = {
    [K in keyof T]?: IJoin<T>;
};
export interface ISchema<T> {
    collectionName?: string;
    props?: Record<keyof T, T[keyof T]>;
    joins?: Joins<T>;
}
export interface IDoc {
    _id?: LikeObjectId;
}
export interface IFindOneOptions<T> extends FindOneOptions<T> {
    populate?: string | string[];
}
export interface IFindOneAndDeleteOption<T extends IDoc> extends FindOneAndDeleteOption<T> {
    cascade?: boolean | string | string[] | Joins<T>;
}
export interface IModelSaveResult<T extends IDoc> {
    insertId: LikeObjectId;
    ok: number;
    doc: T;
    response: InsertOneWriteOpResult<T & {
        _id: any;
    }> | FindAndModifyWriteOpResultObject<T>;
}
export declare type HookType = 'find' | 'create' | 'update' | 'delete' | 'exclude';
export declare type DocumentHook<A1 = any, A2 = any, A3 = any> = (next: IHookHandler, arg1?: A1, arg2?: A2, arg3?: A3, ...args: any[]) => any;
export interface IOptions {
    /**
     * The connections string to connect to MongoDB.
     */
    uri?: string;
    /**
     * Mongodb client connection options.
     */
    clientOptions?: MongoClientOptions;
    /**
     * The namespace delimiter
     *
     * @default .
     */
    delimiter?: string;
    /**
     * Tests if the document is valid.
     *
     * @param ns the namespace being validated.
     * @param doc the document to be validated.
     * @param schema the schema the model was initiated with.
     */
    isValid?<T>(ns: string, doc: T, schema: ISchema<T>): Promise<boolean>;
    /**
     * Tests if the document is valid and returns ValidationError when false.
     *
     * @param ns the namespace being validated.
     * @param doc the document to be validated.
     * @param schema the schema the model was initiated with.
     */
    validate?<T>(ns: string, doc: T, schema: ISchema<T>): Promise<T>;
    /**
     * The key to use when using exclude, excludeOne etc..
     * This allows for simple soft deletes.
     *
     * Default: deleted
     */
    excludeKey?: string;
    /**
     * If a value is provided it is used for the exclude key.
     * Otherwise Date.now() is used.
     */
    excludeValue?: () => string | boolean | number | Date | object;
}
export {};
