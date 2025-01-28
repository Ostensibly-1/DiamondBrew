import { Opcode } from "../../Bytecode Lib/Bytecode/Opcode";
import { InstructionConstantMask, InstructionType } from "../../Bytecode Lib/IR/Enums";
import type Instruction from "../../Bytecode Lib/IR/Instruction";
import type { ObfuscationContext } from "../ObfuscationContext";
import VOpcode from "../VOpcode";

export class OpTForLoop extends VOpcode {
    public override IsInstruction(instruction: Instruction): boolean {
        return instruction.OpCode == Opcode.TForLoop;
    }

    public override GetObfuscated(context: ObfuscationContext): string {
        return `
local A = Inst[OP_A];
local C = Inst[OP_C];
local CB = A + 2
local Result = {Stk[A](Stk[A + 1],Stk[CB])};
for Idx = 1, C do 
	Stk[CB + Idx] = Result[Idx];
end;
local R = Result[1]
if R then 
	Stk[CB] = R 
	InstrPoint = Inst[OP_B];
else
	InstrPoint = InstrPoint + 1;
end;
`;
    }

    public override Mutate(instruction: Instruction): void {
        instruction.B = instruction.PC + Array.from(instruction.Chunk.Instructions)[instruction.PC + 1].B + 2;
        instruction.InstructionType = InstructionType.AsBxC;
    }
}