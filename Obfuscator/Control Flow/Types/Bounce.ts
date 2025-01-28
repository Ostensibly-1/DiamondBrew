import { Opcode } from "../../../Bytecode Lib/Bytecode/Opcode";
import type Chunk from "../../../Bytecode Lib/IR/Chunk";
import type Instruction from "../../../Bytecode Lib/IR/Instruction";
import CFGenerator from "../CFGenerator";

export default class Bounce {
    public static CFGenerator: CFGenerator = new CFGenerator()

    public static DoInstructions(chunk: Chunk, Instructions: Array<Instruction>): void {
        Instructions = [...Instructions];
        for (let l of Instructions) {
            if (l.OpCode != Opcode.Jmp) continue;

            let First: Instruction = this.CFGenerator.NextJMP(chunk, (l.RefOperands[0] as Instruction))
            chunk.Instructions.add(First);
            l.RefOperands[0] = First;
        }

        chunk.UpdateMappings();
    }
}