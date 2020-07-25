import { ObjectId, FindOneOptions, DeleteWriteOpResultObject, InsertOneWriteOpResult, FindAndModifyWriteOpResultObject, FindOneAndDeleteOption, MongoClientOptions, UpdateQuery } from 'mongodb';
import { IHookHandler } from 'mustad';
declare const DocumentModel: {
    new (doc?: IDoc, isClone?: boolean): {};
    knect: import("./knect").KnectMongo;
    collectionName: string;
    schema: ISchema<IDoc, any>;
    readonly client: import("mongodb").MongoClient;
    readonly db: import("mongodb").Db;
    readonly collection: import("mongodb").Collection<IDoc>;
    toObjectID(id: LikeObjectId): ObjectId;
    toObjectID(ids: LikeObjectId[]): ObjectId[];
    toSoftDelete(doc: Partial<IDoc>): Partial<IDoc>;
    toQuery(query: string | number | ObjectId | import("mongodb").FilterQuery<IDoc>): import("mongodb").FilterQuery<IDoc>;
    toUpdate(update: Partial<IDoc> | UpdateQuery<Partial<IDoc>>): UpdateQuery<Partial<IDoc>>;
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
    cast<U extends Partial<IDoc>>(doc: U, include?: true, ...props: Extract<keyof U, string>[]): U;
    cast<U_1 extends Partial<IDoc>>(doc: U_1, ...omit: Extract<keyof U_1, string>[]): U_1;
    cast<U_2 extends Partial<IDoc>>(docs: U_2[], include?: true, ...props: Extract<keyof U_2, string>[]): U_2[];
    cast<U_3 extends Partial<IDoc>>(docs: U_3[], ...omit: Extract<keyof U_3, string>[]): U_3[];
    _handleResponse<R, E>(p: R | Promise<R>, cb?: (err: E, data: R) => void): Promise<R>;
    _find(query?: import("mongodb").FilterQuery<IDoc>, options?: IFindOneOptions, isMany?: boolean): Promise<IDoc | IDoc[]>;
    _create(doc: (Pick<IDoc, never> & {
        _id?: ObjectId;
    }) | (Pick<IDoc, never> & {
        _id?: ObjectId;
    })[], options?: import("mongodb").CollectionInsertOneOptions | import("mongodb").CollectionInsertManyOptions): Promise<import("mongodb").InsertWriteOpResult<import("mongodb").WithId<IDoc>>> | Promise<InsertOneWriteOpResult<import("mongodb").WithId<IDoc>>>;
    _update(query: import("mongodb").FilterQuery<IDoc>, update: Partial<IDoc> | UpdateQuery<Partial<IDoc>>, options?: import("mongodb").UpdateOneOptions | import("mongodb").UpdateManyOptions, isMany?: boolean): Promise<import("mongodb").UpdateWriteOpResult>;
    _delete(query: import("mongodb").FilterQuery<IDoc>, options?: import("mongodb").CommonOptions & {
        bypassDocumentValidation?: boolean;
    }, isMany?: boolean): Promise<DeleteWriteOpResultObject>;
    find(query?: import("mongodb").FilterQuery<IDoc>, options?: IFindOneOptions): Promise<IDoc[]>;
    findOne(id: LikeObjectId, options: IFindOneOptions, cb?: import("mongodb").MongoCallback<IDoc>): Promise<IDoc>;
    findOne(id: LikeObjectId, cb?: import("mongodb").MongoCallback<IDoc>): Promise<IDoc>;
    findOne(query: import("mongodb").FilterQuery<IDoc>, options: IFindOneOptions, cb?: import("mongodb").MongoCallback<IDoc>): Promise<IDoc>;
    findOne(query: import("mongodb").FilterQuery<IDoc>, cb?: import("mongodb").MongoCallback<IDoc>): Promise<IDoc>;
    findModel(id: LikeObjectId, options?: IFindOneOptions, cb?: import("mongodb").MongoCallback<import("./model").Model<IDoc> & IDoc>): Promise<import("./model").Model<IDoc> & IDoc>;
    findModel(query: import("mongodb").FilterQuery<IDoc>, options?: IFindOneOptions, cb?: import("mongodb").MongoCallback<import("./model").Model<IDoc> & IDoc>): Promise<import("./model").Model<IDoc> & IDoc>;
    findUpdate(query: string | number | ObjectId | import("mongodb").FilterQuery<IDoc>, update: Partial<IDoc> | UpdateQuery<Partial<IDoc>>, options?: import("mongodb").FindOneAndUpdateOption, cb?: import("mongodb").MongoCallback<FindAndModifyWriteOpResultObject<IDoc>>): Promise<FindAndModifyWriteOpResultObject<IDoc>>;
    findDelete(query: string | number | ObjectId | import("mongodb").FilterQuery<IDoc>, options?: IFindOneAndDeleteOption<IDoc>, cb?: import("mongodb").MongoCallback<FindAndModifyWriteOpResultObject<IDoc>>): Promise<FindAndModifyWriteOpResultObject<IDoc>>;
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
    update(query: import("mongodb").FilterQuery<IDoc>, update: Partial<IDoc> | UpdateQuery<Partial<IDoc>>, options: import("mongodb").UpdateManyOptions, cb?: import("mongodb").MongoCallback<import("mongodb").UpdateWriteOpResult>): Promise<import("mongodb").UpdateWriteOpResult>;
    update(query: import("mongodb").FilterQuery<IDoc>, update: Partial<IDoc> | UpdateQuery<Partial<IDoc>>, cb?: import("mongodb").MongoCallback<import("mongodb").UpdateWriteOpResult>): Promise<import("mongodb").UpdateWriteOpResult>;
    updateOne(id: LikeObjectId, update: Partial<IDoc> | UpdateQuery<Partial<IDoc>>, options: import("mongodb").UpdateOneOptions, cb?: import("mongodb").MongoCallback<import("mongodb").UpdateWriteOpResult>): Promise<import("mongodb").UpdateWriteOpResult>;
    updateOne(id: LikeObjectId, update: Partial<IDoc> | UpdateQuery<Partial<IDoc>>, cb?: import("mongodb").MongoCallback<import("mongodb").UpdateWriteOpResult>): Promise<import("mongodb").UpdateWriteOpResult>;
    updateOne(query: import("mongodb").FilterQuery<IDoc>, update: Partial<IDoc> | UpdateQuery<Partial<IDoc>>, options: import("mongodb").UpdateOneOptions, cb?: import("mongodb").MongoCallback<import("mongodb").UpdateWriteOpResult>): Promise<import("mongodb").UpdateWriteOpResult>;
    updateOne(query: import("mongodb").FilterQuery<IDoc>, update: Partial<IDoc> | UpdateQuery<Partial<IDoc>>, cb?: import("mongodb").MongoCallback<import("mongodb").UpdateWriteOpResult>): Promise<import("mongodb").UpdateWriteOpResult>;
    exclude(query: import("mongodb").FilterQuery<IDoc>, update: Partial<IDoc> | UpdateQuery<Partial<IDoc>>, options: import("mongodb").UpdateManyOptions, cb?: import("mongodb").MongoCallback<import("mongodb").UpdateWriteOpResult>): Promise<import("mongodb").UpdateWriteOpResult>;
    exclude(query: import("mongodb").FilterQuery<IDoc>, update: Partial<IDoc> | UpdateQuery<Partial<IDoc>>, cb?: import("mongodb").MongoCallback<import("mongodb").UpdateWriteOpResult>): Promise<import("mongodb").UpdateWriteOpResult>;
    excludeOne(id: LikeObjectId, update: Partial<IDoc> | UpdateQuery<Partial<IDoc>>, options: import("mongodb").UpdateOneOptions, cb?: import("mongodb").MongoCallback<import("mongodb").UpdateWriteOpResult>): Promise<import("mongodb").UpdateWriteOpResult>;
    excludeOne(id: LikeObjectId, update: Partial<IDoc> | UpdateQuery<Partial<IDoc>>, cb?: import("mongodb").MongoCallback<import("mongodb").UpdateWriteOpResult>): Promise<import("mongodb").UpdateWriteOpResult>;
    excludeOne(query: import("mongodb").FilterQuery<IDoc>, update: Partial<IDoc> | UpdateQuery<Partial<IDoc>>, options: import("mongodb").UpdateOneOptions, cb?: import("mongodb").MongoCallback<import("mongodb").UpdateWriteOpResult>): Promise<import("mongodb").UpdateWriteOpResult>;
    excludeOne(query: import("mongodb").FilterQuery<IDoc>, update: Partial<IDoc> | UpdateQuery<Partial<IDoc>>, cb?: import("mongodb").MongoCallback<import("mongodb").UpdateWriteOpResult>): Promise<import("mongodb").UpdateWriteOpResult>;
    delete(query: import("mongodb").FilterQuery<IDoc>, options: import("mongodb").CommonOptions, cb?: import("mongodb").MongoCallback<DeleteWriteOpResultObject>): Promise<DeleteWriteOpResultObject>;
    delete(query: import("mongodb").FilterQuery<IDoc>, cb?: import("mongodb").MongoCallback<DeleteWriteOpResultObject>): Promise<DeleteWriteOpResultObject>;
    deleteOne(id: LikeObjectId, options: import("mongodb").CommonOptions & {
        bypassDocumentValidation?: boolean;
    }, cb?: import("mongodb").MongoCallback<DeleteWriteOpResultObject>): Promise<DeleteWriteOpResultObject>;
    deleteOne(id: LikeObjectId, cb?: import("mongodb").MongoCallback<DeleteWriteOpResultObject>): Promise<DeleteWriteOpResultObject>;
    deleteOne(query: import("mongodb").FilterQuery<IDoc>, options?: import("mongodb").CommonOptions & {
        bypassDocumentValidation?: boolean;
    }, cb?: import("mongodb").MongoCallback<DeleteWriteOpResultObject>): Promise<DeleteWriteOpResultObject>;
    deleteOne(query: import("mongodb").FilterQuery<IDoc>, cb?: import("mongodb").MongoCallback<DeleteWriteOpResultObject>): Promise<DeleteWriteOpResultObject>;
    pre<A1 = any, A2 = any, A3 = any>(type: HookType, handler: DocumentHook<A1, A2, A3>): any;
    post<A1_1 = any, A2_1 = any, A3_1 = any>(type: HookType, handler: DocumentHook<A1_1, A2_1, A3_1>): any;
};
export interface IMap<T = any> {
    [key: string]: T;
}
export declare type ObjectType<T = any> = Record<keyof T, T[keyof T]>;
export declare type DerivedDocument = typeof DocumentModel;
export declare type KeyOf<T> = Extract<keyof T, string>;
export declare type LikeObjectId = string | number | ObjectId;
export declare type Constructor<T = any> = new (...args: any[]) => T;
export interface ICascadeResult<T = any> {
    doc: T;
    ops: {
        [key: string]: DeleteWriteOpResultObject[];
    };
}
export interface IJoin {
    collection: string;
    key?: string;
    options?: FindOneOptions;
    cascade?: boolean;
}
export declare type Joins<T> = {
    [K in keyof T]?: IJoin;
};
export interface ISchema<T, S = any> {
    collectionName?: string;
    props?: Record<keyof T, S>;
    joins?: Joins<T>;
}
export interface IDoc {
    _id?: LikeObjectId;
}
export interface IFindOneOptions extends FindOneOptions {
    populate?: string | string[];
}
export interface IFindOneAndDeleteOption<T extends IDoc> extends FindOneAndDeleteOption {
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
export declare type HookType = 'find' | 'create' | 'update' | 'delete';
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
    isValid?<T, S = any>(ns: string, doc: T, schema: ISchema<T, S>): Promise<boolean>;
    /**
     * Tests if the document is valid and returns ValidationError when false.
     *
     * @param ns the namespace being validated.
     * @param doc the document to be validated.
     * @param schema the schema the model was initiated with.
     */
    validate?<T, S = any>(ns: string, doc: T, schema: ISchema<T, S>): Promise<T>;
    /**
     * Handler when soft deletes are made.
     * True = sets property "deleted" with epoch timestamp.
     * String = sets property by this name with epoch timestamp.
     * If using handler function update and return the document.
     *
     * @default true
     */
    onSoftDelete?: true | string | (<T extends IDoc>(update: Partial<T>) => Partial<T>);
}
export {};
