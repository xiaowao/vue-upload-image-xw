/**
 * base64字符串转文件
 * @params {string} dataurl base64
 * @params {string} filename 图片名
 * @return
 */
export function base64ToFile(dataurl, filename) {
  const arr = dataurl.split(',')
  const mime = arr[0].match(/:(.*?);/)[1]
  const bstr = atob(arr[1])
  const len = bstr.length
  const u8arr = new Uint8Array(len)
  let i = 0
  while (i < len) {
    u8arr[i] = bstr.charCodeAt(i)
    i++
  }
  return new File([u8arr], filename, { type: mime })
}

/**
 * 上传附件转base64
 * @param {File} file 文件流
 */
export const fileToBase64 = (file, callback) => {
  var reader = new FileReader()
  // 传入一个参数对象即可得到基于该参数对象的文本内容
  reader.readAsDataURL(file)
  reader.onload = function(e) {
    // target.result 该属性表示目标对象的DataURL
    callback(e.target.result)
  }
}

// 获取元素相对视口坐标
export function getElementPosition(e) {
  let x = 0
  let y = 0
  while (e != null) {
    x += e.offsetLeft
    y += e.offsetTop
    e = e.offsetParent
  }
  return { x, y }
}