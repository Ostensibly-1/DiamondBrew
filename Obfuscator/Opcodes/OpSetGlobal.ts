import { Opcode } from "../../Bytecode Lib/Bytecode/Opcode";
import { InstructionConstantMask } from "../../Bytecode Lib/IR/Enums";
import type Instruction from "../../Bytecode Lib/IR/Instruction";
import type { ObfuscationContext } from "../ObfuscationContext";
import VOpcode from "../VOpcode";

export class OpSetGlobal extends VOpcode {
    public override IsInstruction(instruction: Instruction): boolean {
        return instruction.OpCode == Opcode.SetGlobal;
    }

    public override GetObfuscated(context: ObfuscationContext): string {
        return "Env[Inst[OP_B]] = Stk[Inst[OP_A]];";
    }

    public override Mutate(instruction: Instruction): void {
        instruction.B++;
        instruction.ConstantMask |= InstructionConstantMask.RB;
    }
}