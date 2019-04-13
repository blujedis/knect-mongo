import { MongoClient, MongoClientOptions, Db, FilterQuery, UpdateOneOptions, UpdateWriteOpResult, CommonOptions, DeleteWriteOpResultObject, UpdateQuery, UpdateManyOptions, CollectionInsertOneOptions, CollectionInsertManyOptions, InsertWriteOpResult, InsertOneWriteOpResult, FindOneOptions } from 'mongodb';
import { IHooks, HookHandler } from './types';
import * as JOI from 'joi';
export declare const MONGO_CLIENT_DEFAULTS: {
    useNewUrlParser: boolean;
};
export declare class KnectMongo {
    private _onError;
    dbname: string;
    db: Db;
    client: MongoClient;
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
     * @param name the name of the collection
     * @param schema the JOI Object Schema for validation.
     */
    model<S>(name: string, schema: JOI.ObjectSchema): {
        new (): {
            created: number;
            modified: number;
            deleted: number;
            readonly doc: S;
            id: string;
            /**
             * Saves the exiting instance to the database.
             *
             * @param options MongoDB update options.
             */
            save(options?: UpdateOneOptions): Promise<UpdateWriteOpResult>;
            create(options?: CollectionInsertOneOptions): Promise<InsertOneWriteOpResult>;
            delete(options?: UpdateOneOptions): Promise<DeleteWriteOpResultObject>;
            purge(options?: CommonOptions): Promise<DeleteWriteOpResultObject>;
            validate(schema?: JOI.ObjectSchema): JOI.ValidationResult<S>;
        };
        dbname: string;
        collectionName: string;
        schema: JOI.ObjectSchema;
        readonly client: MongoClient;
        readonly db: Db;
        readonly collection: import("mongodb").Collection<S>;
        onError(err: Error): void;
        hooks: IHooks;
        setHook(method: string, type: "pre" | "post", handler: any): void;
        getHooks(method: string): import("src/types").IHookConfig;
        getHook(method: string, type: "pre" | "post"): any;
        pre(method: string, handler: HookHandler<S>): void;
        post(method: string, handler: HookHandler<S>): void;
        validate(doc: S, schema?: JOI.ObjectSchema): JOI.ValidationResult<S>;
        find(filter: FilterQuery<S>): Promise<S[]>;
        findOne(filter: FilterQuery<S>, options?: FindOneOptions): Promise<S>;
        create(doc: S, options?: CollectionInsertOneOptions): Promise<InsertOneWriteOpResult>;
        create(doc: S[], options?: CollectionInsertManyOptions): Promise<InsertWriteOpResult>;
        update(filter: FilterQuery<S>, update: S | UpdateQuery<S>, options?: UpdateManyOptions): Promise<UpdateWriteOpResult>;
        updateOne(filter: FilterQuery<S>, update: S | UpdateQuery<S>, options?: UpdateOneOptions): Promise<UpdateWriteOpResult>;
        updateById(id: string, update: S | UpdateQuery<S>, options?: UpdateOneOptions): Promise<UpdateWriteOpResult>;
        delete(filter: FilterQuery<S>, options?: UpdateManyOptions): Promise<UpdateWriteOpResult>;
        deleteOne(filter: FilterQuery<S>, options?: UpdateOneOptions): Promise<UpdateWriteOpResult>;
        deleteById(id: string, options?: UpdateOneOptions): Promise<UpdateWriteOpResult>;
        purge(filter: FilterQuery<S>, options?: CommonOptions): Promise<DeleteWriteOpResultObject>;
        purgeOne(filter: FilterQuery<S>, options?: CommonOptions): Promise<DeleteWriteOpResultObject>;
        purgeById(id: string, options?: CommonOptions): Promise<DeleteWriteOpResultObject>;
    };
    /**
     * Sets the custom error handler function globally.
     *
     * @param fn a custom error handler function.
     */
    onError(fn: (err: Error) => void): void;
}
declare const _default: KnectMongo;
export default _default;
