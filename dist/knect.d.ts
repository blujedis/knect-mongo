import { MongoClient, MongoClientOptions, Db, FilterQuery, UpdateOneOptions, CommonOptions, UpdateQuery, UpdateManyOptions, CollectionInsertOneOptions, CollectionInsertManyOptions, InsertOneWriteOpResult, UpdateWriteOpResult, DeleteWriteOpResultObject, ObjectID } from 'mongodb';
import { IHooks, HookHandler, IBaseProps, ISchema, ISchemas, IFindOneOptions, IJoin, IJoins, ICascadeResult, IInsertWriteOpResult, IInsertOneWriteOpResult } from './types';
import { ObjectSchema, ValidateOptions } from 'yup';
export declare const MONGO_CLIENT_DEFAULTS: {
    useNewUrlParser: boolean;
};
export declare class KnectMongo {
    dbname: string;
    db: Db;
    client: MongoClient;
    schemas: ISchemas;
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
     * @param config the schema configuration containing document validation.
     */
    model<S extends object = any>(name: string, config?: ISchema<Partial<S>>): {
        new (props?: S): {
            created: number;
            modified: number;
            deleted: number;
            id: string | number | ObjectID;
            /**
             * Saves changes persisting instance in database.
             *
             * @param options MongoDB update options.
             */
            save(options?: UpdateOneOptions): Promise<UpdateWriteOpResult>;
            /**
             * Creates and persists instance to database.
             *
             * @param options Mongodb create options.
             */
            create(options?: CollectionInsertOneOptions): Promise<InsertOneWriteOpResult>;
            /**
             * Deletes document persisting in database.
             *
             * @param options Mongodb delete options.
             */
            delete(options?: CommonOptions): Promise<DeleteWriteOpResultObject>;
            /**
             * Validates instance against schema.
             *
             * @param schema optional schema to verify by or uses defined.
             */
            validate(schema?: ObjectSchema<S & IBaseProps & {
                _id?: string | number | ObjectID;
            }>): S & IBaseProps & {
                _id?: string | number | ObjectID;
            };
            /**
             * Checks if instance is valid against schema.
             *
             * @param schema optional schema to verify by or uses defined.
             */
            isValid(schema?: ObjectSchema<S & IBaseProps & {
                _id?: string | number | ObjectID;
            }>): boolean;
        };
        dbname: string;
        collectionName: string;
        schema: ISchema<Partial<S>>;
        hooks: IHooks;
        readonly client: MongoClient;
        readonly db: Db;
        readonly collection: import("mongodb").Collection<S & IBaseProps & {
            _id?: string | number | ObjectID;
        }>;
        /**
         * Sets the Model's validation schema.
         *
         * @param schema the validation schema.
         */
        setSchema(schema: ISchema<Partial<S>>): void;
        /**
         * Normalizes filter ensuring ObjectID type.
         *
         * @param filter the Mongodb filter query.
         */
        normalizeFilter(filter: FilterQuery<S & IBaseProps & {
            _id?: string | number | ObjectID;
        }>): FilterQuery<S & IBaseProps & {
            _id?: string | number | ObjectID;
        }>;
        /**
         * Convert value to ObjectID.
         *
         * @param id the Like id value to convert to Mongodb ObjectID.
         */
        toObjectID(id: string | number | ObjectID): ObjectID;
        /**
         * Convert value to ObjectID.
         *
         * @param id the Like id value to convert to Mongodb ObjectID.
         */
        toObjectID(ids: (string | number | ObjectID)[]): ObjectID[];
        /**
         * Sets a hook to be called for defined method.
         *
         * @param method the method to set hook for.
         * @param type the hook type.
         * @param handler the handler for the hook.
         */
        setHook(method: string, type: "pre" | "post", handler: any): void;
        /**
         * Gets all hooks for a given method.
         *
         * @param method the method to get hooks for.
         */
        getHooks(method: string): import("./types").IHookConfig;
        /**
         * Get a hook for a given method and type.
         *
         * @param method the hook method.
         * @param type the type of hook method to get.
         */
        getHook(method: string, type: "pre" | "post"): any;
        /**
         * Sets a pre hook for a given method.
         *
         * @param method the method to set the pre hook for.
         * @param handler the handler to be called.
         */
        pre(method: string, handler: HookHandler<S & IBaseProps & {
            _id?: string | number | ObjectID;
        }>): void;
        /**
         * Sets a post hook for a given method.
         *
         * @param method the method to set the post hook for.
         * @param handler the handler to be called.
         */
        post(method: string, handler: HookHandler<S & IBaseProps & {
            _id?: string | number | ObjectID;
        }>): void;
        /**
         * Checks is document is valid against schema.
         *
         * @param doc the document to be validated.
         * @param schema the schema to validate against.
         * @param options the validation options to be applied.
         */
        isValid(doc: S & IBaseProps & {
            _id?: string | number | ObjectID;
        }, schema?: ObjectSchema<S & IBaseProps & {
            _id?: string | number | ObjectID;
        }>, options?: ValidateOptions): boolean;
        /**
         * Validates a document against schema.
         *
         * @param doc the document to be validated.
         * @param schema the schema to validate against.
         * @param options the validation options to be applied.
         */
        validate(doc: S & IBaseProps & {
            _id?: string | number | ObjectID;
        }, schema?: ObjectSchema<S & IBaseProps & {
            _id?: string | number | ObjectID;
        }>, options?: ValidateOptions): S & IBaseProps & {
            _id?: string | number | ObjectID;
        };
        /**
         * Populates document with specified joins.
         *
         * @param doc the document to populate joins for.
         * @param joins an array or IJoins object of joins.
         */
        populate<T extends S & IBaseProps & {
            _id?: string | number | ObjectID;
        }>(doc: S & IBaseProps & {
            _id?: string | number | ObjectID;
        }, joins: string[] | IJoins): Promise<T>;
        /**
         * Populates document with specified joins.
         *
         * @param doc the document to populate joins for.
         * @param joins an array or IJoins object of joins.
         */
        populate<T extends S & IBaseProps & {
            _id?: string | number | ObjectID;
        }>(docs: (S & IBaseProps & {
            _id?: string | number | ObjectID;
        })[], joins: string[] | IJoins): Promise<T[]>;
        /**
         * Populates document with specified joins.
         *
         * @param doc the document to populate joins for.
         * @param joins an array or IJoins object of joins.
         */
        populate<T extends S & IBaseProps & {
            _id?: string | number | ObjectID;
        }>(doc: S & IBaseProps & {
            _id?: string | number | ObjectID;
        }, key: string, join: IJoin): Promise<T>;
        /**
         * Populates document with specified joins.
         *
         * @param doc the document to populate joins for.
         * @param joins an array or IJoins object of joins.
         */
        populate<T extends S & IBaseProps & {
            _id?: string | number | ObjectID;
        }>(docs: (S & IBaseProps & {
            _id?: string | number | ObjectID;
        })[], key: string, join: IJoin): Promise<T[]>;
        /**
         * Cascades delete with specified joins.
         *
         * @param doc the document to populate joins for.
         * @param joins an array or IJoins object of joins.
         */
        cascade(doc: S & IBaseProps & {
            _id?: string | number | ObjectID;
        }, joins: string[] | IJoins): Promise<ICascadeResult<S & IBaseProps & {
            _id?: string | number | ObjectID;
        }>>;
        /**
         * Cascades delete with specified joins.
         *
         * @param doc the document to populate joins for.
         * @param joins an array or IJoins object of joins.
         */
        cascade(doc: (S & IBaseProps & {
            _id?: string | number | ObjectID;
        })[], joins: string[] | IJoins): Promise<ICascadeResult<S & IBaseProps & {
            _id?: string | number | ObjectID;
        }>[]>;
        /**
         * Cascades delete with specified joins.
         *
         * @param doc the document to populate joins for.
         * @param joins an array or IJoins object of joins.
         */
        cascade(doc: S & IBaseProps & {
            _id?: string | number | ObjectID;
        }, key: string, join: IJoin): Promise<ICascadeResult<S & IBaseProps & {
            _id?: string | number | ObjectID;
        }>>;
        /**
         * Cascades delete with specified joins.
         *
         * @param doc the document to populate joins for.
         * @param joins an array or IJoins object of joins.
         */
        cascade(doc: (S & IBaseProps & {
            _id?: string | number | ObjectID;
        })[], key: string, join: IJoin): Promise<ICascadeResult<S & IBaseProps & {
            _id?: string | number | ObjectID;
        }>[]>;
        /**
         * Finds a collection of documents by query.
         *
         * @param filter the Mongodb filter query.
         * @param options Mongodb find options.
         */
        find<T extends S & IBaseProps & {
            _id?: string | number | ObjectID;
        } = S & IBaseProps & {
            _id?: string | number | ObjectID;
        }>(filter?: FilterQuery<S & IBaseProps & {
            _id?: string | number | ObjectID;
        }>, options?: IFindOneOptions): Promise<T[]>;
        /**
         * Finds one document by query.
         *
         * @param filter the Mongodb filter query.
         * @param options Mongodb find options.
         */
        findOne<T extends S & IBaseProps & {
            _id?: string | number | ObjectID;
        } = S & IBaseProps & {
            _id?: string | number | ObjectID;
        }>(filter: FilterQuery<S & IBaseProps & {
            _id?: string | number | ObjectID;
        }>, options?: IFindOneOptions): Promise<T>;
        /**
         * Finds one document by id.
         *
         * @param filter the Mongodb filter query.
         * @param options Mongodb find options.
         */
        findById<T extends S & IBaseProps & {
            _id?: string | number | ObjectID;
        } = S & IBaseProps & {
            _id?: string | number | ObjectID;
        }>(id: string | number | ObjectID, options?: IFindOneOptions): Promise<T>;
        /**
         * Creates document in database.
         *
         * @param doc the document to be persisted to database.
         * @param options Mongodb insert one options.
         */
        create<T extends S & IBaseProps & {
            _id?: string | number | ObjectID;
        } = S & IBaseProps & {
            _id?: string | number | ObjectID;
        }>(doc: S & IBaseProps & {
            _id?: string | number | ObjectID;
        }, options?: CollectionInsertOneOptions): Promise<IInsertOneWriteOpResult<T>>;
        /**
         * Creates document in database.
         *
         * @param doc the document to be persisted to database.
         * @param options Mongodb insert one options.
         */
        create<T extends S & IBaseProps & {
            _id?: string | number | ObjectID;
        } = S & IBaseProps & {
            _id?: string | number | ObjectID;
        }>(docs: (S & IBaseProps & {
            _id?: string | number | ObjectID;
        })[], options?: CollectionInsertManyOptions): Promise<IInsertWriteOpResult<T>>;
        /**
         * Updates multiple documents by query.
         *
         * @param filter the Mongodb filter for finding the desired documents to update.
         * @param update the update query to be applied.
         * @param options Mongodb update options.
         */
        update(filter: FilterQuery<S & IBaseProps & {
            _id?: string | number | ObjectID;
        }>, update: (S & IBaseProps & {
            _id?: string | number | ObjectID;
        }) | UpdateQuery<S & IBaseProps & {
            _id?: string | number | ObjectID;
        }>, options?: UpdateManyOptions): Promise<UpdateWriteOpResult>;
        /**
         * Updates one document by query.
         *
         * @param filter the Mongodb filter for finding the desired documents to update.
         * @param update the update query to be applied.
         * @param options Mongodb update options.
         */
        updateOne(filter: FilterQuery<S & IBaseProps & {
            _id?: string | number | ObjectID;
        }>, update: (S & IBaseProps & {
            _id?: string | number | ObjectID;
        }) | UpdateQuery<S & IBaseProps & {
            _id?: string | number | ObjectID;
        }>, options?: UpdateOneOptions): Promise<UpdateWriteOpResult>;
        /**
         * Updates one document by id.
         *
         * @param filter the Mongodb filter for finding the desired documents to update.
         * @param update the update query to be applied.
         * @param options Mongodb update options.
         */
        updateById(id: string | number | ObjectID, update: (S & IBaseProps & {
            _id?: string | number | ObjectID;
        }) | UpdateQuery<S & IBaseProps & {
            _id?: string | number | ObjectID;
        }>, options?: UpdateOneOptions): Promise<UpdateWriteOpResult>;
        /**
         * Deletes multiple documents by query.
         *
         * @param filter the Mongodb filter for finding the desired documents to update.
         * @param options Mongodb update options.
         */
        delete(filter: FilterQuery<S & IBaseProps & {
            _id?: string | number | ObjectID;
        }>, options?: CommonOptions): Promise<DeleteWriteOpResultObject>;
        /**
         * Deletes one document by query.
         *
         * @param filter the Mongodb filter for finding the desired documents to update.
         * @param options Mongodb update options.
         */
        deleteOne(filter: FilterQuery<S & IBaseProps & {
            _id?: string | number | ObjectID;
        }>, options?: CommonOptions): Promise<DeleteWriteOpResultObject>;
        /**
         * Deletes one document by id.
         *
         * @param filter the Mongodb filter for finding the desired documents to update.
         * @param options Mongodb update options.
         */
        deleteById(id: string | number | ObjectID, options?: CommonOptions): Promise<DeleteWriteOpResultObject>;
    };
}
declare const _default: KnectMongo;
export default _default;
