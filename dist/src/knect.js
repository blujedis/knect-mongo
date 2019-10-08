"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongodb_1 = require("mongodb");
const utils_1 = require("./utils");
const model_1 = require("./model");
const document_1 = require("./document");
const map_1 = require("./map");
exports.MONGO_CLIENT_DEFAULTS = {
    useNewUrlParser: true,
    useUnifiedTopology: true
};
class KnectMongo {
    constructor() {
        this.models = new map_1.ModelMap();
        this.delimiter = '.'; // used for defining schema names.
    }
    /**
     * Ensures schema is valid configuration.
     *
     * @param name the name of the schema.
     * @param schema the schema object.
     */
    normalizeSchema(name, schema) {
        schema.props = schema.props || {};
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
    async connect(uri, options) {
        if (this.db)
            return this.db;
        options = { ...exports.MONGO_CLIENT_DEFAULTS, ...options };
        this.dbname = utils_1.parseDbName(uri);
        this.client = await mongodb_1.MongoClient.connect(uri, options);
        this.db = this.client.db(this.dbname);
        return this.db;
    }
    /**
     * Accepts a schema and creates model with static and instance convenience methods.
     *
     * @param ns the namespace for the schema.
     * @param schema the schema configuration containing document validation.
     */
    model(ns, schema) {
        const parsedNs = utils_1.fromNamespace(ns, this.delimiter);
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
        // return DocumentModel as typeof DocumentModel & Constructor<Model<S> & S>;
        // return DocumentModel as Document & DocumentContructor<Model<S>, S>;
        return DocumentModel;
    }
}
exports.KnectMongo = KnectMongo;
let _instance;
/**
 * Gets singleton instance of KnectMongo
 */
function getInstance() {
    if (!_instance)
        _instance = new KnectMongo();
    return _instance;
}
exports.default = getInstance();
//# sourceMappingURL=knect.js.map