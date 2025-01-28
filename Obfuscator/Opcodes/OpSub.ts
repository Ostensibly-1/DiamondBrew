import { Opcode } from "../../Bytecode Lib/Bytecode/Opcode";
import { InstructionConstantMask } from "../../Bytecode Lib/IR/Enums";
import type Instruction from "../../Bytecode Lib/IR/Instruction";
import type { ObfuscationContext } from "../ObfuscationContext";
import VOpcode from "../VOpcode";

export class OpSub extends VOpcode {
    public override IsInstruction(instruction: Instruction): boolean {
        return instruction.OpCode == Opcode.Sub && instruction.B <= 255 && instruction.C <= 255;
    }

    public override GetObfuscated(context: ObfuscationContext): string {
        return "Stk[Inst[OP_A]]=Stk[Inst[OP_B]]-Stk[Inst[OP_C]];"
    }
}

export class OpSubB extends VOpcode {
    public override IsInstruction(instruction: Instruction): boolean {
        return instruction.OpCode == Opcode.Sub && instruction.B > 255 && instruction.C <= 255;
    }

    public override GetObfuscated(context: ObfuscationContext): string {
        return "Stk[Inst[OP_A]] = Inst[OP_B] - Stk[Inst[OP_C]];"
    }

    public override Mutate(instruction: Instruction): void {
        instruction.B -= 255;
        instruction.ConstantMask |= InstructionConstantMask.RB;
    }
}

export class OpSubC extends VOpcode {
    public override IsInstruction(instruction: Instruction): boolean {
        return instruction.OpCode == Opcode.Sub && instruction.B <= 255 && instruction.C > 255;
    }

    public override GetObfuscated(context: ObfuscationContext): string {
        return "Stk[Inst[OP_A]] = Stk[Inst[OP_B]] - Inst[OP_C];"
    }

    public override Mutate(instruction: Instruction): void {
        instruction.C -= 255;
        instruction.ConstantMask |= InstructionConstantMask.RC;
    }
}

export class OpSubBC extends VOpcode {
    public override IsInstruction(instruction: Instruction): boolean {
        return instruction.OpCode == Opcode.Sub && instruction.B > 255 && instruction.C > 255;
    }

    public override GetObfuscated(context: ObfuscationContext): string {
        return "Stk[Inst[OP_A]] = Inst[OP_B] - Inst[OP_C];"
    }

    public override Mutate(instruction: Instruction): void {
        instruction.B -= 255;
        instruction.C -= 255;
        instruction.ConstantMask |= InstructionConstantMask.RB | InstructionConstantMask.RC;
    }
}