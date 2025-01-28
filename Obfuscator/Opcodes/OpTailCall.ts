import { Opcode } from "../../Bytecode Lib/Bytecode/Opcode";
import { InstructionConstantMask, InstructionType } from "../../Bytecode Lib/IR/Enums";
import type Instruction from "../../Bytecode Lib/IR/Instruction";
import type { ObfuscationContext } from "../ObfuscationContext";
import VOpcode from "../VOpcode";

export class OpTailCall extends VOpcode {
    public override IsInstruction(instruction: Instruction): boolean {
        return instruction.OpCode == Opcode.TailCall;
    }

    public override GetObfuscated(context: ObfuscationContext): string {
        return `
local A = Inst[OP_A];
do return Stk[A](Unpack(Stk, A + 1, Inst[OP_B])) end;
`;
    }

    public override Mutate(instruction: Instruction): void {
        instruction.B += instruction.A - 1;
    }
}

export class OpTailCallB0 extends VOpcode {
    public override IsInstruction(instruction: Instruction): boolean {
        return instruction.OpCode == Opcode.TailCall && instruction.B == 0;
    }

    public override GetObfuscated(context: ObfuscationContext): string {
        return `
local A = Inst[OP_A];
do return Stk[A](Unpack(Stk, A + 1, Top)) end;
`;
    }
}

export class OpTailCallB1 extends VOpcode {
    public override IsInstruction(instruction: Instruction): boolean {
        return instruction.OpCode == Opcode.TailCall && instruction.B == 1;
    }

    public override GetObfuscated(context: ObfuscationContext): string {
        return "do return Stk[Inst[OP_A]](); end;";
    }
}