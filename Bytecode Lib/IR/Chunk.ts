import { Opcode } from "../Bytecode/Opcode";
import type Constant from "./Constant";
import type Instruction from "./Instruction";

export default class Chunk {
    public Name!: string;
    public Line!: number;
    public LastLine!: number;
    public UpvalueCount!: number;
    public ParameterCount!: number;
    public VarargFlag!: number;
    public StackSize!: number;
    public CurrentOffset: number = 0;
    public CurrentParamOffset: number = 0;
    public Instructions!: Set<Instruction>;
    public InstructionMap: Map<Instruction, number> = new Map<Instruction, number>();
    public Constants!: Set<Constant>;
    public ConstantMap: Map<Constant, number> = new Map<Constant, number>();
    public Functions!: Set<Chunk>;
    public FunctionMap: Map<Chunk, number> = new Map<Chunk, number>();

    public UpdateMappings() {
        this.InstructionMap.clear()
        this.ConstantMap.clear()
        this.FunctionMap.clear()

        for (let i: number = 0; i < this.Instructions.size; i++) {
            this.InstructionMap.set(Array.from(this.Instructions)[i], i)
        }

        for (let i: number = 0; i < this.Constants.size; i++) {
            this.ConstantMap.set(Array.from(this.Constants)[i], i)
        }

        for (let i: number = 0; i < this.Functions.size; i++) {
            this.FunctionMap.set(Array.from(this.Functions)[i], i)
        }
    }

    public Rebase(offset: number, paramOffset: number = 0): number {
        offset -= this.CurrentOffset
        paramOffset -= this.CurrentParamOffset

        this.CurrentOffset += offset;
        this.CurrentParamOffset += paramOffset;

        this.StackSize += offset;

        var Params = this.ParameterCount - 1;
        for (var i = 0; i < this.Instructions.size; i++) {
            var instr = Array.from(this.Instructions)[i]

            switch (instr.OpCode) {
                case Opcode.Move:
                case Opcode.LoadNil:
                case Opcode.Unm:
                case Opcode.Not:
                case Opcode.Len:
                case Opcode.TestSet:
                    if (instr.A > Params) {
                        instr.A += offset
                    } else {
                        instr.A += paramOffset
                    }

                    if (instr.B > Params) {
                        instr.B += offset
                    } else {
                        instr.B += paramOffset
                    }

                    break;
                case Opcode.LoadConst:
                case Opcode.LoadBool:
                case Opcode.GetGlobal:
                case Opcode.SetGlobal:
                case Opcode.GetUpval:
                case Opcode.SetUpval:
                case Opcode.Call:
                case Opcode.TailCall:
                case Opcode.Return:
                case Opcode.VarArg:
                case Opcode.Test:
                case Opcode.ForPrep:
                case Opcode.ForLoop:
                case Opcode.TForLoop:
                case Opcode.NewTable:
                case Opcode.SetList:
                case Opcode.Close:
                    if (instr.A > Params) {
                        instr.A += offset
                    } else {
                        instr.A += paramOffset
                    }

                    break;
                case Opcode.GetTable:
                case Opcode.SetTable:
                    if (instr.A > Params) {
                        instr.A += offset
                    } else {
                        instr.A += paramOffset
                    }

                    if (instr.B < 255) {
                        if (instr.B > Params) {
                            instr.B += offset
                        } else {
                            instr.B += paramOffset
                        }
                    }

                    if (instr.C > Params) {
                        instr.C += offset
                    } else {
                        instr.C += paramOffset
                    }

                    break;
                case Opcode.Add:
                case Opcode.Sub:
                case Opcode.Mul:
                case Opcode.Div:
                case Opcode.Mod:
                case Opcode.Pow:
                    if (instr.A > Params) {
                        instr.A += offset
                    } else {
                        instr.A += paramOffset
                    }

                    if (instr.B < 255) {
                        if (instr.B > Params) {
                            instr.B += offset
                        } else {
                            instr.B += paramOffset
                        }
                    }

                    if (instr.C < 255) {
                        if (instr.C > Params) {
                            instr.C += offset
                        } else {
                            instr.C += paramOffset
                        }
                    }

                    break;
                case Opcode.Concat:
                    if (instr.A > Params) {
                        instr.A += offset
                    } else {
                        instr.A += paramOffset
                    }

                    if (instr.B > Params) {
                        instr.B += offset
                    } else {
                        instr.B += paramOffset
                    }

                    if (instr.C > Params) {
                        instr.C += offset
                    } else {
                        instr.C += paramOffset
                    }

                    break;
                case Opcode.Self:
                    if (instr.A > Params) {
                        instr.A += offset
                    } else {
                        instr.A += paramOffset
                    }

                    if (instr.B > Params) {
                        instr.B += offset
                    } else {
                        instr.B += paramOffset
                    }

                    if (instr.C < 255) {
                        if (instr.C > Params) {
                            instr.C += offset
                        } else {
                            instr.C += paramOffset
                        }
                    }
                    break;
                case Opcode.Eq:
                case Opcode.Lt:
                case Opcode.Le:
                    if (instr.B < 255) {
                        if (instr.B > Params) {
                            instr.B += offset
                        } else {
                            instr.B += paramOffset
                        }
                    }

                    if (instr.C < 255) {
                        if (instr.C > Params) {
                            instr.C += offset
                        } else {
                            instr.C += paramOffset
                        }
                    }

                    break;
                case Opcode.Closure:
                    if (instr.A > Params) {
                        instr.A += offset
                    } else {
                        instr.A += paramOffset
                    }

                    var nProto = Array.from(this.Functions)[instr.B]

                    for (var i2 = 0; i2 < nProto.UpvalueCount; i2++) {
                        var cInst = Array.from(this.Instructions)[i + i2 + 1]

                        if (cInst.OpCode != Opcode.Move) continue;

                        if (cInst.B > Params) {
                            cInst.B += offset;
                        } else {
                            cInst.B += paramOffset;
                        }
                    }

                    i += nProto.UpvalueCount
                    break;
            }
        }

        return this.ParameterCount
    }
}