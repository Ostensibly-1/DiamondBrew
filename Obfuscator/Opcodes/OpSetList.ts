import { Opcode } from "../../Bytecode Lib/Bytecode/Opcode";
import { InstructionConstantMask, InstructionType } from "../../Bytecode Lib/IR/Enums";
import type Instruction from "../../Bytecode Lib/IR/Instruction";
import type { ObfuscationContext } from "../ObfuscationContext";
import VOpcode from "../VOpcode";

export class OpSetList extends VOpcode {
    public override IsInstruction(instruction: Instruction): boolean {
        return instruction.OpCode == Opcode.SetList;
    }

    public override GetObfuscated(context: ObfuscationContext): string {
        return `
local A = Inst[OP_A];
local T = Stk[A];
for Idx = A + 1, Inst[OP_B] do 
	Insert(T, Stk[Idx])
end;
`
    }

    public override Mutate(instruction: Instruction): void {
        instruction.B += instruction.A;
    }
}

export class OpSetListB0 extends VOpcode {
    public override IsInstruction(instruction: Instruction): boolean {
        return instruction.OpCode == Opcode.SetList && instruction.B == 0 && instruction.C != 0;
    }

    public override GetObfuscated(context: ObfuscationContext): string {
        return `
local A = Inst[OP_A];
local T = Stk[A];
for Idx = A + 1, Top do 
	Insert(T, Stk[Idx])
end;
`
    }
}

export class OpSetListC0 extends VOpcode {
    public override IsInstruction(instruction: Instruction): boolean {
        return instruction.OpCode == Opcode.SetList && instruction.C == 0;
    }

    public override GetObfuscated(context: ObfuscationContext): string {
        return `
InstrPoint = InstrPoint + 1
local A = Inst[OP_A];
local T = Stk[A];
for Idx = A + 1, Inst[OP_B] do 
	Insert(T, Stk[Idx])
end;
`
    }

    public override Mutate(instruction: Instruction): void {
        instruction.B = instruction.A + Array.from(instruction.Chunk.Instructions)[instruction.PC + 1].Data;
        instruction.InstructionType = InstructionType.ABx;
    }
}