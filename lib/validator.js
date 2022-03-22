const { validator } = require("./rules")
const { subRules } = require('./subRules');


function config(body, schema) {
    let errors = {};
    Object.keys(schema).forEach((key, index) => {
        let [val] = key.split("|");
        if (val.charAt(0) === "[" && val.slice(-1) === "]") {
            let temp = Object.keys(body)[index];
            errors = { ...errors, ...validator(`dynamic:${val.slice(1, -1)}`, temp, subRules.dynamic) };
            val = temp;
        }
        if (Array.isArray(body[val])) {
            const [obj, ...rules] = key.split("|");
            rules.forEach(field => {
                errors = { ...errors, ...validator(field, body[val], val) };
            });
            const [j] = schema[key];
            if (j) {
                body[val].forEach(i => {
                    errors = { ...errors, ...config(i, j) };
                });
            }
        } else if (typeof body[val] === 'object' && !Array.isArray(body[val])) {
            const [obj, ...rules] = key.split("|");
            rules.forEach(field => {
                errors = { ...errors, ...validator(field, body[val], val) };
            });
            errors = { ...errors, ...config(body[val], schema[key]) };
        } else if (typeof body[val] === 'boolean' || typeof body[val] === 'string' || typeof body[val] === 'number') {
            if (val !== key) {
                const [obj, ...rules] = key.split("|");
                rules.forEach(field => {
                    errors = { ...errors, ...validator(field, body[val], val) };
                });
            } else {
                let rules = schema[val].split('|');
                rules.forEach(field => {
                    errors = { ...errors, ...validator(field, body[val], val) };
                });
            }
        }
    });
    return errors;
}

const Module = {
    config
}

module.exports.config = Module.config