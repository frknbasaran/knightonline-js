import * as configLib from 'config';
import * as longLib from 'long';

export function readShort(data: number[] | Buffer, i: number): number {
  let sign = data[i + 1] & (1 << 7);
  let x = (((data[i + 1] & 0xFF) << 8) | (data[i] & 0xFF));
  if (sign) {
    return 0xFFFF0000 | x;
  }

  return x;
}

export function readInt(data: number[] | Buffer, i: number): number {
  return (data[i] + (data[i + 1] << 8) + (data[i + 2] << 16) + (data[i + 3] << 24 >>> 0)) >> 0;
}

export function readUInt(data: number[] | Buffer, i: number): number {
  return (data[i] + (data[i + 1] << 8) + (data[i + 2] << 16) + (data[i + 3] << 24 >>> 0)) >>> 0;
}

export function short(i: number): [number, number] {
  return [(i >>> 0) & 0xFF, (i >>> 8) & 0xFF];
}

export function int(i: number): [number, number, number, number] {
  return [(i >>> 0) & 0xFF, (i >>> 8) & 0xFF, (i >>> 16) & 0xFF, (i >>> 24) & 0xFF];
}

export function long(i: number): [number, number, number, number, number, number, number, number] {
  if (i > Number.MAX_SAFE_INTEGER) return [255, 255, 255, 255, 255, 255, 31, 0];
  let l = i % 0x100000000 | 0;
  let h = i / 0x100000000 | 0;
  return [
    (l >>> 0) & 0xFF, (l >>> 8) & 0xFF, (l >>> 16) & 0xFF, (l >>> 24) & 0xFF,
    (h >>> 0) & 0xFF, (h >>> 8) & 0xFF, (h >>> 16) & 0xFF, (h >>> 24) & 0xFF
  ];
}


export function readStringArray(data: number[] | Buffer, i: number, len: number): string[] {
  let str = [];

  for (; ; i++) {
    if (data[i] == undefined || str.length == len) break;

    str.push(String.fromCharCode(data[i]));
  }

  return str;
}

export function readString(data: number[], i: number, maxlen: number): string {
  return readStringArray(data, i, maxlen).join('');
}

export function stringFromArray(i) {
  return [...short(i.length), ...i];
}

export function string(str: string, encoding: 'utf8' | 'ascii' = 'utf8'): number[] {
  let array = Array.from(Buffer.from(str, encoding));

  if (array.length > 65536) {
    array = array.slice(0, 65535);
  }

  return [...short(array.length), ...array];
}

export function byte_string(str: string, encoding: 'utf8' | 'ascii' = 'utf8') {
  let array = Array.from(Buffer.from(str, encoding));

  if (array.length > 255) {
    array = array.slice(0, 255);
  }
  return [array.length, ...array];
}


export function stringWithoutLength(str: string, encoding: 'utf8' | 'ascii' = 'utf8') {
  return Array.from(Buffer.from(str, encoding));
}

export function configString(name) {
  return string(configLib.get(name));
}

export class Queue {
  private _: Buffer;
  private o: number;
  private constructor(buf: Buffer) {
    this._ = buf;
    this.o = 0;
  }

  public static from(buffer: Buffer) {
    return new Queue(buffer);
  }

  byte(): number {
    return this._[this.o++] | 0;
  }

  short(): number {
    let data = readShort(this._, this.o);
    this.o += 2;
    return data;
  }

  int(): number {
    let data = readInt(this._, this.o);
    this.o += 4;
    return data;
  }

  uint(): number {
    let data = readUInt(this._, this.o);
    this.o += 4;
    return data;
  }

  skip(length: number): void {
    this.o += length;
  }

  sub(length: number): Buffer {
    this.o += length;

    return this._.slice(this.o - length, this.o);
  }

  string() {
    let len = this.short();
    let data = readStringArray(this._, this.o, len);

    this.o += data.length;
    return data.join('');
  }


  byte_string() {
    let len = this.byte();
    let data = readStringArray(this._, this.o, len);

    this.o += data.length;
    return data.join('');
  }

  long() {
    return (<any>longLib.fromBytesLE(<any>this.sub(8))).toNumber();
  }

  array(): number[] {
    return Array.from(this._.slice(this.o));
  }
}