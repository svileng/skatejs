import apiChain from '../api/chain';
import data from '../util/data';
import protos from '../util/protos';

var lifecycleNames = ['created', 'updated', 'removed'];

function validLifecycles (obj) {
  return protos(obj || {})
    .reduce((prev, curr) => prev.concat(Object.getOwnPropertyNames(curr)), [])
    .filter((key, idx, arr) => arr.lastIndexOf(key) === idx)
    .filter(key => lifecycleNames.some(val => key.indexOf(val) !== -1));
}

function resolveType (oldValue, newValue) {
  var newValueIsString = typeof newValue === 'string';
  var oldValueIsString = typeof oldValue === 'string';

  if (!oldValueIsString && newValueIsString) {
    return 'created';
  } else if (oldValueIsString && newValueIsString) {
    return 'updated';
  } else if (oldValueIsString && !newValueIsString) {
    return 'removed';
  }
}

function makeSpecificCallback (types) {
  if (typeof types === 'function') {
    return types;
  }

  var map = validLifecycles(types).reduce(function (obj, unsplit) {
    return unsplit.split(' ').reduce(function (obj, split) {
      (obj[split] = obj[split] || []).push(unsplit);
      return obj;
    }, obj);
  }, {});

  return function (diff) {
    (map[diff.type] || []).forEach(cb => types[cb].call(this, diff));
  };
}

function makeGlobalCallback (attrs) {
  if (typeof attrs === 'function') {
    return attrs;
  }

  var fns = Object.keys(attrs || {}).reduce(function (prev, curr) {
    prev[curr] = makeSpecificCallback(attrs[curr]);
    return prev;
  }, {});

  return function (diff) {
    apiChain(fns[diff.name]).call(this, diff);
  };
}

export default function (opts) {
  var callback = makeGlobalCallback(opts.attributes);
  return function (name, oldValue, newValue) {
    var info = data(this);
    var attributeToPropertyMap = info.attributeToPropertyMap || {};

    callback.call(this, {
      name: name,
      newValue: newValue === undefined ? null : newValue,
      oldValue: oldValue === undefined ? null : oldValue,
      type: resolveType(oldValue, newValue)
    });

    // Ensure properties are notified of this change. We only do this if we're
    // not already updating the attribute from the property. This is so that
    // we don't invoke an infinite loop.
    if (attributeToPropertyMap[name] && !info.updatingAttribute) {
      info.updatingProperty = true;
      this[attributeToPropertyMap[name]] = newValue;
      info.updatingProperty = false;
    }
  };
}
