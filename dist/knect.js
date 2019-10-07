"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongodb_1 = require("mongodb");
const utils_1 = require("./utils");
const model_1 = require("./model");
const document_1 = require("./document");
exports.MONGO_CLIENT_DEFAULTS = {
    useNewUrlParser: true,
    useUnifiedTopology: true
};
class KnectMongo {
    constructor() {
        this.schemas = new Map();
        this.delimiter = '.'; // used for defining schema names.
    }
    /**
     * Accepts a schema and creates model with static and instance convenience methods.
     *
     * @param name the name of the collection
     * @param schema the schema configuration containing document validation.
     */
    createModel(name, schema) {
        const knect = this;
        this.schemas.set(name, schema);
        const Document = document_1.initDocument(schema, knect.client, knect.db, model_1.Model);
        return Document;
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
     * @param collectionName specify the collection name otherwise schema name is used.
     */
    model(ns, schema) {
        const parsedNs = utils_1.fromNamespace(ns, this.delimiter);
        let _ns = ns;
        let _schema = schema;
        // Return the existing schema/model by name.
        if (!schema && this.schemas[parsedNs.ns]) {
            _schema = this.schemas.get(parsedNs.ns);
        }
        else {
            _ns = parsedNs.ns;
            schema.collectionName = schema.collectionName || parsedNs.collection;
        }
        const DocumentModel = this.createModel(_ns, _schema);
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