import Chunk from "../IR/Chunk";
import Constant from "../IR/Constant";
import { ConstantType, InstructionType } from "../IR/Enums";
import Instruction from "../IR/Instruction";
import { Opcode } from "./Opcode";

export default class Deserializer {
    public BigEndian: boolean = false;
    public SizeNumber: number = 4;
    public SizeSizeT: number = 4;
    public ExpectingSetlistData!: boolean;

    public static InstructionMappings: Map<Opcode, InstructionType> = new Map<Opcode, InstructionType>([
        [Opcode.Move, InstructionType.ABC],
        [Opcode.LoadConst, InstructionType.ABx],
        [Opcode.LoadBool, InstructionType.ABC],
        [Opcode.LoadNil, InstructionType.ABC],
        [Opcode.GetUpval, InstructionType.ABC],
        [Opcode.GetGlobal, InstructionType.ABx],
        [Opcode.GetTable, InstructionType.ABC],
        [Opcode.SetGlobal, InstructionType.ABx],
        [Opcode.SetUpval, InstructionType.ABC],
        [Opcode.SetTable, InstructionType.ABC],
        [Opcode.NewTable, InstructionType.ABC],
        [Opcode.Self, InstructionType.ABC],
        [Opcode.Add, InstructionType.ABC],
        [Opcode.Sub, InstructionType.ABC],
        [Opcode.Mul, InstructionType.ABC],
        [Opcode.Div, InstructionType.ABC],
        [Opcode.Mod, InstructionType.ABC],
        [Opcode.Pow, InstructionType.ABC],
        [Opcode.Unm, InstructionType.ABC],
        [Opcode.Not, InstructionType.ABC],
        [Opcode.Len, InstructionType.ABC],
        [Opcode.Concat, InstructionType.ABC],
        [Opcode.Jmp, InstructionType.AsBx],
        [Opcode.Eq, InstructionType.ABC],
        [Opcode.Lt, InstructionType.ABC],
        [Opcode.Le, InstructionType.ABC],
        [Opcode.Test, InstructionType.ABC],
        [Opcode.TestSet, InstructionType.ABC],
        [Opcode.Call, InstructionType.ABC],
        [Opcode.TailCall, InstructionType.ABC],
        [Opcode.Return, InstructionType.ABC],
        [Opcode.ForLoop, InstructionType.AsBx],
        [Opcode.ForPrep, InstructionType.AsBx],
        [Opcode.TForLoop, InstructionType.ABC],
        [Opcode.SetList, InstructionType.ABC],
        [Opcode.Close, InstructionType.ABC],
        [Opcode.Closure, InstructionType.ABx],
        [Opcode.VarArg, InstructionType.ABC]
    ])

    private Bytes: Uint8Array;
    private Pos: number;

    constructor(input: Uint8Array) {
        this.Bytes = input;
        this.Pos = 0
    }

    public Read(size: number, factorEndianness: boolean = true): Uint8Array {
        let bytes: Uint8Array = this.Bytes.slice(this.Pos, this.Pos + size)
        this.Pos += size;

        if (factorEndianness && (this.BigEndian == true)) {
            bytes = bytes.reverse()
        }

        return bytes;
    }

    public ReadSizeT(): number | bigint {
        return this.SizeSizeT == 4 ? this.ReadInt32() : this.ReadInt64()
    }

    public ReadInt64(): bigint {
        return new DataView(Uint8Array.from(this.Read(8)).buffer).getBigInt64(0, this.BigEndian === false)
    }

    public ReadInt32(): number {
        return new DataView(Uint8Array.from(this.Read(4)).buffer).getInt32(0, this.BigEndian === false)
    }

    public ReadByte(): number {
        return this.Read(1)[0]
    }

    public ReadString(): string {
        let c: bigint | number = this.ReadSizeT()
        let count: number = Number(c)

        if (count == 0) return "";

        let Val = this.Read(count)
        return Array.from(Val).map(v => String.fromCharCode(v)).join("")
    }

    public ReadDouble(): number {
        return new DataView(Uint8Array.from(this.Read(this.SizeNumber)).buffer).getFloat64(0, this.BigEndian === false)
    }

