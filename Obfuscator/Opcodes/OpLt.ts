import { Opcode } from "../../Bytecode Lib/Bytecode/Opcode";
import { InstructionConstantMask, InstructionType } from "../../Bytecode Lib/IR/Enums";
import type Instruction from "../../Bytecode Lib/IR/Instruction";
import type { ObfuscationContext } from "../ObfuscationContext";
import VOpcode from "../VOpcode";

export class OpLt extends VOpcode {
    public override IsInstruction(instruction: Instruction): boolean {
        return instruction.OpCode == Opcode.Lt && instruction.A == 0 && instruction.B <= 255 && instruction.C <= 255;
    }

    public override GetObfuscated(context: ObfuscationContext): string {
        return "if(Stk[Inst[OP_A]]<Stk[Inst[OP_C]])then InstrPoint=InstrPoint+1;else InstrPoint=Inst[OP_B];end;";
    }

    public override Mutate(instruction: Instruction): void {
        instruction.A = instruction.B;

        instruction.B = instruction.PC + Array.from(instruction.Chunk.Instructions)[instruction.PC + 1].B + 2;
        instruction.InstructionType = InstructionType.AsBxC;
    }
}

export class OpLtB extends VOpcode {
    public override IsInstruction(instruction: Instruction): boolean {
        return instruction.OpCode == Opcode.Lt && instruction.A == 0 && instruction.B > 255 && instruction.C <= 255;
    }

    public override GetObfuscated(context: ObfuscationContext): string {
        return "if(Inst[OP_A] < Stk[Inst[OP_C]]) then InstrPoint = InstrPoint+1;else InstrPoint=Inst[OP_B];end;";
    }

    public override Mutate(instruction: Instruction): void {
        instruction.A = instruction.B - 255;

        instruction.B = instruction.PC + Array.from(instruction.Chunk.Instructions)[instruction.PC + 1].B + 2;
        instruction.InstructionType = InstructionType.AsBxC;
        instruction.ConstantMask |= InstructionConstantMask.RA;
    }
}

export class OpLtC extends VOpcode {
    public override IsInstruction(instruction: Instruction): boolean {
        return instruction.OpCode == Opcode.Lt && instruction.A == 0 && instruction.B <= 255 && instruction.C > 255;
    }

    public override GetObfuscated(context: ObfuscationContext): string {
        return "if(Stk[Inst[OP_A]] < Inst[OP_C])then InstrPoint=InstrPoint+1;else InstrPoint=Inst[OP_B];end;";
    }

    public override Mutate(instruction: Instruction): void {
        instruction.A = instruction.B;
        instruction.C -= 255;

        instruction.B = instruction.PC + Array.from(instruction.Chunk.Instructions)[instruction.PC + 1].B + 2;
        instruction.InstructionType = InstructionType.AsBxC;
        instruction.ConstantMask |= InstructionConstantMask.RC;
    }
}

export class OpLtBC extends VOpcode {
    public override IsInstruction(instruction: Instruction): boolean {
        return instruction.OpCode == Opcode.Lt && instruction.A == 0 && instruction.B > 255 && instruction.C > 255;
    }

    public override GetObfuscated(context: ObfuscationContext): string {
        return "if(Inst[OP_A] < Inst[OP_C]) then InstrPoint=InstrPoint+1;else InstrPoint=Inst[OP_B];end;";
    }

    public override Mutate(instruction: Instruction): void {
        instruction.A = instruction.B - 255;
        instruction.C -= 255;

        instruction.B = instruction.PC + Array.from(instruction.Chunk.Instructions)[instruction.PC + 1].B + 2;
        instruction.InstructionType = InstructionType.AsBxC;
        instruction.ConstantMask |= InstructionConstantMask.RA | InstructionConstantMask.RC;
    }
}