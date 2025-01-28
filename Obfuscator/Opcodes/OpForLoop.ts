import { Opcode } from "../../Bytecode Lib/Bytecode/Opcode";
import type Instruction from "../../Bytecode Lib/IR/Instruction";
import type { ObfuscationContext } from "../ObfuscationContext";
import VOpcode from "../VOpcode";

export class OpForLoop extends VOpcode {
    public override IsInstruction(instruction: Instruction): boolean {
        return instruction.OpCode == Opcode.ForLoop
    }

    public override GetObfuscated(context: ObfuscationContext): string {
        return `
local A = Inst[OP_A];
local Step = Stk[A + 2];
local Index = Stk[A] + Step;
Stk[A] = Index;
if (Step > 0) then 
	if (Index <= Stk[A+1]) then
		InstrPoint = Inst[OP_B];
		Stk[A+3] = Index;
	end
elseif (Index >= Stk[A+1]) then
	InstrPoint = Inst[OP_B];
	Stk[A+3] = Index;
end        
`
    }
    
    public override Mutate(instruction: Instruction): void {
        instruction.B += instruction.PC + 1;
    }
}