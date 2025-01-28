import { Opcode } from "../../Bytecode Lib/Bytecode/Opcode";
import { InstructionConstantMask } from "../../Bytecode Lib/IR/Enums";
import type Instruction from "../../Bytecode Lib/IR/Instruction";
import type { ObfuscationContext } from "../ObfuscationContext";
import VOpcode from "../VOpcode";

export class OpLoadNil extends VOpcode {
    public override IsInstruction(instruction: Instruction): boolean {
        return instruction.OpCode == Opcode.LoadNil;
    }

    public override GetObfuscated(context: ObfuscationContext): string {
        return "for Idx=Inst[OP_A],Inst[OP_B] do Stk[Idx]=nil;end;";
    }
}