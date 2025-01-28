import { Opcode } from "../../Bytecode Lib/Bytecode/Opcode";
import { InstructionConstantMask, InstructionType } from "../../Bytecode Lib/IR/Enums";
import type Instruction from "../../Bytecode Lib/IR/Instruction";
import type { ObfuscationContext } from "../ObfuscationContext";
import VOpcode from "../VOpcode";

export class OpGt extends VOpcode {
    public override IsInstruction(instruction: Instruction): boolean {
        return instruction.OpCode == Opcode.Lt && instruction.A != 0 && instruction.B <= 255 && instruction.C <= 255;
    }

    public override GetObfuscated(context: ObfuscationContext): string {
        return "if (Stk[Inst[OP_A]]<Stk[Inst[OP_C]])then InstrPoint=Inst[OP_B]; else InstrPoint=InstrPoint+1; end;";
    }

    public override Mutate(instruction: Instruction): void {
        instruction.A = instruction.B;

        instruction.B = instruction.PC + Array.from(instruction.Chunk.Instructions)[instruction.PC + 1].B + 2;
        instruction.InstructionType = InstructionType.AsBxC;
    }
}

export class OpGtB extends VOpcode {
    public override IsInstruction(instruction: Instruction): boolean {
        return instruction.OpCode == Opcode.Lt && instruction.A != 0 && instruction.B > 255 && instruction.C <= 255;
    }

    public override GetObfuscated(context: ObfuscationContext): string {
        return "if (Inst[OP_A] < Stk[Inst[OP_C]]) then InstrPoint=Inst[OP_B]; else InstrPoint=InstrPoint+1; end;";
    }

    public override Mutate(instruction: Instruction): void {
        instruction.A = instruction.B - 255;
        instruction.B -= 255;

        instruction.B = instruction.PC + Array.from(instruction.Chunk.Instructions)[instruction.PC + 1].B + 2;
        instruction.InstructionType = InstructionType.AsBxC;
        instruction.ConstantMask |= InstructionConstantMask.RA;
    }
}

export class OpGtC extends VOpcode {
    public override IsInstruction(instruction: Instruction): boolean {
        return instruction.OpCode == Opcode.Lt && instruction.A != 0 && instruction.B <= 255 && instruction.C > 255;
    }

    public override GetObfuscated(context: ObfuscationContext): string {
        return "if (Stk[Inst[OP_A]] < Inst[OP_C]) then InstrPoint=Inst[OP_B]; else InstrPoint=InstrPoint+1; end;";
    }

    public override Mutate(instruction: Instruction): void {
        instruction.A = instruction.B;
        instruction.C -= 255;

        instruction.B = instruction.PC + Array.from(instruction.Chunk.Instructions)[instruction.PC + 1].B + 2;
        instruction.InstructionType = InstructionType.AsBxC;
        instruction.ConstantMask |= InstructionConstantMask.RC;
    }
}

export class OpGtBC extends VOpcode {
    public override IsInstruction(instruction: Instruction): boolean {
        return instruction.OpCode == Opcode.Lt && instruction.A != 0 && instruction.B > 255 && instruction.C > 255;
    }

    public override GetObfuscated(context: ObfuscationContext): string {
        return "if (Inst[OP_A] < Inst[OP_C]) then InstrPoint=Inst[OP_B]; else InstrPoint=InstrPoint+1; end;";
    }

    public override Mutate(instruction: Instruction): void {
        instruction.A = instruction.B - 255;
        instruction.C -= 255;

        instruction.B = instruction.PC + Array.from(instruction.Chunk.Instructions)[instruction.PC + 1].B + 2;
        instruction.InstructionType = InstructionType.AsBxC;
        instruction.ConstantMask |= InstructionConstantMask.RA | InstructionConstantMask.RC;
    }
}