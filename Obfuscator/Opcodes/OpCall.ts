import { Opcode } from "../../Bytecode Lib/Bytecode/Opcode";
import type Instruction from "../../Bytecode Lib/IR/Instruction";
import type { ObfuscationContext } from "../ObfuscationContext";
import VOpcode from "../VOpcode";

export class OpCall extends VOpcode {
    public override IsInstruction(instruction: Instruction): boolean {
        return instruction.OpCode == Opcode.Call && (instruction.B as number) > 2 && (instruction.C as number) > 2;
    }

    public override GetObfuscated(context: ObfuscationContext): string {
        return `
local A = Inst[OP_A]
local Results = { Stk[A](Unpack(Stk, A + 1, Inst[OP_B])) };
local Edx = 0;
for Idx = A, Inst[OP_C] do 
	Edx = Edx + 1;
	Stk[Idx] = Results[Edx];
end
`
    }
    public override Mutate(instruction: Instruction): void {
        (instruction.B as number) += (instruction.A as number) - 1;
        (instruction.C as number) += (instruction.A as number) - 2;
    }
}

export class OpCallB2 extends VOpcode {
    public override IsInstruction(instruction: Instruction): boolean {
        return instruction.OpCode == Opcode.Call && (instruction.B as number) == 2 &&
            (instruction.C as number) > 2;
    }

    public override GetObfuscated(context: ObfuscationContext): string {
        return `
local A = Inst[OP_A]
local Results = { Stk[A](Stk[A + 1]) };
local Edx = 0;
for Idx = A, Inst[OP_C] do 
	Edx = Edx + 1;
	Stk[Idx] = Results[Edx];
end
`
    }
    public override Mutate(instruction: Instruction): void {
        (instruction.C as number) += (instruction.A as number) - 2;
    }
}

export class OpCallB0 extends VOpcode {
    public override IsInstruction(instruction: Instruction): boolean {
        return instruction.OpCode == Opcode.Call && (instruction.B as number) == 0 &&
            (instruction.C as number) > 2;
    }

    public override GetObfuscated(context: ObfuscationContext): string {
        return `
local A = Inst[OP_A]
local Results = { Stk[A](Unpack(Stk, A + 1, Top)) };
local Edx = 0;
for Idx = A, Inst[OP_C] do 
	Edx = Edx + 1;
	Stk[Idx] = Results[Edx];
end
`
    }
    public override Mutate(instruction: Instruction): void {
        (instruction.C as number) += (instruction.A as number) - 2;
    }
}

export class OpCallB1 extends VOpcode {
    public override IsInstruction(instruction: Instruction): boolean {
        return instruction.OpCode == Opcode.Call && (instruction.B as number) == 1 &&
            (instruction.C as number) > 2;
    }

    public override GetObfuscated(context: ObfuscationContext): string {
        return `
local A = Inst[OP_A]
local Results = { Stk[A]() };
local Limit = Inst[OP_C];
local Edx = 0;
for Idx = A, Limit do 
	Edx = Edx + 1;
	Stk[Idx] = Results[Edx];
end
`
    }
    public override Mutate(instruction: Instruction): void {
        (instruction.C as number) += (instruction.A as number) - 2;
    }
}

export class OpCallC0 extends VOpcode {
    public override IsInstruction(instruction: Instruction): boolean {
        return instruction.OpCode == Opcode.Call && (instruction.B as number) > 2 &&
            (instruction.C as number) == 0;
    }

    public override GetObfuscated(context: ObfuscationContext): string {
        return `
local A = Inst[OP_A]
local Results, Limit = _R(Stk[A](Unpack(Stk, A + 1, Inst[OP_B])))
Top = Limit + A - 1
local Edx = 0;
for Idx = A, Top do 
	Edx = Edx + 1;
	Stk[Idx] = Results[Edx];
end;
`
    }
    public override Mutate(instruction: Instruction): void {
        (instruction.B as number) += (instruction.A as number) - 1;
    }
}

export class OpCallC0B2 extends VOpcode {
    public override IsInstruction(instruction: Instruction): boolean {
        return instruction.OpCode == Opcode.Call && (instruction.B as number) == 2 &&
            (instruction.C as number) == 0;
    }

    public override GetObfuscated(context: ObfuscationContext): string {
        return `
local A = Inst[OP_A]
local Results, Limit = _R(Stk[A](Stk[A + 1]))
Top = Limit + A - 1
local Edx = 0;
for Idx = A, Top do 
	Edx = Edx + 1;
	Stk[Idx] = Results[Edx];
end;
`
    }
    public override Mutate(instruction: Instruction): void {
        (instruction.B as number) += (instruction.A as number) - 1;
    }
}

