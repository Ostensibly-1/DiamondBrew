import { Opcode } from "../../Bytecode Lib/Bytecode/Opcode";
import { InstructionConstantMask } from "../../Bytecode Lib/IR/Enums";
import type Instruction from "../../Bytecode Lib/IR/Instruction";
import type { ObfuscationContext } from "../ObfuscationContext";
import VOpcode from "../VOpcode";

export class OpNewStk extends VOpcode {
    public override IsInstruction(instruction: Instruction): boolean {
        return instruction.OpCode == Opcode.NewStack;
    }

    public override GetObfuscated(context: ObfuscationContext): string {
        return "Stk = {};for Idx = 0, PCount do if Idx < Params then Stk[Idx] = Args[Idx + 1]; else break end; end;";
    }
}