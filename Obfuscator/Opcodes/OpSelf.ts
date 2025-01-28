import { Opcode } from "../../Bytecode Lib/Bytecode/Opcode";
import { InstructionConstantMask } from "../../Bytecode Lib/IR/Enums";
import type Instruction from "../../Bytecode Lib/IR/Instruction";
import type { ObfuscationContext } from "../ObfuscationContext";
import VOpcode from "../VOpcode";

export class OpSelf extends VOpcode {
    public override IsInstruction(instruction: Instruction): boolean {
        return instruction.OpCode == Opcode.Self && instruction.C <= 255;
    }

    public override GetObfuscated(context: ObfuscationContext): string {
        return "local A=Inst[OP_A];local B=Stk[Inst[OP_B]];Stk[A+1]=B;Stk[A]=B[Stk[Inst[OP_C]]];";
    }
}

export class OpSelfC extends VOpcode {
    public override IsInstruction(instruction: Instruction): boolean {
        return instruction.OpCode == Opcode.Self && instruction.C > 255;
    }

    public override GetObfuscated(context: ObfuscationContext): string {
        return "local A=Inst[OP_A];local B=Stk[Inst[OP_B]];Stk[A+1]=B;Stk[A]=B[Inst[OP_C]];";
    }

    public override Mutate(instruction: Instruction): void {
        instruction.C -= 255;
        instruction.ConstantMask |= InstructionConstantMask.RC;
    }
}