    public DecodeInstruction(chunk: Chunk, index: number): Instruction {
        let code: number = this.ReadInt32();
        let i: Instruction = new Instruction(chunk, (code & 0x3F) as Opcode)

        i.Data = code;

        if (this.ExpectingSetlistData) {
            this.ExpectingSetlistData = false;
            i.InstructionType = InstructionType.Data
            return i;
        }

        i.A = (code >> 6) & 0xFF;

        switch (i.InstructionType) {
            case InstructionType.ABC:
                i.B = (code >> 6 + 8 + 9) & 0x1FF;
                i.C = (code >> 6 + 8) & 0x1FF;
                break;
            case InstructionType.ABx:
                i.B = (code >> 6 + 8) & 0x3FFFF;
                i.C = -1;
                break;
            case InstructionType.AsBx:
                i.B = ((code >> 6 + 8) & 0x3FFFF) - 131071;
                i.C = -1;
                break;
        }

        if (i.OpCode == Opcode.SetList && i.C == 0) {
            this.ExpectingSetlistData = true;
        }

        return i;
    }

    public DecodeInstructions(chunk: Chunk): Set<Instruction> {
        let instructions: Set<Instruction> = new Set<Instruction>()
        let Count: number = this.ReadInt32()

        for (let i = 0; i < Count; i++) {
            instructions.add(this.DecodeInstruction(chunk, i))
        }

        return instructions
    }

    public DecodeConstant(): Constant {
        let c: Constant = new Constant()
        let type: number = this.ReadByte()

        switch (type) {
            case 0:
                c.Type = ConstantType.Nil
                c.Data = undefined;
                break;
            case 1:
                c.Type = ConstantType.Boolean
                c.Data = this.ReadByte() != 0
                break;
            case 3:
                c.Type = ConstantType.Number
                c.Data = this.ReadDouble()
                break;
            case 4:
                c.Type = ConstantType.String
                c.Data = this.ReadString()
                break;
        }

        return c;
    }

    public DecodeConstants(): Set<Constant> {
        let constants: Set<Constant> = new Set<Constant>()
        let count: number = this.ReadInt32()

        for (let i = 0; i < count; i++) {
            constants.add(this.DecodeConstant())
        }

        return constants;
    }

    public DecodeChunk(): Chunk {
        let c: Chunk = new Chunk()
        c.Name = this.ReadString()
        c.Line = this.ReadInt32()
        c.LastLine = this.ReadInt32()
        c.UpvalueCount = this.ReadByte()
        c.ParameterCount = this.ReadByte()
        c.VarargFlag = this.ReadByte()
        c.StackSize = this.ReadByte()

        c.Instructions = this.DecodeInstructions(c)
        c.Constants = this.DecodeConstants()
        c.Functions = this.DecodeChunks()

        c.UpdateMappings()

        for (var inst of c.Instructions) {
            inst.SetupRefs()
        }

        let count: number = this.ReadInt32()
        for (let i: number = 0; i < count; i++) {
            Array.from(c.Instructions)[i].Line = this.ReadInt32()
        }

        // skip this shit
        count = this.ReadInt32()
        for (let i: number = 0; i < count; i++) {
            this.ReadString()
            this.ReadInt32()
            this.ReadInt32()
        }

        count = this.ReadInt32()
        for (let i: number = 0; i < count; i++) {
            this.ReadString()
        }

        return c
    }

    public DecodeChunks(): Set<Chunk> {
        let chunks: Set<Chunk> = new Set<Chunk>()
        let count: number = this.ReadInt32()

        for (let i = 0; i < count; i++) {
            chunks.add(this.DecodeChunk())
        }

        return chunks;
    }

    public DecodeFile(): Chunk {
        let Signature = this.ReadInt32()
        if (Signature != 0x1B4C7561 && Signature != 0x61754C1B) throw new Error("[ERR]: Invalid Bytecode")
        if (this.ReadByte() != 0x51) throw new Error("[ERR]: Not Lua 5.1")
        
        this.ReadByte()

        this.BigEndian = this.ReadByte() == 0

        this.ReadByte()

        this.SizeSizeT = this.ReadByte()

        this.ReadByte()

        this.SizeNumber = this.ReadByte()

        this.ReadByte()

        let c: Chunk = this.DecodeChunk()
        return c;
    }
}