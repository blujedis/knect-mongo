"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const yup_1 = require("yup");
// SCHEMAS //
const baseSchema = yup_1.object({
    _id: yup_1.mixed(),
    created: yup_1.number(),
    modified: yup_1.number()
});
const userSchema = baseSchema.shape({
    firstName: yup_1.string(),
    lastName: yup_1.string(),
    posts: yup_1.array()
});
const postSchema = baseSchema.shape({
    title: yup_1.string().required(),
    body: yup_1.string(),
    user: yup_1.mixed().required()
});
exports.UserSchema = {
    props: userSchema,
    joins: {
        posts: { collection: 'post' }
    }
};
exports.PostSchema = {
    props: postSchema,
    joins: {
        user: { collection: 'user' }
    }
};
//# sourceMappingURL=models.js.map