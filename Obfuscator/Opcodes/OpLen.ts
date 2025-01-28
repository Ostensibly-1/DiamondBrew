import { Opcode } from "../../Bytecode Lib/Bytecode/Opcode";
import { InstructionConstantMask } from "../../Bytecode Lib/IR/Enums";
import type Instruction from "../../Bytecode Lib/IR/Instruction";
import type { ObfuscationContext } from "../ObfuscationContext";
import VOpcode from "../VOpcode";

export class OpLen extends VOpcode {
    public override IsInstruction(instruction: Instruction): boolean {
        return instruction.OpCode == Opcode.Len
    }

    public override GetObfuscated(context: ObfuscationContext): string {
        return "Stk[Inst[OP_A]]=#Stk[Inst[OP_B]];";
    }
}