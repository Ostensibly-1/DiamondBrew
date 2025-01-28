import { Opcode } from "../../Bytecode Lib/Bytecode/Opcode";
import { InstructionConstantMask } from "../../Bytecode Lib/IR/Enums";
import type Instruction from "../../Bytecode Lib/IR/Instruction";
import type { ObfuscationContext } from "../ObfuscationContext";
import VOpcode from "../VOpcode";

export class OpJmp extends VOpcode {
    public override IsInstruction(instruction: Instruction): boolean {
        return instruction.OpCode == Opcode.Jmp
    }

    public override GetObfuscated(context: ObfuscationContext): string {
        return "InstrPoint=Inst[OP_B];";
    }

    public override Mutate(instruction: Instruction): void {
        instruction.B += instruction.PC + 1;
    }
}