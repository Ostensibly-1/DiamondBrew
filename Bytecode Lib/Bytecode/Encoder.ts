import type Chunk from "../IR/Chunk";

export default class Encoder {
    public Bytes: Array<Array<any> | Uint8Array>
    public Chk: Chunk;

    constructor(chunk: Chunk) {
        this.Bytes = []
        this.Chk = chunk;
    }

    public Write(values: number[] | Uint8Array) {
        this.Bytes.push(values)
    }

    public WriteByte(value: number) {
        this.Write([value & 0xFF])
    }

    public WriteInt16(value: number) {
        this.Write([
            (value & 0xFf),
            ((value >> 8) & 0xFF)
        ])
    }

    public WriteInt32(value: number) {
        this.Write([
            (value & 0xFf),
            ((value >> 8) & 0xFF),
            ((value >> 16) & 0xFF),
            ((value >> 24) & 0xFF),
        ])
    }

    public WriteString(str: string) {
        this.WriteInt32(str.length)
        this.Write(new TextEncoder().encode(str))
    }

    public WriteDouble(num: number) {
        const Buffer = new ArrayBuffer(8)
        const view = new DataView(Buffer)
        view.setFloat64(0, num, true)
        this.Write(new Uint8Array(Buffer))
    }

    public WriteBool(bool: boolean) {
        this.WriteByte(bool == true && 1 || 0)
    }
}