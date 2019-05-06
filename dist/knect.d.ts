import { MongoClient, MongoClientOptions, Db } from 'mongodb';
import { ISchema, ISchemas } from './types';
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
    model<S extends object = any>(name: string, config?: ISchema<Partial<S>>): any;
}
declare const _default: KnectMongo;
export default _default;
