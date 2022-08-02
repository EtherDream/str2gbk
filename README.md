# str2gbk

JS 字符串转 GBK 编码超轻量实现。代码压缩后不到 1KB，并且性能非常高。

# Install

```bash
npm i str2gbk
```

# Usage

```js
import str2gbk from 'str2gbk'

str2gbk('你好123')  // Uint8Array(7) [ 196, 227,   186, 195,   49, 50, 51 ]

str2gbk('€100')    // Uint8Array(4) [ 128,   49, 48, 48 ]
```

Demo: https://jsbin.com/vuxawul/edit?html,output


# API

str2gbk(str, opt?)

## str

必选。输入 JS 字符串。

## opt.onError

可选。如果 JS 字符串中出现 GBK 不支持的字符，则触发该回调。

如果未提供回调，默认使用 `63`（即 `?` 字符）代替不支持的字符。例如：

```js
str2gbk('123©456')  // [49, 50, 51,   63,   52, 53, 54]
```

如果提供回调，则使用回调的返回值代替：

```js
str2gbk('123©456', {
  onError: () => 32
})
// [49, 50, 51,  32,  52, 53, 54]
```

如果回调返回 -1，程序则终止解析，并返回已解析的数据：

```js
str2gbk('123©456', {
  onError: () => -1
})
// [49, 50, 51]
```

回调类型：

```js
(index: number, input: string) => number
```

* index: 非法字符的位置

* input: 输入 JS 字符串

使用案例：

```js
str2gbk('123©456', {
  onError: (index, input) => {
    console.warn('error index:', index, 'char:', input[index])
    return -1
  }
})
// [WARN] error index: 3 char: ©
```

## opt.onAlloc

可选。自定义返回结果的内存申请。

默认情况下，浏览器中使用 `Uint8Array`，Node.js 中使用 `Buffer`。通过该参数可强制类型，例如：

```js
str2gbk('赢', {
  onAlloc: (len) => new Uint8Array(len)
})  // Uint8Array(2) [ 211, 174 ]

str2gbk('赢', {
  onAlloc: (len) => Buffer.alloc(len)
})  // <Buffer d3 ae>
```

此外，灵活使用该选项，有些场合下可将结果直接写入目标缓冲区，避免内存复制。例如：

```js
const targetBuf = ....
const gbkBuf = str2gbk(str, {
  onAlloc: () => targetBuf.subarray(pos)
})
pos += gbkBuf.length
```

通过 `subarray` 引用 targetBuf 的一部分作为存储，这样 str2gbk 执行完成后，结果已在 targetBuf 上，无需额外复制。


# Decode

GBK 数据转字符串 JS 原生就已支持，因此本项目不再提供。

```js
const gbkDecoder = new TextDecoder('gbk')

function gbk2str(gbkBuf) {
  return gbkDecoder.decode(gbkBuf)
}
gbk2str(new Uint8Array([196, 227,   186, 195,   49, 50, 51]))   // "你好123"
gbk2str(new Uint8Array([128,   49, 48, 48]))                    // "€100"
```

# License

MIT