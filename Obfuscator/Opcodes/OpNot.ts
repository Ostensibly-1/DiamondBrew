import { Opcode } from "../../Bytecode Lib/Bytecode/Opcode";
import { InstructionConstantMask } from "../../Bytecode Lib/IR/Enums";
import type Instruction from "../../Bytecode Lib/IR/Instruction";
import type { ObfuscationContext } from "../ObfuscationContext";
import VOpcode from "../VOpcode";

export class OpNot extends VOpcode {
    public override IsInstruction(instruction: Instruction): boolean {
        return instruction.OpCode == Opcode.Not
    }

    public override GetObfuscated(context: ObfuscationContext): string {
        return "Stk[Inst[OP_A]]=(not Stk[Inst[OP_B]]);";
    }
}