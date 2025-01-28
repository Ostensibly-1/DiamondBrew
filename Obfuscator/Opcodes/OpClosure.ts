import { Opcode } from "../../Bytecode Lib/Bytecode/Opcode";
import type Chunk from "../../Bytecode Lib/IR/Chunk";
import { InstructionType } from "../../Bytecode Lib/IR/Enums";
import type Instruction from "../../Bytecode Lib/IR/Instruction";
import type { ObfuscationContext } from "../ObfuscationContext";
import VOpcode from "../VOpcode";

export class OpClosure extends VOpcode {
    public override IsInstruction(instruction: Instruction): boolean {
        return instruction.OpCode == Opcode.Closure && (Array.from(instruction.Chunk.Functions)[instruction.B as number] as Chunk).UpvalueCount > 0;
    }

    public override GetObfuscated(context: ObfuscationContext): string {
        let MoveOp = context.InstructionMapping.get(Opcode.Move)
        return `local NewProto=Proto[Inst[OP_B]];local NewUvals;local Indexes={};NewUvals=Setmetatable({},{__index=function(_,Key)local Val=Indexes[Key];return Val[1][Val[2]];end,__newindex=function(_,Key,Value)local Val=Indexes[Key] Val[1][Val[2]]=Value;end;});for Idx=1,Inst[OP_C] do InstrPoint=InstrPoint+1;local Mvm=Instr[InstrPoint];if Mvm[OP_ENUM]==OP_MOVE then Indexes[Idx-1]={Stk,Mvm[OP_B]};else Indexes[Idx-1]={Upvalues,Mvm[OP_B]};end;Lupvals[#Lupvals+1]=Indexes;end;Stk[Inst[OP_A]]=Wrap(NewProto,NewUvals,Env);`
            .replaceAll("OP_MOVE", MoveOp?.VIndex.toString() ?? "-1")
    }

    public override Mutate(instruction: Instruction): void {
        instruction.InstructionType = InstructionType.AsBxC;
        instruction.C = (Array.from(instruction.Chunk.Functions)[instruction.B as number] as Chunk).UpvalueCount;
    }
}

export class OpClosureNU extends VOpcode {
    public override IsInstruction(instruction: Instruction): boolean {
        return instruction.OpCode == Opcode.Closure && (Array.from(instruction.Chunk.Functions)[instruction.B as number] as Chunk).UpvalueCount == 0;
    }

    public override GetObfuscated(context: ObfuscationContext): string {
        return "Stk[Inst[OP_A]]=Wrap(Proto[Inst[OP_B]],nil,Env);"
    }
}