/**
 * @Author: Firmiana
 * @Date: 2019-10-02 15:09:07
 * @Desc: fs封装
 */

const fs = require('fs'),
  util = require('util'),
  path = require('path'),

  contentTypeMap = {
    'image/tiff': 'tif',
    'image/gif': 'gif',
    'image/x-icon': 'ico',
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/vnd.wap.wbmp': 'wbmp'
  }

module.exports = {
  fileLock,
  getFileExt,
  getPath,
  mkdir,
  rename,
  saveFile,
  writeFile,
  saveUploadFile,
  readFile,
  readDir,
  unLink,
  removeDir,
  zip,
  deleteFolder
}

/**
 * 使用文件做锁
 * ps. 为了防止其它客户端误解锁，解锁需要传入这个方法返回的key
 * @param lockname
 * @param expire 锁持续时间，单位毫秒
 * */
async function fileLock(lockname, expire) {
  const pa = path.join(__dirname, `lock_file_${lockname}`)
  const res = await this.saveFile(pa, expire + new Date())
  if (!res) {
    const file = await this.readFile(pa)
    if (!file) {
      return false
    }
  }
}

// 可以传 contentType 的字符串，也可以传文件名，返回的扩展名是没有 . 号的
function getFileExt(file) {
  return contentTypeMap[file] || (file.match(/\.([^.?#]+)(\?.*)?(#.*)?$/) || [])[1] || ''
}

// 获取一个路径中，文件夹的路径，最后一段如果不是以 / 结尾，则认为不是文件夹
function getPath(dir) {
  // /[^/]+\/?$/i UNIX
  // /[^\\]+\\?$/i WINDOW
  return dir.replace(new RegExp(`[^\\${path.sep}\\/]+$`), '')
}

/**
 * 创建多级目录，如果成功，或者目录早已存在，则返回true，否则返回false
 * @param dir string 需要创建的文件夹
 * @param isRecursion Boolean 外部无需使用，是递归的标志位
 * @return boolean
 * */
async function mkdir(dir, isRecursion) {
  if (!dir) {
    return false
  }
  try {
    await util.promisify(fs.mkdir)(dir, {
      recursive: true
    })
    return true
  } catch (e) {
    let msg = '文件夹创建失败：'
    if (e.code === 'EEXIST') {
      return true
    } else if (e.code === 'ENOENT') { // 它的上级目录不存在，只有 recursive 不为true才会有这种情况
      msg = '上级目录不存在：'
    }
    console.log(msg, e.code, e.message)
  }
  return false
}

// 给文件/文件夹重命名，成功返回true，否则返回false
async function rename(oldPath, newPath) {
  try {
    return !(await util.promisify(fs.rename)(oldPath, newPath))
  } catch (e) {
    return false
  }
}

/**
  * 保存文件
  * ps. 这个方法默认会覆盖文件全部内容
  * @param filePath string 文件路径，要含文件名和扩展名，反正这个方法里不会自动给你加
  * @param fileData string | buffer 可以是字符串，也可以是buffer，是要保存的内容
  * @return boolean 保存成功还是失败
  * */
function saveFile(filePath, fileData) {
  return this.mkdir(
    filePath.split(path.sep).slice(0, -1).join(path.sep)
  ).then(function (succ) {
    if (!succ) { return false }

    return new Promise((resolve, reject) => {
      if (!(fileData instanceof Buffer)) {
        fileData = Buffer.from(fileData)
      }
      // 块方式写入文件
      const wStream = fs.createWriteStream(filePath)

      wStream.on('open', () => {
        const blockSize = 128
        const nbBlocks = Math.ceil(fileData.length / (blockSize))
        for (let i = 0; i < nbBlocks; i++) {
          const currentBlock = fileData.slice(
            blockSize * i,
            Math.min(blockSize * (i + 1), fileData.length)
          )
          wStream.write(currentBlock)
        }
        wStream.end()
      })
      wStream.on('error', (err) => {
        console.log('文件存储失败：', err)
        resolve(false)
      })
      wStream.on('finish', () => { resolve(true) })
    })
  })
}

/**
 * 和上面的差不多，但是可以选择是追加到文件最后
 * ps. 上面那个适合一次性写很多数据
 * @param file
 * @param data
 * @param flag https://nodejs.org/dist/latest-v10.x/docs/api/fs.html#fs_file_system_flags
 * @return 成功会返回undefined，失败返回false
 * */
async function writeFile(file, data, { flag } = {}) {
  try {
    return await util.promisify(fs.writeFile)(file, data, { flag })
  } catch (e) {
    return false
  }
}

/**
 * 保存上传上来的文件
 * @param filePath string 文件存储路径，要含文件名和扩展名，反正这个方法里不会自动给你加
 * @param tempPath string 文件缓存在哪
 * @return boolean 保存成功还是失败
 * */
async function saveUploadFile(filePath, tempPath) {
  try {
    if (!await this.mkdir(
      filePath.split(path.sep).slice(0, -1).join(path.sep)
    )) {
      return false
    }

    return await new Promise((resolve, reject) => {
      // 创建可读流
      const reader = fs.createReadStream(tempPath)
      // 创建可写流
      const wStream = fs.createWriteStream(filePath)
      // 可读流通过管道写入可写流
      reader.pipe(wStream)

      wStream.on('finish', _ => { resolve(true) })
      wStream.on('error', err => {
        reject(err)
      })
    })
  } catch (e) {
    console.error('[saveUploadFile]文件保存失败', e.stack)
    return false
  }
}

// 读取文件
async function readFile(filePath) {
  try {
    return await util.promisify(fs.readFile)(filePath)
  } catch (e) {
    return false
  }
}

// 读取目录
async function readDir(path, options) {
  try {
    return await util.promisify(fs.readdir)(path, options)
  } catch (e) {
    return false
  }
}

// 删除文件
async function unLink(path) {
  try {
    return await util.promisify(fs.unlink)(path)
  } catch (e) {
    return false
  }
}

// 删除目录
async function removeDir(path) {
  try {
    return await util.promisify(fs.rmdir)(path)
  } catch (e) {
    return false
  }
}

/**
 * 压缩文件
 * @param {array} files 要打包的文件路径
 * @param {string} zipFile 生成的zip文件完整路径
 * */
async function zip(files, zipFile) {
  const archiver = require('archiver')

  return new Promise(resolve => {
    const output = fs.createWriteStream(zipFile)
    const archive = archiver('zip', {
      zlib: { level: 9 }
    })

    output.on('close', function () {
      resolve([200, ''])
    })

    archive.on('warning', function (err) {
      console.log('【压缩文件】警告', err.stack)
    })

    archive.on('error', function (err) {
      console.log('【压缩文件】错误', err.stack)
      resolve([0, err.msg, err])
    })

    archive.pipe(output)

    files.forEach(f => {
      const info = f.split(path.sep)
      archive.file(f, { name: info[info.length - 1] })
    })

    archive.finalize()
  })
}

// 删除目录及里面的文件， rmdir只能删除空文件夹
async function deleteFolder(dir) {
  const files = await this.readDir(dir)
  if (files) {
    for (const f of files) {
      const curPath = path.join(dir, f)
      if (fs.statSync(curPath).isDirectory()) { // recurse
        await this.deleteFolder(curPath)
      } else { // delete file
        await this.unLink(curPath)
      }
    }
  }
  await this.removeDir(dir)
  return true
}