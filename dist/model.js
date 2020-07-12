"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Model = void 0;
const yup_1 = require("yup");
const utils_1 = require("./utils");
class Model {
    constructor(doc, document) {
        const model = this;
        Object.defineProperties(this, {
            _Document: {
                enumerable: false,
                configurable: false,
                writable: false,
                value: document
            },
            _doc: {
                enumerable: false,
                writable: true,
                value: doc || {}
            }
        });
        const fields = document.schema.props.fields || {};
        for (const k in fields) {
            Object.defineProperty(this, k, {
                get() {
                    return model._doc[k];
                },
                set(v) {
                    model._doc[k] = v;
                }
            });
        }
    }
    /**
     * Creates and persists instance to database.
     *
     * @param options Mongodb create options.
     */
    async create(options) {
        let doc = this._doc;
        // Remove any populated data so it isn't
        // updated.
        doc = this._Document.unpopulate(doc);
        this._Document.validate(doc);
        if (this._id)
            return Promise.reject(new yup_1.ValidationError([`Cannot create for collection "${this._Document.collection.namespace}" with existing 
            id, did you mean ".save()"?`], doc, 'id'));
        // TODO: Typing issue with Doc.
        const { err, data } = await utils_1.promise(this._Document.createOne(doc, options));
        if (err)
            return Promise.reject(err);
        this._doc = ((data.ops && data.ops[0]) || {});
        return {
            ok: data.result.ok,
            insertId: data.insertedId,
            doc: this._doc,
            response: data
        };
    }
    /**
     * Updates a single record by id.
     *
     * @param options the update options.
     */
    async update(options) {
        // @ts-ignore
        options = { upsert: false, returnOriginal: false, ...options };
        options.upsert = false;
        this._doc = this._Document.unpopulate(this._doc);
        this._doc = this._Document.validate(this._doc);
        const { _id, ...clone } = this._doc;
        const { err, data } = await utils_1.promise(this._Document.findUpdate(this._id, clone, options));
        if (err)
            return Promise.reject(err);
        this._doc = data.value;
        return {
            ok: data.ok,
            insertId: null,
            doc: this._doc,
            response: data
        };
    }
    /**
     * Saves changes persisting instance in database.
     *
     * @param options MongoDB update options.
     */
    async save(options) {
        // If no id try create.
        if (!this._id)
            return this.create(options);
        return this.update(options);
    }
    /**
     * Deletes document persisting in database.
     *
     * @param options Mongodb delete options.
     */
    async delete(options) {
        return this._Document.findDelete(this._id, options);
    }
    /**
     * Propulates child values based on join configurations.
     *
     * @param names the names of joins that should be populated.
     */
    async populate(...names) {
        const { err, data } = await utils_1.promise(this._Document.populate(this._doc, names));
        if (err)
            return Promise.reject(err);
        this._doc = data;
        return Promise.resolve(data);
    }
    /**
     * Validates instance against schema.
     *
     * @param schema optional schema to verify by or uses defined.
     */
    validate(schema) {
        return this._Document.validate(this._doc, schema);
    }
    /**
     * Checks if instance is valid against schema.
     *
     * @param schema optional schema to verify by or uses defined.
     */
    isValid(schema) {
        return this._Document.isValid(this._doc, schema);
    }
}
exports.Model = Model;
//# sourceMappingURL=model.js.map