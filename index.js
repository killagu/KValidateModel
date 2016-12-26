/**
 * Created by killa on 12/23/15.
 */

'use strict';

var debug = require('debug')('KValidateModel');

class KValidateModel {
  constructor(data) {
    if (Array.isArray(this.schema)) {
      debug(
        'you are using Array Schema,it will return Array not KValidateModel instance'
      );
      return this.validateModel(data, this.schema);
    }
    this.validatePath(data, this.path, this.schema);
    this.validateModel(data, this.schema);
  }

  validateData(data, schema, key) {
    key = key || '';
    var error;
    if (schema.required === true && typeof data === 'undefined') {
      error = new Error(key + ' is required ');
      if (schema.code) {
        error.code = schema.code;
      }
      throw error;
    }
    if (typeof data === 'undefined') {
      return undefined;
    }
    if (data === null) {
      return null;
    }
    if (schema.type === 'date') {
      if (!data) {
        return undefined;
      }
      try {
        if (data.indexOf('T') > 0) {
          let [date, time] = data.split('T');
          let hour = time.split(':').shift();
          if (hour.length == 1) {
            hour = '0' + hour;
            time = hour + time.substr(1);
            data = `${date}T${time}`;
          }
        }
      } catch (e) {
        error = new TypeError(key + ' expected date actual is ' + data);
        if (schema.code) {
          error.code = schema.code;
        }
        throw error;
      }
      var timestamp = Date.parse(data);
      if (isNaN(timestamp)) {
        error = new TypeError(key + ' expected date actual is ' + data);
        if (schema.code) {
          error.code = schema.code;
        }
        throw error;
      }
      data = new Date(data);
    } else if (typeof data != schema.type) {
      error = new TypeError(key + ' expected ' + schema.type + ' actual is ' +
        typeof data);
      if (schema.code) {
        error.code = schema.code;
      }
      throw error;
    }
    return data;
  }

  validateModel(data, schema) {
    debug(data);
    if (data == null) {
      return null;
    }
    if (Array.isArray(schema)) {
      return this.validateArray(data, schema)
    } else if (typeof schema === 'object') {
      var keys = Object.keys(schema);
      if (keys.length === 1 && keys[0] === 'type') {
        return this.validateData(data, schema);
      }
      keys.forEach(key => {
        debug(key);
        var tempSchema = schema[key];
        debug(tempSchema);
        if (typeof tempSchema === 'string') {
          this.validateData(data[key], tempSchema, key);
        } else if (tempSchema.type) {
          if (typeof tempSchema.type === 'string') {
            debug('type is string');
            this[key] = this.validateData(data[key], tempSchema, key);
          } else if (typeof tempSchema.type === 'function') {
            debug('type is function');
            if (data[key]) {
              this[key] = new tempSchema.type(data[key]);
            }
          }
        } else if (Array.isArray(tempSchema)) {
          debug('type is array');
          if (data[key]) {
            this[key] = this.validateArray(data[key], tempSchema);
          }
        } else if (typeof tempSchema === 'object') {
          debug('type is object');
          if (data[key]) {
            class TempSchema extends KValidateModel {
              get schema() {
                return tempSchema
              }
            }
            this[key] = new TempSchema(data[key]);
          }
        } else if (typeof tempSchema === 'function') {
          debug('type if class');
          this[key] = new tempSchema(data[key]); //validateModel(data, tempSchema);
        } else {
          throw new TypeError(key + ' ' + tempSchema +
            ' is not supported');
        }
      });
      return this;
    } else {
      throw new TypeError(schema + ' is not supported');
    }
  }

  validatePath(data, path, schema) {
    path = path || {};
    schema = schema || {};
    var keys = Object.keys(path);
    keys.forEach(function(key) {
      if (!(path[key](data[key]))) {
        var error = new Error(key + ' is invalidate');
        if (schema[key].code) {
          error.code = schema[key].code;
        }
        throw error;
      }
    });
  }

  validateArray(obj, schema) {
    var error;
    schema = schema[0];
    if (!Array.isArray(obj)) {
      error = new Error(obj + ' is not array');
      throw error;
    }
    if (typeof schema === 'function') {
      return obj.map(temp => {
        return new schema(temp);
      });
    } else {
      const keys = Object.keys(schema);
      if (
        (keys.length === 1 && keys[0] === 'type') ||
        (keys.length === 2 && typeof schema['code'] == 'number')
      ) {
        return obj.map(temp => {
          return this.validateData(temp, schema);
        });
      } else {
        let tempClass = class extends KValidateModel {
          get schema() {
            return schema;
          }
        };
        return obj.map(temp => {
          return new tempClass(temp);
        });
      }
    }
  }

}

module.exports = KValidateModel;
