"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KnectMongo = exports.MONGO_CLIENT_DEFAULTS = void 0;
const mongodb_1 = require("mongodb");
const utils_1 = require("./utils");
const model_1 = require("./model");
const document_1 = require("./document");
const map_1 = require("./map");
exports.MONGO_CLIENT_DEFAULTS = {
    useNewUrlParser: true,
    useUnifiedTopology: true
};
const DEFAULTS = {
    delimiter: '.',
    isValid: (...args) => Promise.resolve(true),
    validate: (ns, doc) => Promise.resolve(doc)
};
class KnectMongo {
    constructor(options) {
        this.models = new map_1.ModelMap();
        if (KnectMongo.instance)
            return KnectMongo.instance;
        this.options = { ...DEFAULTS, ...options };
        if (this.options.uri)
            this.connect(this.options.uri, this.options.clientOptions);
        KnectMongo.instance = this;
    }
    /**
     * Ensures schema is valid configuration.
     *
     * @param name the name of the schema.
     * @param schema the schema object.
     */
    normalizeSchema(name, schema) {
        schema.joins = schema.joins || {};
        if (!schema.collectionName)
            throw new Error(`Cannot normalize schema "${name} using collectionName of undefined`);
        for (const k in schema.joins) {
            const join = schema.joins[k];
            if (!join.collection)
                throw new Error(`Cannot normalize schema "${name}" using join "${k}" with collection of undefined.`);
            join.key = join.key || '_id';
            join.options = join.options || {};
        }
        return schema;
    }
    /**
     * Connects to Mongodb instance.
     *
     * @param uri the Mongodb connection uri.
     * @param options Mongodb client connection options.
     */
    async connect(uri = this.options.uri, options = this.options.clientOptions) {
        if (this.client)
            return this.client;
        options = { ...exports.MONGO_CLIENT_DEFAULTS, ...options };
        this.dbname = utils_1.parseDbName(uri) || null;
        this.client = await mongodb_1.MongoClient.connect(uri, options);
        if (this.dbname)
            this.db = this.client.db(this.dbname);
        return this.client;
    }
    /**
     * Sets the database.
     *
     * @param name the database name to connect to.
     */
    async setDb(name) {
        if (!this.client)
            throw new Error(`Cannot set database with MongoClient of undefined.`);
        if (!this.client.isConnected())
            await this.client.connect();
        this.db = this.client.db(name);
        return this.db;
    }
    /**
     * Accepts a schema and creates model with static and instance convenience methods.
     *
     * @param ns the namespace for the schema.
     * @param schema the schema configuration containing document validation.
     */
    model(ns, schema) {
        const parsedNs = utils_1.fromNamespace(ns, this.options.delimiter);
        if (!schema) {
            const model = this.models.get(ns);
            if (!model)
                throw new Error(`Model "${ns}" could NOT be found.`);
            return model;
        }
        schema.collectionName = schema.collectionName || parsedNs.collection;
        schema = this.normalizeSchema(ns, schema);
        const DocumentModel = document_1.initDocument(schema, this.client, this.db, model_1.Model, this);
        this.models.set(ns, DocumentModel);
        return DocumentModel;
    }
}
exports.KnectMongo = KnectMongo;
// let _instance: KnectMongo;
/**
 * Gets singleton instance of KnectMongo
 */
// function getInstance(options?: IOptions) {
//   if (!_instance)
//     _instance = new KnectMongo(options);
//   return _instance;
// }
// export default getInstance;
//# sourceMappingURL=knect.js.map