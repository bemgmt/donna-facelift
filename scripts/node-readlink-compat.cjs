const fs = require('fs')

const originalReadlink = fs.readlink
const originalReadlinkSync = fs.readlinkSync
const originalPromisesReadlink = fs.promises?.readlink

function normalizeReadlinkError(error, path) {
  if (error?.code === 'EISDIR') {
    error.code = 'EINVAL'
    error.message = error.message.replace('EISDIR', 'EINVAL')
  }
  return error
}

fs.readlink = function readlink(path, options, callback) {
  if (typeof options === 'function') {
    return originalReadlink.call(fs, path, (error, linkString) => {
      options(error ? normalizeReadlinkError(error, path) : null, linkString)
    })
  }

  return originalReadlink.call(fs, path, options, (error, linkString) => {
    callback(error ? normalizeReadlinkError(error, path) : null, linkString)
  })
}

fs.readlinkSync = function readlinkSync(path, options) {
  try {
    return originalReadlinkSync.call(fs, path, options)
  } catch (error) {
    throw normalizeReadlinkError(error, path)
  }
}

if (originalPromisesReadlink) {
  fs.promises.readlink = async function readlink(path, options) {
    try {
      return await originalPromisesReadlink.call(fs.promises, path, options)
    } catch (error) {
      throw normalizeReadlinkError(error, path)
    }
  }
}
