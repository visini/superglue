// These were taken from Scour.js
// Then, modified to respect the id=0 keypath

function getIn (obj, path) {
  const keyPath = normalizeKeyPath(path)
  let result = obj

  for (let i = 0; i < keyPath.length; i++) {
    const key = keyPath[i]
    if (!result) { break }
    result = atKey(result, key)
  }

  return result
}

function clone (object) {
  return Array.isArray(object)
    ? [].slice.call(object)
    : {... object}
}

function getKey (node, key) {
  if (Array.isArray(node) && isNaN(key)) {
    const key_parts = Array.from(key.split('='))
    const attr = key_parts[0]
    const id = key_parts[1]
    let i, child

    if(!id) {
      return key
    }

    for (i = 0; i < node.length; i++) {
      child = node[i]
      if (child[attr].toString() === id) {
        break
      }
    }

    return i
  } else {
    return key
  }
}

function cloneWithout (object, key) {
  if (Array.isArray(object)) {
    key = getKey(object, key)
    return object.slice(0, +key).concat(object.slice(+key + 1))
  } else {
    let result = {}
    key = '' + key
    for (let k in object) {
      if (object.hasOwnProperty(k) && key !== k) {
        result[k] = object[k]
      }
    }
    return result
  }
}

function isArray (ary) {
  return Array.isArray(ary)
}

function isObject (obj) {
  return !isArray(obj) && obj === Object(obj)
}

function atKey (node, key) {
  const [attr, id] = Array.from(key.split('='))

  if(!isArray(node) && !isObject(node)) {
    throw new Error(`Expected to traverse an Array or Obj, got ${JSON.stringify(node)}`)
  }

  if(isObject(node) && id) {
    throw new Error(`Expected to find an Array when using the key: ${key}`)
  }

  if(isObject(node) && !node.hasOwnProperty(key)) {
    throw new Error(`Expected to find key: ${key} in object ${JSON.stringify(node)}`)
  }

  if (Array.isArray(node) && id) {
    let child
    for (let i = 0; i < node.length; i++) {
      child = node[i]
      if (child[attr].toString() === id) {
        break
      }
    }

    if (child[attr].toString() === id) {
      return child
    } else {
      return undefined
    }
  } else {
    return node[key]
  }
}

function normalizeKeyPath (path) {
  if (typeof path === 'string') {
    path = path.replace(/ /g,'')
    if (path === '') {
      return []
    }

    return path.split('.')
  } else {
    return path
  }
}

function setIn (object, keypath, value) {
  keypath = normalizeKeyPath(keypath)

  let results = {}
  let parents = {}
  let i

  parents[0] = object

  for (i = 0; i < keypath.length ; i++) {
    parents[i + 1] = atKey(parents[i], keypath[i])
  }

  results[keypath.length] = value

  for (i = keypath.length - 1; i >= 0; i--) {
    results[i] = clone(parents[i])
    let key = getKey(results[i], keypath[i])
    results[i][key] = results[i + 1]
  }

  return results[0]
}

function delIn (object, keypath) {
  keypath = normalizeKeyPath(keypath)

  let results = {}
  let parents = {}
  let i

  parents[0] = object

  for (i = 0; i < keypath.length ; i++) {
    parents[i + 1] = atKey(parents[i], keypath[i])
  }

  for (i = keypath.length - 1; i >= 0; i--) {
    if (i === keypath.length - 1) {
      results[i] = cloneWithout(parents[i], keypath[i])
    } else {
      results[i] = clone(parents[i])
      results[i][keypath[i]] = results[i + 1]
    }
  }

  return results[0]
}

function ext (obj1, obj2) {
  if (isArray(obj1)) {
    return [...obj1, ...obj2]
  } else {
    return {...obj1, ...obj2}
  }
}

function extendIn (source, keypath, extension) {
  keypath = normalizeKeyPath(keypath)
  if (keypath.length === 0) return ext(source, extension)

  let data = clone(getIn(source, keypath))

  return setIn(source, keypath, ext(data, extension))
}

export {getIn, setIn, delIn, extendIn}
