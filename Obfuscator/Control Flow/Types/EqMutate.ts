import { Opcode } from "../../../Bytecode Lib/Bytecode/Opcode";
import type Chunk from "../../../Bytecode Lib/IR/Chunk";
import Instruction from "../../../Bytecode Lib/IR/Instruction";
import CFGenerator from "../CFGenerator";

export default class EqMutate {
    public static CFGenerator: CFGenerator = new CFGenerator()

    public static DoInstructions(chunk: Chunk, instructions: Array<Instruction>): void {
        instructions = [...instructions];
        chunk.UpdateMappings();
        for (let l of instructions) {
            if (l.OpCode != Opcode.Eq) continue;

            let target: Instruction = (Array.from(chunk.Instructions)[chunk.InstructionMap.get(l) as number + 1] as Instruction).RefOperands[0] as Instruction
            let target2: Instruction = Array.from(chunk.Instructions)[chunk.InstructionMap.get(l) as number + 2] as Instruction

            let newLt: Instruction = new Instruction(chunk, Opcode.Lt).Instruction(l)
            newLt.OpCode = Opcode.Lt
            newLt.A = l.A

            let newLe: Instruction = new Instruction(chunk, Opcode.Le).Instruction(l)
            newLe.OpCode = Opcode.Le
            newLe.A = l.A == 0 ? 1 : 0

            let idx: number = chunk.InstructionMap.get(l) as number;

            let j1: Instruction = this.CFGenerator.NextJMP(chunk, target2)
            let j2: Instruction = this.CFGenerator.NextJMP(chunk, target2)
            let j3: Instruction = this.CFGenerator.NextJMP(chunk, target)

            Array.from(chunk.Instructions).splice(idx, 0, newLt, j1, newLe, j2, j3);

            chunk.UpdateMappings();
            for (let i of chunk.Instructions) {
                i.UpdateRegisters()
            }

            let j: Instruction = Array.from(chunk.Instructions)[chunk.InstructionMap.get(l) as number + 1];

            const lIndex = Array.from(chunk.Instructions).indexOf(l);
            if (lIndex > -1) {
                Array.from(chunk.Instructions).splice(lIndex, 1);
            }

            const jIndex = Array.from(chunk.Instructions).indexOf(j);
            if (jIndex > -1) {
                Array.from(chunk.Instructions).splice(jIndex, 1);
            }

            for (let br of l.BackReferences) {
                br.RefOperands[0] = newLt;
            }

            for (let br of j.BackReferences) {
                br.RefOperands[0] = newLt
            }

            chunk.UpdateMappings()
        }
    }
}