import { Opcode } from "../../Bytecode Lib/Bytecode/Opcode";
import type Instruction from "../../Bytecode Lib/IR/Instruction";
import type { ObfuscationContext } from "../ObfuscationContext";
import VOpcode from "../VOpcode";

export class OpConcat extends VOpcode {
    public override IsInstruction(instruction: Instruction): boolean {
        return instruction.OpCode == Opcode.Concat;
    }

    public override GetObfuscated(context: ObfuscationContext): string {
        return "local B=Inst[OP_B];local K=Stk[B] for Idx=B+1,Inst[OP_C] do K=K..Stk[Idx];end;Stk[Inst[OP_A]]=K;";
    }
}