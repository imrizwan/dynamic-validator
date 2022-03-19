const fs = require('fs')
const path = require('path')
const os = require('os')

let messages = {
    string: ':field must be a string',
    text: ':field is not equal to :subRule',
    maxLength: ':field length must be less than :subRule',
    number: ':field must be a number',
    integer: ':field must be an integer',
    float: ':field must be a float',
    short: ':field must be a short',
    long: ':field must be a long',
    unsignedInt: ':field must be a unsigned int',
    unsignedShort: ':field must be a unsigned short',
    unsignedLong: ':field must be a unsigned long',
    safeInteger: ':field must be a unsigned long',
    decimal: ':field must be a decimal',
    double: ':field must be a double',
    range: ':field must be between :start and :end',
    enum: ':value is not a valid string',
    boolean: ':field must be a boolean',
    object: ':field must be an object',
    has: ':field object does not contain valid properties',
    array: ':field must be an array',
    length: ':field length must be equal to :subRule',
    minLength: ':field length must be greater than :subRule',
    in: ':value is not a valid string',
    notValidField: ':value is not a valid field name',
    required: ':field is required',
    notFound: ':rule does not exist',
}

function inRange(x, min, max) {
    return ((x - min) * (x - max) <= 0);
}

function validator(rules, value, field) {
    let errors = {};
    let [rule, subRule] = rules.split(':');
    if (rule === 'type') {
        if (subRule === 'array') {
            if (!Array.isArray(value)) {
                errors[field] = messages[subRule].replace(':field', field);
            }
        } else if (subRule === 'object') {
            if (typeof value !== 'object' || Array.isArray(value)) {
                errors[field] = messages[subRule].replace(':field', field);
            }
        } else if (subRule === 'boolean') {
            if (typeof value !== 'boolean') {
                errors[field] = messages[subRule].replace(':field', field);
            }
        } else if (subRule === 'string') {
            if (typeof value !== 'string') {
                errors[field] = messages[subRule].replace(':field', field);
            }
        } else if (subRule === 'number') {
            if (typeof value !== 'number') {
                errors[field] = messages[subRule].replace(':field', field);
            }
        } else if (subRule === 'integer' || subRule === 'short') {
            if (typeof value !== 'number' || !Number.isInteger(value) || !inRange(value, -32768, 32767)) {
                errors[field] = messages[subRule].replace(':field', field);
            }
        } else if (subRule === 'long') {
            if (typeof value !== 'number' || !Number.isInteger(value) || !inRange(value, -2147483648, 2147483647)) {
                errors[field] = messages[subRule].replace(':field', field);
            }
        } else if (subRule === 'unsignedInt' || subRule === 'unsignedShort') {
            if (typeof value !== 'number' || !Number.isInteger(value) || !inRange(value, 0, 65535)) {
                errors[field] = messages[subRule].replace(':field', field);
            }
        } else if (subRule === 'unsignedLong') {
            if (typeof value !== 'number' || !Number.isInteger(value) || !inRange(value, 0, 4294967295)) {
                errors[field] = messages[subRule].replace(':field', field);
            }
        } else if (subRule === 'safeInteger') {
            if (typeof value !== 'number' || !Number.isSafeInteger(value)) {
                errors[field] = messages[subRule].replace(':field', field);
            }
        } else if (subRule === 'decimal') {
            if (typeof value !== 'number' || value.toString().indexOf('.') === -1) {
                errors[field] = messages[subRule].replace(':field', field);
            }
        } else if (subRule === 'float') {
            if (typeof value !== 'number' || value.toString().indexOf('.') === -1 || !inRange(value, -3.4e+38, 3.4e+38)) {
                errors[field] = messages[subRule].replace(':field', field);
            }
        } else if (subRule === 'double') {
            if (typeof value !== 'number' || value.toString().indexOf('.') === -1 || !inRange(value, -1.7e+308, 1.7e+308)) {
                errors[field] = messages[subRule].replace(':field', field);
            }
        }
    } else if (rule === 'enum') {
        let enums = subRule.split(',');
        if (!enums.includes(value)) {
            errors[field] = messages[rule].replace(':value', value);
        }
    } else if (rule === 'has') {
        let hasVals = subRule.split(',');
        if (typeof value !== 'object' || Array.isArray(value)) {
            errors[field] = messages[rule].replace(':field', field);
        } else {
            let matched = true;
            hasVals.forEach(inVal => {
                if (!value.hasOwnProperty(inVal)) {
                    matched = false;
                }
            });
            if (!matched) {
                errors[field] = messages[rule].replace(':field', field);
            }
        }
    } else if (rule === 'range') {
        [start, end] = subRule.split(',');
        start = isNaN(Number(start)) ? 0 : Number(start);
        end = isNaN(Number(end)) ? 0 : Number(end);
        if (typeof value !== 'number' || !inRange(value, start, end)) {
            errors[field] = messages[rule].replace(':field', field).replace(':start', start).replace(':end', end);
        }
    } else if (rule === 'text') {
        if (subRule !== value) {
            errors[field] = messages[rule].replace(':field', field).replace(':subRule', subRule);
        }
    } else if (rule === 'maxLength') {
        if (typeof Number(subRule) === 'number' && value.length > Number(subRule)) {
            errors[field] = messages[rule].replace(':field', field).replace(':subRule', subRule);
        }
    } else if (rule === 'minLength') {
        if (typeof Number(subRule) === 'number' && value.length < Number(subRule)) {
            errors[field] = messages[rule].replace(':field', field).replace(':subRule', subRule);
        }
    } else if (rule === 'length') {
        if (typeof Number(subRule) === 'number' && value.length !== Number(subRule)) {
            errors[field] = messages[rule].replace(':field', field).replace(':subRule', subRule);
        }
    } else if (rule === 'in') {
        let inVals = subRule.split(',');
        inVals.forEach(item => {
            if (!value.includes(item)) {
                if (field === "dynamic") errors["error"] = messages["notValidField"].replace(':value', item)
                else errors[field] = messages[rule].replace(':value', item);
            }
        })
    } else if (rule === 'required') {
        if (value === undefined || value === null || value === '' || value === "undefined" || value === "null" || value === [] || value === {}) {
            errors[field] = messages[rule].replace(':field', field);
        }
    } else {
        errors[field] = messages["notFound"].replace(':rule', rule);
    }

    return errors;
}

function config(body, schema) {
    let errors = {};
    Object.keys(schema).forEach((key, index) => {
        let [val] = key.split("|");
        if (val.charAt(0) === "[" && val.slice(-1) === "]") {
            let temp = Object.keys(body)[index];
            errors = { ...errors, ...validator(`in:${val.slice(1, -1)}`, temp, "dynamic") };
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