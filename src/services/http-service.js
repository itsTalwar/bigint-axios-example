import axios from 'axios';
import normalizeHeaderName from 'axios/lib/helpers/normalizeHeaderName';
import utils from 'axios/lib/utils';
var JSONbigNative = require('json-bigint')({ useNativeBigInt: true });

const setContentTypeIfUnset = (headers, value) => {
    if (!utils.isUndefined(headers) && utils.isUndefined(headers['Content-Type'])) {
        headers['Content-Type'] = value;
    }
}

// Overriding the transformResponse of axios and converting any number which crosses JS max limit to string using stringify
// Remember the data is received as string in case of string not JSON over the network that's why we need parser always
// Default JSON.parse will transform the huge number to some random number which is an issue
axios.defaults.transformResponse = [(data) => {
    if (typeof data === 'string') {
      try {
        data = JSONbigNative.parse(data);
      } catch (e) { /* Ignore */ }
    }
    return data;
}];

// Overriding the transformRequest of axios and converting the strings to bigInt and stringy them
// Remember that we can't stringfy BigInt in JS that's why we need a custom stringy
axios.defaults.transformRequest = [(data, headers) => {
    normalizeHeaderName(headers, 'Accept');
    normalizeHeaderName(headers, 'Content-Type');
    if (utils.isFormData(data) ||
      utils.isArrayBuffer(data) ||
      utils.isBuffer(data) ||
      utils.isStream(data) ||
      utils.isFile(data) ||
      utils.isBlob(data)
    ) {
      return data;
    }
    if (utils.isArrayBufferView(data)) {
      return data.buffer;
    }
    if (utils.isURLSearchParams(data)) {
      setContentTypeIfUnset(headers, 'application/x-www-form-urlencoded;charset=utf-8');
      return data.toString();
    }
    if (utils.isObject(data)) {
      setContentTypeIfUnset(headers, 'application/json;charset=utf-8');
      return JSONbigNative.stringify(data);
    }
    return data;
}];