import { Opcode } from "../../../Bytecode Lib/Bytecode/Opcode";
import type Chunk from "../../../Bytecode Lib/IR/Chunk";
import type Instruction from "../../../Bytecode Lib/IR/Instruction";
import CFGenerator from "../CFGenerator";

export default class TestFlip {
    public static DoInstructions(chunk: Chunk, instructions: Array<Instruction>) {
        instructions = [...instructions];
        let generator: CFGenerator = new CFGenerator();

        for (let idx = instructions.length - 1; idx >= 0; idx--) {
            let i = instructions[idx];
            switch (i.OpCode) {
                case Opcode.Lt:
                case Opcode.Le:
                case Opcode.Eq:
                    {
                        if (Math.random() > 0.5) {
                            i.A = i.A == 0 ? 1 : 0
                            let nJmp = generator.NextJMP(chunk, instructions[idx + 2])
                            Array.from(chunk.Instructions)[chunk.InstructionMap.get(i) as number + 1] = nJmp
                        }
                        break;
                    }
                case Opcode.Test:
                    {
                        if (Math.random() > 0.5) {
                            i.C = i.C == 0 ? 1 : 0
                            let nJmp = generator.NextJMP(chunk, instructions[idx + 2])
                            Array.from(chunk.Instructions)[chunk.InstructionMap.get(i) as number + 1] = nJmp
                        }
                        break;
                    }
            }
        }

        chunk.UpdateMappings()
    }
}