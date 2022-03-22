const { messages } = require('./messages');
const { subRules } = require('./subRules');
const { inRange } = require('./utils');
module.exports.validator = (rules, value, field) => {
    let errors = {};
    let [rule, subRule] = rules.split(':');
    if (rule === subRules.type) {
        if (subRule === subRules.array) {
            if (!Array.isArray(value)) {
                errors[field] = messages[subRule].replace(subRules.field, field);
            }
        } else if (subRule === subRules.object) {
            if (typeof value !== subRules.object || Array.isArray(value)) {
                errors[field] = messages[subRule].replace(subRules.field, field);
            }
        } else if (subRule === subRules.boolean) {
            if (typeof value !== subRules.boolean) {
                errors[field] = messages[subRule].replace(subRules.field, field);
            }
        } else if (subRule === subRules.string) {
            if (typeof value !== subRules.string) {
                errors[field] = messages[subRule].replace(subRules.field, field);
            }
        } else if (subRule === subRules.number) {
            if (typeof value !== subRules.number) {
                errors[field] = messages[subRule].replace(subRules.field, field);
            }
        } else if (subRule === subRules.integer || subRule === subRules.short) {
            if (typeof value !== subRules.number || !Number.isInteger(value) || !inRange(value, -32768, 32767)) {
                errors[field] = messages[subRule].replace(subRules.field, field);
            }
        } else if (subRule === subRules.long) {
            if (typeof value !== subRules.number || !Number.isInteger(value) || !inRange(value, -2147483648, 2147483647)) {
                errors[field] = messages[subRule].replace(subRules.field, field);
            }
        } else if (subRule === subRules.unsignedInt || subRule === subRules.unsignedShort) {
            if (typeof value !== subRules.number || !Number.isInteger(value) || !inRange(value, 0, 65535)) {
                errors[field] = messages[subRule].replace(subRules.field, field);
            }
        } else if (subRule === subRules.unsignedLong) {
            if (typeof value !== subRules.number || !Number.isInteger(value) || !inRange(value, 0, 4294967295)) {
                errors[field] = messages[subRule].replace(subRules.field, field);
            }
        } else if (subRule === subRules.safeInteger) {
            if (typeof value !== subRules.number || !Number.isSafeInteger(value)) {
                errors[field] = messages[subRule].replace(subRules.field, field);
            }
        } else if (subRule === subRules.decimal) {
            if (typeof value !== subRules.number || value.toString().indexOf('.') === -1) {
                errors[field] = messages[subRule].replace(subRules.field, field);
            }
        } else if (subRule === subRules.float) {
            if (typeof value !== subRules.number || value.toString().indexOf('.') === -1 || !inRange(value, -3.4e+38, 3.4e+38)) {
                errors[field] = messages[subRule].replace(subRules.field, field);
            }
        } else if (subRule === subRules.double) {
            if (typeof value !== subRules.number || value.toString().indexOf('.') === -1 || !inRange(value, -1.7e+308, 1.7e+308)) {
                errors[field] = messages[subRule].replace(subRules.field, field);
            }
        }
    } else if (rule === subRules.enum) {
        let enums = subRule.split(',');
        if (!enums.includes(value)) {
            errors[field] = messages[rule].replace(subRules.value, value);
        }
    } else if (rule === subRules.has) {
        let hasVals = subRule.split(',');
        if (typeof value !== subRules.object || Array.isArray(value)) {
            errors[field] = messages[rule].replace(subRules.field, field);
        } else {
            let matched = true;
            hasVals.forEach(inVal => {
                if (!value.hasOwnProperty(inVal)) {
                    matched = false;
                }
            });
            if (!matched) {
                errors[field] = messages[rule].replace(subRules.field, field);
            }
        }
    } else if (rule === subRules.range) {
        [start, end] = subRule.split(',');
        start = isNaN(Number(start)) ? 0 : Number(start);
        end = isNaN(Number(end)) ? 0 : Number(end);
        if (typeof value !== subRules.number || !inRange(value, start, end)) {
            errors[field] = messages[rule].replace(subRules.field, field).replace(':start', start).replace(':end', end);
        }
    } else if (rule === subRules.text) {
        if (subRule !== value) {
            errors[field] = messages[rule].replace(subRules.field, field).replace(':subRule', subRule);
        }
    } else if (rule === subRules.maxLength) {
        if (typeof Number(subRule) === subRules.number && value.length > Number(subRule)) {
            errors[field] = messages[rule].replace(subRules.field, field).replace(':subRule', subRule);
        }
    } else if (rule === subRules.minLength) {
        if (typeof Number(subRule) === subRules.number && value.length < Number(subRule)) {
            errors[field] = messages[rule].replace(subRules.field, field).replace(':subRule', subRule);
        }
    } else if (rule === subRules.length) {
        if (typeof Number(subRule) === subRules.number && value.length !== Number(subRule)) {
            errors[field] = messages[rule].replace(subRules.field, field).replace(':subRule', subRule);
        }
    } else if (rule === subRules.in) {
        let inVals = subRule.split(',');
        if(!value.every(i => inVals.includes(i))){
            let diff = value.filter(x => !inVals.includes(x))
            errors[field] = messages[rule].replace(subRules.value, diff.join(", "));
        }
    } else if (rule === subRules.dynamic) {
        let inVals = subRule.split(',');
        if(!inVals.includes(value)){
            errors[subRules.error] = messages[subRules.notValidField].replace(subRules.value, value)
        }
    } else if (rule === subRules.required) {
        if (value === undefined || value === null || value === '' || value === subRules.undefined || value === subRules.null || value === [] || value === {}) {
            errors[field] = messages[rule].replace(subRules.field, field);
        }
    } else {
        errors[field] = messages[subRules.notFound].replace(':rule', rule);
    }

    return errors;
}