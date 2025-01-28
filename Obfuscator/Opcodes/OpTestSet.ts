import { Opcode } from "../../Bytecode Lib/Bytecode/Opcode";
import { InstructionConstantMask, InstructionType } from "../../Bytecode Lib/IR/Enums";
import type Instruction from "../../Bytecode Lib/IR/Instruction";
import type { ObfuscationContext } from "../ObfuscationContext";
import VOpcode from "../VOpcode";

export class OpTestSet extends VOpcode {
    public override IsInstruction(instruction: Instruction): boolean {
        return instruction.OpCode == Opcode.TestSet && instruction.C == 0;
    }

    public override GetObfuscated(context: ObfuscationContext): string {
        return "local B=Stk[Inst[OP_C]];if B then InstrPoint=InstrPoint+1;else Stk[Inst[OP_A]]=B;InstrPoint=Inst[OP_B];end;";
    }

    public override Mutate(instruction: Instruction): void {
        instruction.C = instruction.B;
        instruction.B = instruction.PC + Array.from(instruction.Chunk.Instructions)[instruction.PC + 1].B + 2;
        instruction.InstructionType = InstructionType.AsBxC;
    }
}

export class OpTestSetC extends VOpcode {
    public override IsInstruction(instruction: Instruction): boolean {
        return instruction.OpCode == Opcode.TestSet && instruction.C != 0;
    }

    public override GetObfuscated(context: ObfuscationContext): string {
        return "local B=Stk[Inst[OP_C]];if not B then InstrPoint=InstrPoint+1;else Stk[Inst[OP_A]]=B;InstrPoint=Inst[OP_B];end;";
    }

    public override Mutate(instruction: Instruction): void {
        instruction.C = instruction.B;
        instruction.B = instruction.PC + Array.from(instruction.Chunk.Instructions)[instruction.PC + 1].B + 2;
        instruction.InstructionType = InstructionType.AsBxC;
    }
}