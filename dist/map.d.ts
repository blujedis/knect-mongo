import { IDoc, Constructor, DerivedDocument } from './types';
import { Model } from './model';
declare type BaseSchema = IDoc & {};
export declare class ModelMap extends Map<string, DerivedDocument & Constructor<Model<BaseSchema> & BaseSchema>> {
    getAs<S extends IDoc>(key: string): {
        new (doc?: S, isClone?: boolean): {};
        knect: import("./knect").KnectMongo;
        collectionName: string;
        schema: import("./types").ISchema<S, any>;
        readonly client: import("mongodb").MongoClient;
        readonly db: import("mongodb").Db;
        readonly collection: import("mongodb").Collection<S>;
        toObjectID(id: import("./types").LikeObjectId): import("bson").ObjectId;
        toObjectID(ids: import("./types").LikeObjectId[]): import("bson").ObjectId[];
        toSoftDelete(doc: Partial<S>): Partial<S>;
        toQuery(query: string | number | import("bson").ObjectId | import("mongodb").FilterQuery<S>): import("mongodb").FilterQuery<S>;
        toUpdate(update: Partial<S> | import("mongodb").UpdateQuery<Partial<S>>): import("mongodb").UpdateQuery<Partial<S>>;
        toCascades(joins: import("./types").Joins<S>, ...filter: string[]): string[];
        toCascades(...filter: string[]): string[];
        isValid(doc: S): void;
        validate(doc: S): Promise<S>;
        populate(doc: S, join: string | string[] | import("./types").Joins<S>): Promise<S>;
        populate(docs: S[], join: string | string[] | import("./types").Joins<S>): Promise<S[]>;
        unpopulate(doc: S, join?: string | string[] | import("./types").Joins<S>): S;
        unpopulate(docs: S[], join?: string | string[] | import("./types").Joins<S>): S[];
        cascade(doc: S, join: string | string[] | import("./types").Joins<S>): Promise<import("./types").ICascadeResult<S>>;
        cascade(doc: S[], join: string | string[] | import("./types").Joins<S>): Promise<import("./types").ICascadeResult<S>[]>;
        cast<U extends Partial<S>>(doc: U, include?: true, ...props: Extract<keyof U, string>[]): U;
        cast<U_1 extends Partial<S>>(doc: U_1, ...omit: Extract<keyof U_1, string>[]): U_1;
        cast<U_2 extends Partial<S>>(docs: U_2[], include?: true, ...props: Extract<keyof U_2, string>[]): U_2[];
        cast<U_3 extends Partial<S>>(docs: U_3[], ...omit: Extract<keyof U_3, string>[]): U_3[];
        _handleResponse<R, E>(p: R | Promise<R>, cb?: (err: E, data: R) => void): Promise<R>;
        _find(query?: import("mongodb").FilterQuery<S>, options?: import("./types").IFindOneOptions, isMany?: boolean): Promise<S | S[]>;
        _create(doc: import("mongodb").OptionalId<S> | import("mongodb").OptionalId<S>[], options?: import("mongodb").CollectionInsertOneOptions | import("mongodb").CollectionInsertManyOptions): Promise<import("mongodb").InsertWriteOpResult<import("mongodb").WithId<S>>> | Promise<import("mongodb").InsertOneWriteOpResult<import("mongodb").WithId<S>>>;
        _update(query: import("mongodb").FilterQuery<S>, update: Partial<S> | import("mongodb").UpdateQuery<Partial<S>>, options?: import("mongodb").UpdateOneOptions | import("mongodb").UpdateManyOptions, isMany?: boolean): Promise<import("mongodb").UpdateWriteOpResult>;
        _delete(query: import("mongodb").FilterQuery<S>, options?: import("mongodb").CommonOptions & {
            bypassDocumentValidation?: boolean;
        }, isMany?: boolean): Promise<import("mongodb").DeleteWriteOpResultObject>;
        find(query?: import("mongodb").FilterQuery<S>, options?: import("./types").IFindOneOptions): Promise<S[]>;
        findOne(id: import("./types").LikeObjectId, options: import("./types").IFindOneOptions, cb?: import("mongodb").MongoCallback<S>): Promise<S>;
        findOne(id: import("./types").LikeObjectId, cb?: import("mongodb").MongoCallback<S>): Promise<S>;
        findOne(query: import("mongodb").FilterQuery<S>, options: import("./types").IFindOneOptions, cb?: import("mongodb").MongoCallback<S>): Promise<S>;
        findOne(query: import("mongodb").FilterQuery<S>, cb?: import("mongodb").MongoCallback<S>): Promise<S>;
        findModel(id: import("./types").LikeObjectId, options?: import("./types").IFindOneOptions, cb?: import("mongodb").MongoCallback<Model<S> & S>): Promise<Model<S> & S>;
        findModel(query: import("mongodb").FilterQuery<S>, options?: import("./types").IFindOneOptions, cb?: import("mongodb").MongoCallback<Model<S> & S>): Promise<Model<S> & S>;
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
        updateOne(id: import("./types").LikeObjectId, update: Partial<S> | import("mongodb").UpdateQuery<Partial<S>>, options: import("mongodb").UpdateOneOptions, cb?: import("mongodb").MongoCallback<import("mongodb").UpdateWriteOpResult>): Promise<import("mongodb").UpdateWriteOpResult>;
        updateOne(id: import("./types").LikeObjectId, update: Partial<S> | import("mongodb").UpdateQuery<Partial<S>>, cb?: import("mongodb").MongoCallback<import("mongodb").UpdateWriteOpResult>): Promise<import("mongodb").UpdateWriteOpResult>;
        updateOne(query: import("mongodb").FilterQuery<S>, update: Partial<S> | import("mongodb").UpdateQuery<Partial<S>>, options: import("mongodb").UpdateOneOptions, cb?: import("mongodb").MongoCallback<import("mongodb").UpdateWriteOpResult>): Promise<import("mongodb").UpdateWriteOpResult>;
        updateOne(query: import("mongodb").FilterQuery<S>, update: Partial<S> | import("mongodb").UpdateQuery<Partial<S>>, cb?: import("mongodb").MongoCallback<import("mongodb").UpdateWriteOpResult>): Promise<import("mongodb").UpdateWriteOpResult>;
        exclude(query: import("mongodb").FilterQuery<S>, update: Partial<S> | import("mongodb").UpdateQuery<Partial<S>>, options: import("mongodb").UpdateManyOptions, cb?: import("mongodb").MongoCallback<import("mongodb").UpdateWriteOpResult>): Promise<import("mongodb").UpdateWriteOpResult>;
        exclude(query: import("mongodb").FilterQuery<S>, update: Partial<S> | import("mongodb").UpdateQuery<Partial<S>>, cb?: import("mongodb").MongoCallback<import("mongodb").UpdateWriteOpResult>): Promise<import("mongodb").UpdateWriteOpResult>;
        excludeOne(id: import("./types").LikeObjectId, update: Partial<S> | import("mongodb").UpdateQuery<Partial<S>>, options: import("mongodb").UpdateOneOptions, cb?: import("mongodb").MongoCallback<import("mongodb").UpdateWriteOpResult>): Promise<import("mongodb").UpdateWriteOpResult>;
        excludeOne(id: import("./types").LikeObjectId, update: Partial<S> | import("mongodb").UpdateQuery<Partial<S>>, cb?: import("mongodb").MongoCallback<import("mongodb").UpdateWriteOpResult>): Promise<import("mongodb").UpdateWriteOpResult>;
        excludeOne(query: import("mongodb").FilterQuery<S>, update: Partial<S> | import("mongodb").UpdateQuery<Partial<S>>, options: import("mongodb").UpdateOneOptions, cb?: import("mongodb").MongoCallback<import("mongodb").UpdateWriteOpResult>): Promise<import("mongodb").UpdateWriteOpResult>;
        excludeOne(query: import("mongodb").FilterQuery<S>, update: Partial<S> | import("mongodb").UpdateQuery<Partial<S>>, cb?: import("mongodb").MongoCallback<import("mongodb").UpdateWriteOpResult>): Promise<import("mongodb").UpdateWriteOpResult>;
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
        pre<A1 = any, A2 = any, A3 = any>(type: import("./types").HookType, handler: import("./types").DocumentHook<A1, A2, A3>): any;
        post<A1_1 = any, A2_1 = any, A3_1 = any>(type: import("./types").HookType, handler: import("./types").DocumentHook<A1_1, A2_1, A3_1>): any;
    } & Constructor<Model<S> & S>;
    list(): string[];
}
export {};