export class OpCallC1 extends VOpcode {
    public override IsInstruction(instruction: Instruction): boolean {
        return instruction.OpCode == Opcode.Call && (instruction.B as number) > 2 &&
            (instruction.C as number) == 1;
    }

    public override GetObfuscated(context: ObfuscationContext): string {
        return `
local A = Inst[OP_A]
Stk[A](Unpack(Stk, A + 1, Inst[OP_B]))
`
    }
    public override Mutate(instruction: Instruction): void {
        (instruction.B as number) += (instruction.A as number) - 1;
    }
}

export class OpCallC1B2 extends VOpcode {
    public override IsInstruction(instruction: Instruction): boolean {
        return instruction.OpCode == Opcode.Call && (instruction.B as number) == 2 &&
            (instruction.C as number) == 1;
    }

    public override GetObfuscated(context: ObfuscationContext): string {
        return `
local A = Inst[OP_A]
Stk[A](Stk[A + 1])
`
    }
}

export class OpCallB0C2 extends VOpcode {
    public override IsInstruction(instruction: Instruction) {
        return instruction.OpCode == Opcode.Call &&
            (instruction.B as number) == 0 &&
            (instruction.C as number) == 2;
    }
    public override GetObfuscated(context: ObfuscationContext) {
        return `local A = Inst[OP_A]
  Stk[A] = Stk[A](Unpack(Stk, A + 1, Top))`;
    }
}

export class OpCallB0C0 extends VOpcode {
    public override IsInstruction(instruction: Instruction): boolean {
        return instruction.OpCode == Opcode.Call && (instruction.B as number) == 0 &&
            (instruction.C as number) == 0;
    }

    public override GetObfuscated(context: ObfuscationContext): string {
        return `
local A = Inst[OP_A]
local Results, Limit = _R(Stk[A](Unpack(Stk, A + 1, Top)))
Top = Limit + A - 1
local Edx = 0;
for Idx = A, Top do 
	Edx = Edx + 1;
	Stk[Idx] = Results[Edx];
end;
`
    }
}

export class OpCallB0C1 extends VOpcode {
    public override IsInstruction(instruction: Instruction): boolean {
        return instruction.OpCode == Opcode.Call && (instruction.B as number) == 0 &&
            (instruction.C as number) == 1;
    }

    public override GetObfuscated(context: ObfuscationContext): string {
        return `
local A = Inst[OP_A]
Stk[A](Unpack(Stk, A + 1, Top))
`
    }
}

export class OpCallB1C0 extends VOpcode {
    public override IsInstruction(instruction: Instruction): boolean {
        return instruction.OpCode == Opcode.Call && (instruction.B as number) == 1 &&
            (instruction.C as number) == 0;
    }

    public override GetObfuscated(context: ObfuscationContext): string {
        return `
local A = Inst[OP_A]
local Results, Limit = _R(Stk[A]())
Top = Limit + A - 1
local Edx = 0;
for Idx = A, Top do 
	Edx = Edx + 1;
	Stk[Idx] = Results[Edx];
end;
`
    }
}

export class OpCallB1C1 extends VOpcode {
    public override IsInstruction(instruction: Instruction): boolean {
        return instruction.OpCode == Opcode.Call && (instruction.B as number) == 1 &&
            (instruction.C as number) == 1;
    }

    public override GetObfuscated(context: ObfuscationContext): string {
        return `Stk[Inst[OP_A]]();`
    }
}

export class OpCallC2 extends VOpcode {
    public override IsInstruction(instruction: Instruction): boolean {
        return instruction.OpCode == Opcode.Call && (instruction.B as number) > 2 &&
            (instruction.C as number) == 2;
    }

    public override GetObfuscated(context: ObfuscationContext): string {
        return `
local A = Inst[OP_A]
Stk[A] = Stk[A](Unpack(Stk, A + 1, Inst[OP_B])) 
`
    }

    public override Mutate(instruction: Instruction): void {
        (instruction.B as number) += (instruction.A as number) - 1;
    }
}

export class OpCallC2B2 extends VOpcode {
    public override IsInstruction(instruction: Instruction): boolean {
        return instruction.OpCode == Opcode.Call && (instruction.B as number) == 2 &&
            (instruction.C as number) == 2;
    }

    public override GetObfuscated(context: ObfuscationContext): string {
        return `
local A = Inst[OP_A]
Stk[A] = Stk[A](Stk[A + 1])
`
    }
}

export class OpCallB1C2 extends VOpcode {
    public override IsInstruction(instruction: Instruction): boolean {
        return instruction.OpCode == Opcode.Call && (instruction.B as number) == 1 &&
            (instruction.C as number) == 2;
    }

    public override GetObfuscated(context: ObfuscationContext): string {
        return `
local A = Inst[OP_A]
Stk[A] = Stk[A]()
`
    }
}