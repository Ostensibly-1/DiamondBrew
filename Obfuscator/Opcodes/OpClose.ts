import { Opcode } from "../../Bytecode Lib/Bytecode/Opcode";
import type Instruction from "../../Bytecode Lib/IR/Instruction";
import type { ObfuscationContext } from "../ObfuscationContext";
import VOpcode from "../VOpcode";

export class OpClose extends VOpcode {
    public override IsInstruction(instruction: Instruction): boolean {
        return instruction.OpCode == Opcode.Close;
    }

    public override GetObfuscated(context: ObfuscationContext): string {
        return `local A=Inst[OP_A];local Cls={};for Idx=1,#Lupvals do local List=Lupvals[Idx];for Idz=0,#List do local Upv=List[Idz];local NStk=Upv[1];local Pos=Upv[2]; if NStk==Stk and Pos>=A then Cls[Pos]=NStk[Pos];Upv[1]=Cls;end;end;end;`;
    }
}