import { Opcode } from "../../Bytecode Lib/Bytecode/Opcode";
import { InstructionConstantMask } from "../../Bytecode Lib/IR/Enums";
import type Instruction from "../../Bytecode Lib/IR/Instruction";
import type { ObfuscationContext } from "../ObfuscationContext";
import VOpcode from "../VOpcode";

export class OpReturn extends VOpcode {
    public override IsInstruction(instruction: Instruction): boolean {
        return instruction.OpCode == Opcode.Return && instruction.B > 3;
    }

    public override GetObfuscated(context: ObfuscationContext): string {
        return `
local A = Inst[OP_A];
do return Unpack(Stk, A, A + Inst[OP_B]) end;
`
    }

    public override Mutate(instruction: Instruction): void {
        instruction.B -= 2;
    }
}

export class OpReturnB2 extends VOpcode {
    public override IsInstruction(instruction: Instruction): boolean {
        return instruction.OpCode == Opcode.Return && instruction.B == 2;
    }

    public override GetObfuscated(context: ObfuscationContext): string {
        return `
do return Stk[Inst[OP_A]] end
`
    }
}

export class OpReturnB3 extends VOpcode {
    public override IsInstruction(instruction: Instruction): boolean {
        return instruction.OpCode == Opcode.Return && instruction.B == 3;
    }

    public override GetObfuscated(context: ObfuscationContext): string {
        return `
local A = Inst[OP_A]; 
do return Stk[A], Stk[A + 1] end
`
    }
}

export class OpReturnB0 extends VOpcode {
    public override IsInstruction(instruction: Instruction): boolean {
        return instruction.OpCode == Opcode.Return && instruction.B == 0;
    }

    public override GetObfuscated(context: ObfuscationContext): string {
        return `
local A = Inst[OP_A];
do return Unpack(Stk, A, Top) end;
`
    }
}

export class OpReturnB1 extends VOpcode {
    public override IsInstruction(instruction: Instruction): boolean {
        return instruction.OpCode == Opcode.Return && instruction.B == 1;
    }

    public override GetObfuscated(context: ObfuscationContext): string {
        return `
do return end;
`
    }
}