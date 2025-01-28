import { Opcode } from "../../Bytecode Lib/Bytecode/Opcode";
import { InstructionConstantMask } from "../../Bytecode Lib/IR/Enums";
import type Instruction from "../../Bytecode Lib/IR/Instruction";
import type { ObfuscationContext } from "../ObfuscationContext";
import VOpcode from "../VOpcode";

export class OpVarArg extends VOpcode {
    public override IsInstruction(instruction: Instruction): boolean {
        return instruction.OpCode == Opcode.VarArg && instruction.B != 0;
    }

    public override GetObfuscated(context: ObfuscationContext): string {
        return "local A=Inst[OP_A];local B=Inst[OP_B];for Idx=A,B do Stk[Idx]=Vararg[Idx-A];end;";
    }

    public override Mutate(instruction: Instruction): void {
        instruction.B += instruction.A - 1;
    }
}

export class OpVarArgB0 extends VOpcode {
    public override IsInstruction(instruction: Instruction): boolean {
        return instruction.OpCode == Opcode.VarArg && instruction.B == 0;
    }

    public override GetObfuscated(context: ObfuscationContext): string {
        return "local A=Inst[OP_A];Top=A+Varargsz-1;for Idx=A,Top do local VA=Vararg[Idx-A];Stk[Idx]=VA;end;";
    }
}