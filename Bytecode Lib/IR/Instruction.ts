import type CustomInstructionData from "../../Obfuscator/CustomInstructionData";
import Deserializer from "../Bytecode/Deserializer";
import { Opcode } from "../Bytecode/Opcode";
import type Chunk from "./Chunk";
import Constant from "./Constant";
import { InstructionType, type InstructionConstantMask } from "./Enums";

export default class Instruction {
    public RefOperands: any[] = [null, null, null];
    public BackReferences: Set<Instruction> = new Set<Instruction>();

    public Chunk: Chunk;
    public OpCode: Opcode;
    public InstructionType: InstructionType | undefined;
    public ConstantMask!: InstructionConstantMask;

    public A: number;
    public B: number;
    public C: number;

    public Data: number;
    public PC!: number;
    public Line!: number;

    public CustomData!: CustomInstructionData;

    public Instruction(other: Instruction) {
        this.RefOperands = other.RefOperands;
        this.BackReferences = other.BackReferences;
        this.Chunk = other.Chunk;
        this.OpCode = other.OpCode;
        this.InstructionType = other.InstructionType;
        this.A = other.A;
        this.B = other.B;
        this.C = other.C;
        this.Data = other.Data;
        this.PC = other.PC;
        this.Line = other.Line;

        return this;
    }

    constructor(chunk: Chunk, code: Opcode, ...refOperands: any[]) {
        this.A = 0
        this.B = 0
        this.C = 0
        this.Data = 0

        this.Chunk = chunk;
        this.OpCode = code;

        if (Deserializer.InstructionMappings.get(code)) {
            this.InstructionType = Deserializer.InstructionMappings.get(code)
        } else {
            this.InstructionType = InstructionType.ABC;
        }

        for (let i: number = 0; i < refOperands.length; i++) {
            var op = refOperands[i]
            this.RefOperands[i] = op;

            if (op instanceof Instruction) {
                op.BackReferences.add(this)
            }
        }
    }

    UpdateRegisters() {
        if (this.InstructionType == InstructionType.Data) return;

        this.PC = this.Chunk.InstructionMap.get(this) as number;

        switch (this.OpCode) {
            case Opcode.LoadConst:
            case Opcode.GetGlobal:
            case Opcode.SetGlobal:
                this.B = this.Chunk.ConstantMap.get(this.RefOperands[0] as Constant) as number
                break;
            case Opcode.Jmp:
            case Opcode.ForLoop:
            case Opcode.ForPrep:
                this.B = this.Chunk.InstructionMap.get(this.RefOperands[0] as Instruction) as number - this.PC - 1
                break;
            case Opcode.Closure:
                this.B = this.Chunk.FunctionMap.get(this.RefOperands[0] as Chunk) as number
                break;
            case Opcode.GetTable:
            case Opcode.SetTable:
            case Opcode.Add:
            case Opcode.Sub:
            case Opcode.Mul:
            case Opcode.Div:
            case Opcode.Mod:
            case Opcode.Pow:
            case Opcode.Eq:
            case Opcode.Lt:
            case Opcode.Le:
                if (this.RefOperands[0] instanceof Constant) {
                    this.B = this.Chunk.ConstantMap.get(this.RefOperands[0] as Constant) as number + 256
                }

                if (this.RefOperands[1] instanceof Constant) {
                    this.C = this.Chunk.ConstantMap.get(this.RefOperands[1] as Constant) as number + 256
                }

                break;
            case Opcode.Self:
                if (this.RefOperands[1] instanceof Constant) {
                    this.C = this.Chunk.ConstantMap.get(this.RefOperands[1] as Constant) as number + 256
                }

                break;
        }
    }

    SetupRefs() {
        this.RefOperands = [null, null, null];
        switch (this.OpCode) {
            case Opcode.LoadConst:
            case Opcode.GetGlobal:
            case Opcode.SetGlobal:
                this.RefOperands[0] = Array.from(this.Chunk.Constants)[(this.B as number)];
                (this.RefOperands[0] as Constant).BackReferences.add(this);
                break;
            case Opcode.Jmp:
            case Opcode.ForLoop:
            case Opcode.ForPrep:
                this.RefOperands[0] = Array.from(this.Chunk.Instructions)[this.Chunk.InstructionMap.get(this) as number + this.B + 1];
                (this.RefOperands[0] as Instruction).BackReferences.add(this);
                break;
            case Opcode.Closure:
                this.RefOperands[0] = Array.from(this.Chunk.Functions)[this.B as number]
                break;
            case Opcode.GetTable:
            case Opcode.SetTable:
            case Opcode.Add:
            case Opcode.Sub:
            case Opcode.Mul:
            case Opcode.Div:
            case Opcode.Mod:
            case Opcode.Pow:
            case Opcode.Eq:
            case Opcode.Lt:
            case Opcode.Le:
                if (this.B > 255) this.RefOperands[0] = Array.from(this.Chunk.Constants)[this.B - 256]
                if (this.C > 255) this.RefOperands[1] = Array.from(this.Chunk.Constants)[this.C - 256]
                break;
            case Opcode.Self:
                if (this.C > 255) this.RefOperands[1] = Array.from(this.Chunk.Constants)[this.C - 256]
                console.log(this.RefOperands)
                break;
        }
    }
}