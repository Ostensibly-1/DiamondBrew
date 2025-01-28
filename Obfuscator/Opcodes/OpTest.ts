import { Opcode } from "../../Bytecode Lib/Bytecode/Opcode";
import { InstructionConstantMask, InstructionType } from "../../Bytecode Lib/IR/Enums";
import type Instruction from "../../Bytecode Lib/IR/Instruction";
import type { ObfuscationContext } from "../ObfuscationContext";
import VOpcode from "../VOpcode";

export class OpTest extends VOpcode {
    public override IsInstruction(instruction: Instruction): boolean {
        return instruction.OpCode == Opcode.Test && instruction.C == 0;
    }

    public override GetObfuscated(context: ObfuscationContext): string {
        return "if Stk[Inst[OP_A]] then InstrPoint=InstrPoint + 1; else InstrPoint = Inst[OP_B]; end;";
    }

    public override Mutate(instruction: Instruction): void {
        instruction.B = instruction.PC + Array.from(instruction.Chunk.Instructions)[instruction.PC + 1].B + 2;
        instruction.InstructionType = InstructionType.AsBxC;
    }
}

export class OpTestC extends VOpcode {
    public override IsInstruction(instruction: Instruction): boolean {
        return instruction.OpCode == Opcode.Test && instruction.C != 0;
    }

    public override GetObfuscated(context: ObfuscationContext): string {
        return "if not Stk[Inst[OP_A]] then InstrPoint=InstrPoint+1;else InstrPoint=Inst[OP_B];end;";
    }

    public override Mutate(instruction: Instruction): void {
        instruction.B = instruction.PC + Array.from(instruction.Chunk.Instructions)[instruction.PC + 1].B + 2;
        instruction.InstructionType = InstructionType.AsBxC;
    }
}