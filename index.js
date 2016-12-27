/**
 * Created by killa on 12/23/15.
 */

'use strict';

const debug = require('debug')('KValidateModel');

class KValidateModel {
  constructor(data) {
    if (Array.isArray(this.schema)) {
      debug('you are using Array Schema,it will return Array not KValidateModel instance');
      return this.validateModel(data, this.schema);
    }
    this.validatePath(data, this.path, this.schema);
    this.validateModel(data, this.schema);
  }

  validateData(data, schema, key) {
    key = key || '';
    let error;
    if (schema.required === true && typeof data === 'undefined') {
      error = new Error(key + ' is required ');
      error.code = schema.code;
      throw error;
    }
    if (typeof data === 'undefined' || data === null) return data;
    if (schema.type === 'date') {
      const timestamp = Date.parse(data);
      if (isNaN(timestamp)) {
        error = new TypeError(key + ' expected date actual is ' + data);
        error.code = schema.code;
        throw error;
      }
      data = new Date(data);
    } else if (typeof data != schema.type) {
      error = new TypeError(key + ' expected ' + schema.type + ' actual is ' + typeof data);
      error.code = schema.code;
      throw error;
    }
    return data;
  }

  validateModel(data, schema) {
    if (data == null) return null;

    if (Array.isArray(schema)) return this.validateArray(data, schema);

    if (typeof schema !== 'object') {
      throw new TypeError(schema + ' is not supported');
    }
    const keys = Object.keys(schema);
    if (this.isSchema(keys)) return this.validateData(data, schema);
    keys.forEach(key => this.processKey(key,data[key], schema[key]));
    return this;
  }

  processKey(key, data, schema) {
    if (typeof schema === 'string') {
      this.validateData(data, schema, key);
    } else if (schema.type) {
      if (typeof schema.type === 'string') {
        this[key] = this.validateData(data, schema, key);
      } else if (typeof schema.type === 'function') {
        this[key] = data ? new schema.type(data) : void 0;
      }
    } else if (Array.isArray(schema)) {
      this[key] = data ? this.validateArray(data, schema) : void 0;
    } else if (typeof schema === 'function') {
      this[key] = data ? new schema(data) : void 0;
    } else {
      throw new TypeError(key + ' ' + schema + ' is not supported');
    }
  }

  isSchema(keys, schema) {
    if (keys.length === 1 && keys[0] === 'type') return true;
    if (keys.length === 2) {
      if (
        keys[0] === 'type' && keys[1] === 'required' ||
        keys[1] === 'type' && keys[0] === 'required') return true;
    }
    return false;
  }

  validatePath(data, path, schema) {
    path = path || {};
    schema = schema || {};
    const keys = Object.keys(path);
    keys.forEach(function(key) {
      if ((path[key](data[key]))) return;
      const error = new Error(key + ' is invalidate');
      error.code = schema[key].code;
      throw error;
    });
  }

  validateArray(obj, schema) {
    let error;
    schema = schema[0];
    if (!Array.isArray(obj)) {
      error = new Error(obj + ' is not array');
      throw error;
    }
    if (typeof schema === 'function') {
      return obj.map(temp => new schema(temp));
    } else {
      const keys = Object.keys(schema);
      if (this.isSchema(keys)) {
        return obj.map(temp => this.validateData(temp, schema));
      } else {
        let tempClass = class extends KValidateModel {
          get schema() {
            return schema;
          }
        };
        return obj.map(temp => new tempClass(temp));
      }
    }
  }

}

module.exports = KValidateModel;