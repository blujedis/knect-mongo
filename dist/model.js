"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const yup_1 = require("yup");
const utils_1 = require("./utils");
class Model {
    constructor(doc, document) {
        const model = this;
        this._doc = doc || {};
        this._Document = document;
        const fields = this._Document.schema.props.fields || {};
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
        const doc = this._doc;
        this._Document.validate(doc);
        if (this._id)
            throw new yup_1.ValidationError([`Cannot create for collection "${this._Document.collection.namespace}" with existing 
            id, did you mean ".save()"?`], doc, 'id');
        const { err, data } = await utils_1.me(this._Document.createOne(doc, options));
        if (err)
            throw err;
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
        options = options || {};
        options.upsert = false;
        this._Document.validate(this._doc);
        const { err, data } = await utils_1.me(this._Document.findUpdate(this._id, this._doc, options));
        if (err)
            throw err;
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