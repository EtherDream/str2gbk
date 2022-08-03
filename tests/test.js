import str2gbk from '../index.js'


function cmpBuf(got, exp) {
  if (got.length !== exp.length) {
    throw 'length not equal'
  }
  for (let i = 0; i < got.length; i++) {
    if (got[i] !== exp[i]) {
      throw `element not equal. got[${i}]: ${got[i]} exp[${i}]: ${exp[i]}`
    }
  }
}

function check(str) {
  const gbkBuf = str2gbk(str)
  const str2 = new TextDecoder('gbk').decode(gbkBuf)
  if (str !== str2) {
    throw `incorrect: "${str}"(${str.length}) "${str2}"(${str2.length})`
  }
}

check('你好123')
check('€')
check('')

cmpBuf(
  str2gbk('123©456©'),
  [49, 50, 51,   63,   52, 53, 54,  63]
)

cmpBuf(
  str2gbk('123©456©', {
    onError: () => 32
  }),
  [49, 50, 51,   32,   52, 53, 54,  32]
)

cmpBuf(
  str2gbk('123©456', {
    onError: () => -1
  }),
  [49, 50, 51]
)

let invalidChar

str2gbk('123©456©', {
  onError: (index, input) => {
    invalidChar = input[index]
  }
})
console.assert(invalidChar === '©')


const shouldBuffer = str2gbk('赢', {
  onAlloc: (len) => Buffer.allocUnsafe(len)
})
console.assert(shouldBuffer instanceof Buffer)


const shouldUint8Array = str2gbk('赢', {
  onAlloc: (len) => new Uint8Array(len)
})
console.assert(shouldUint8Array instanceof Uint8Array)


const targetBuf = new Uint8Array(1000)
const gbkBuf = str2gbk('一二三四五六七八九十', {
  onAlloc: () => targetBuf.subarray(500)
})
cmpBuf(gbkBuf, targetBuf.subarray(500, 520))