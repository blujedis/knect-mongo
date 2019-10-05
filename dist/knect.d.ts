import { MongoClient, MongoClientOptions, Db, FilterQuery, UpdateOneOptions, CommonOptions, UpdateQuery, UpdateManyOptions, CollectionInsertOneOptions, CollectionInsertManyOptions, UpdateWriteOpResult, DeleteWriteOpResultObject, ObjectID } from 'mongodb';
import { IHooks, HookHandler, ISchema, ISchemas, IFindOneOptions, IJoin, IJoins, ICascadeResult, IInsertWriteOpResult, IInsertOneWriteOpResult, Constructor } from './types';
import { ObjectSchema, ValidateOptions } from 'yup';
export declare const MONGO_CLIENT_DEFAULTS: {
    useNewUrlParser: boolean;
    useUnifiedTopology: boolean;
};
export declare class KnectMongo {
    dbname: string;
    db: Db;
    client: MongoClient;
    schemas: ISchemas;
    models: any;
    delimiter: string;
    /**
     * Accepts a schema and creates model with static and instance convenience methods.
     *
     * @param name the name of the collection
     * @param config the schema configuration containing document validation.
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
    model<S extends object>(ns: string, schema?: ISchema<S>, collectionName?: string): {
        new (props?: S & {
            _id?: ObjectID;
        }): {
            _id?: ObjectID;
            id: string | number | ObjectID;
            /**
             * Updates a single record by id.
             *
             * @param options the update options.
             */
            update(options?: UpdateOneOptions): Promise<UpdateWriteOpResult>;
            /**
             * Creates and persists instance to database.
             *
             * @param options Mongodb create options.
             */
            create(options?: CollectionInsertOneOptions): Promise<IInsertOneWriteOpResult<S & {
                _id?: ObjectID;
            }>>;
            /**
             * Saves changes persisting instance in database.
             *
             * @param options MongoDB update options.
             */
            save(options?: CollectionInsertOneOptions | UpdateOneOptions): Promise<UpdateWriteOpResult | IInsertOneWriteOpResult<S & {
                _id?: ObjectID;
            }>>;
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
            validate(schema?: ObjectSchema<S & {
                _id?: ObjectID;
            }>): S & {
                _id?: ObjectID;
            };
            /**
             * Checks if instance is valid against schema.
             *
             * @param schema optional schema to verify by or uses defined.
             */
            isValid(schema?: ObjectSchema<S & {
                _id?: ObjectID;
            }>): boolean;
        };
        schemaName: string;
        dbname: string;
        collectionName: string;
        schema: ISchema<S>;
        hooks: IHooks;
        readonly client: MongoClient;
        readonly db: Db;
        readonly collection: import("mongodb").Collection<S & {
            _id?: ObjectID;
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
        normalizeFilter(filter: FilterQuery<S & {
            _id?: ObjectID;
        }>): FilterQuery<S & {
            _id?: ObjectID;
        }>;
        /**
         * Normalizes update query so that $set is always present.
         *
         * @param update the update query to be applied.
         */
        normalizeUpdate(update: Partial<S & {
            _id?: ObjectID;
        }> | UpdateQuery<Partial<S & {
            _id?: ObjectID;
        }>>): UpdateQuery<Partial<S & {
            _id?: ObjectID;
        }>>;
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
        pre(method: string, handler: HookHandler<S & {
            _id?: ObjectID;
        }>): void;
        /**
         * Sets a post hook for a given method.
         *
         * @param method the method to set the post hook for.
         * @param handler the handler to be called.
         */
        post(method: string, handler: HookHandler<S & {
            _id?: ObjectID;
        }>): void;
        /**
         * Checks is document is valid against schema.
         *
         * @param doc the document to be validated.
         * @param schema the schema to validate against.
         * @param options the validation options to be applied.
         */
        isValid(doc: S & {
            _id?: ObjectID;
        }, schema?: ObjectSchema<S & {
            _id?: ObjectID;
        }>, options?: ValidateOptions): boolean;
        /**
         * Validates a document against schema.
         *
         * @param doc the document to be validated.
         * @param schema the schema to validate against.
         * @param options the validation options to be applied.
         */
        validate(doc: S & {
            _id?: ObjectID;
        }, schema?: ObjectSchema<S & {
            _id?: ObjectID;
        }>, options?: ValidateOptions): S & {
            _id?: ObjectID;
        };
        /**
         * Populates document with specified joins.
         *
         * @param doc the document to populate joins for.
         * @param joins an array or IJoins object of joins.
         */
        populate(doc: S & {
            _id?: ObjectID;
        }, joins: string[] | IJoins): Promise<S & {
            _id?: ObjectID;
        }>;
        /**
         * Populates document with specified joins.
         *
         * @param doc the document to populate joins for.
         * @param joins an array or IJoins object of joins.
         */
        populate(docs: (S & {
            _id?: ObjectID;
        })[], joins: string[] | IJoins): Promise<(S & {
            _id?: ObjectID;
        })[]>;
        /**
         * Populates document with specified joins.
         *
         * @param doc the document to populate joins for.
         * @param joins an array or IJoins object of joins.
         */
        populate(doc: S & {
            _id?: ObjectID;
        }, key: string, join: IJoin): Promise<S & {
            _id?: ObjectID;
        }>;
        /**
         * Populates document with specified joins.
         *
         * @param doc the document to populate joins for.
         * @param joins an array or IJoins object of joins.
         */
        populate(docs: (S & {
            _id?: ObjectID;
        })[], key: string, join: IJoin): Promise<(S & {
            _id?: ObjectID;
        })[]>;
        /**
         * Cascades delete with specified joins.
         *
         * @param doc the document to populate joins for.
         * @param joins an array or IJoins object of joins.
         */
        cascade(doc: S & {
            _id?: ObjectID;
        }, joins: string[] | IJoins): Promise<ICascadeResult<S & {
            _id?: ObjectID;
        }>>;
        /**
         * Cascades delete with specified joins.
         *
         * @param doc the document to populate joins for.
         * @param joins an array or IJoins object of joins.
         */
        cascade(doc: (S & {
            _id?: ObjectID;
        })[], joins: string[] | IJoins): Promise<ICascadeResult<S & {
            _id?: ObjectID;
        }>[]>;
        /**
         * Cascades delete with specified joins.
         *
         * @param doc the document to populate joins for.
         * @param joins an array or IJoins object of joins.
         */
        cascade(doc: S & {
            _id?: ObjectID;
        }, key: string, join: IJoin): Promise<ICascadeResult<S & {
            _id?: ObjectID;
        }>>;
        /**
         * Cascades delete with specified joins.
         *
         * @param doc the document to populate joins for.
         * @param joins an array or IJoins object of joins.
         */
        cascade(doc: (S & {
            _id?: ObjectID;
        })[], key: string, join: IJoin): Promise<ICascadeResult<S & {
            _id?: ObjectID;
        }>[]>;
        /**
         * Finds a collection of documents by query.
         *
         * @param filter the Mongodb filter query.
         * @param options Mongodb find options.
         */
        find(filter?: FilterQuery<S & {
            _id?: ObjectID;
        }>, options?: IFindOneOptions): Promise<(S & {
            _id?: ObjectID;
        })[]>;
        /**
         * Finds one document by query.
         *
         * @param filter the Mongodb filter query.
         * @param options Mongodb find options.
         */
        findOne(filter: FilterQuery<S & {
            _id?: ObjectID;
        }>, options?: IFindOneOptions): Promise<S & {
            _id?: ObjectID;
        }>;
        /**
         * Finds one document by id.
         *
         * @param filter the Mongodb filter query.
         * @param options Mongodb find options.
         */
        findById(id: string | number | ObjectID, options?: IFindOneOptions): Promise<S & {
            _id?: ObjectID;
        }>;
        /**
         * Creates document in database.
         *
         * @param doc the document to be persisted to database.
         * @param options Mongodb insert one options.
         */
        create(doc: S & {
            _id?: ObjectID;
        }, options?: CollectionInsertOneOptions): Promise<IInsertOneWriteOpResult<S & {
            _id?: ObjectID;
        }>>;
        /**
         * Creates document in database.
         *
         * @param doc the document to be persisted to database.
         * @param options Mongodb insert one options.
         */
        create(docs: (S & {
            _id?: ObjectID;
        })[], options?: CollectionInsertManyOptions): Promise<IInsertWriteOpResult<S & {
            _id?: ObjectID;
        }>>;
        /**
         * Updates multiple documents by query.
         *
         * @param filter the Mongodb filter for finding the desired documents to update.
         * @param update the update query to be applied.
         * @param options Mongodb update options.
         */
        update(filter: FilterQuery<S & {
            _id?: ObjectID;
        }>, update: Partial<S & {
            _id?: ObjectID;
        }> | UpdateQuery<Partial<S & {
            _id?: ObjectID;
        }>>, options?: UpdateManyOptions): Promise<UpdateWriteOpResult>;
        /**
         * Updates one document by query.
         *
         * @param filter the Mongodb filter for finding the desired documents to update.
         * @param update the update query to be applied.
         * @param options Mongodb update options.
         */
        updateOne(filter: FilterQuery<S & {
            _id?: ObjectID;
        }>, update: Partial<S & {
            _id?: ObjectID;
        }> | UpdateQuery<Partial<S & {
            _id?: ObjectID;
        }>>, options?: UpdateOneOptions): Promise<UpdateWriteOpResult>;
        /**
         * Updates one document by id.
         *
         * @param filter the Mongodb filter for finding the desired documents to update.
         * @param update the update query to be applied.
         * @param options Mongodb update options.
         */
        updateById(id: string | number | ObjectID, update: Partial<S & {
            _id?: ObjectID;
        }> | UpdateQuery<Partial<S & {
            _id?: ObjectID;
        }>>, options?: UpdateOneOptions): Promise<UpdateWriteOpResult>;
        /**
         * Deletes multiple documents by query.
         *
         * @param filter the Mongodb filter for finding the desired documents to update.
         * @param options Mongodb update options.
         */
        delete(filter: FilterQuery<S & {
            _id?: ObjectID;
        }>, options?: CommonOptions): Promise<DeleteWriteOpResultObject>;
        /**
         * Deletes one document by query.
         *
         * @param filter the Mongodb filter for finding the desired documents to update.
         * @param options Mongodb update options.
         */
        deleteOne(filter: FilterQuery<S & {
            _id?: ObjectID;
        }>, options?: CommonOptions): Promise<DeleteWriteOpResultObject>;
        /**
         * Deletes one document by id.
         *
         * @param filter the Mongodb filter for finding the desired documents to update.
         * @param options Mongodb update options.
         */
        deleteById(id: string | number | ObjectID, options?: CommonOptions): Promise<DeleteWriteOpResultObject>;
    } & Constructor<S>;
}
declare const _default: KnectMongo;
export default _default;
