import { Opcode } from "../../Bytecode Lib/Bytecode/Opcode";
import type Chunk from "../../Bytecode Lib/IR/Chunk";
import Instruction from "../../Bytecode Lib/IR/Instruction";

export default class CFGenerator {
    public NextJMP(lc: Chunk, Reference: Instruction): Instruction {
        return new Instruction(lc, Opcode.Jmp, Reference)
    }

    public BelievableRandom(lc: Chunk): Instruction {
        let ins: Instruction = new Instruction(lc, (Math.floor(Math.random() * 37) as Opcode))

        ins.A = Math.floor(Math.random() * 128)
        ins.B = Math.floor(Math.random() * 128)
        ins.C = Math.floor(Math.random() * 128)

        while (true) {
            switch (ins.OpCode) {
                case Opcode.LoadConst:
                case Opcode.GetGlobal:
                case Opcode.SetGlobal:
                case Opcode.Jmp:
                case Opcode.ForLoop:
                case Opcode.TForLoop:
                case Opcode.ForPrep:
                case Opcode.Closure:
                case Opcode.GetTable:
                case Opcode.SetTable:
                case Opcode.Add:
                case Opcode.Sub:
                case Opcode.Mul:
                case Opcode.Div:
                case Opcode.Mod:
                case Opcode.Pow:
                case Opcode.Test:
                case Opcode.TestSet:
                case Opcode.Eq:
                case Opcode.Lt:
                case Opcode.Le:
                case Opcode.Self:
                    ins.OpCode = (Math.floor(Math.random() * 37) as Opcode)
                    continue;
                default:
                    return ins;
            }
        }
    }

    
}