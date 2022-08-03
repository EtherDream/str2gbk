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
  str2gbk('123©456©', {
    onError: () => 0xC1A1
  }),
  [49, 50, 51,   0xA1, 0xC1,   52, 53, 54,  0xA1, 0xC1]
)

cmpBuf(
  str2gbk('123©456', {
    onError: () => -1
  }),
  [49, 50, 51]
)

const invalidChars = []
const invalidStr = '123©456©'

str2gbk(invalidStr, {
  onError: (index, input) => {
    invalidChars.push({index, input})
  }
})
console.assert(invalidChars.length === 2)
console.assert(invalidChars[0].index === 3)
console.assert(invalidChars[0].input === invalidStr)
console.assert(invalidChars[1].index === 7)
console.assert(invalidChars[1].input === invalidStr)


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