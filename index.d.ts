export interface str2gbkOpt<T extends Uint8Array = Uint8Array> {
  onAlloc?: (len: number) => T,
  onError?: (index: number, input: string) => number,
}

export default function str2gbk<T extends Uint8Array>(str: string, opt?: str2gbkOpt<T>) : T