import { Opcode } from "../../../Bytecode Lib/Bytecode/Opcode";
import type Chunk from "../../../Bytecode Lib/IR/Chunk";
import Instruction from "../../../Bytecode Lib/IR/Instruction";
import CFGenerator from "../CFGenerator";

export class TestSpam {
    public static used: Array<number> = new Array<number>()

    private static shuffleArray(array: number[]): void {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    private static NIntD(min: number, max: number): number {
        const range = Array.from({ length: max - min }, (_, i) => min + i);

        const available = range.filter(n => !this.used.includes(n));

        if (available.length === 0) {
            throw new Error("No available numbers in the specified range");
        }

        this.shuffleArray(available);

        const selected = available[0];
        this.used.push(selected);
        return selected;
    }

    public static DoInstructions(chunk: Chunk, instructions: Instruction[]): void {
        instructions = [...instructions];
        const cg = new CFGenerator();
        const r = Math.random;

        for (let i = instructions.length - 1; i >= 0; i--) {
            TestSpam.used = [];
            const instr = instructions[i];

            switch (instr.OpCode) {
                case Opcode.Eq:
                case Opcode.Lt:
                case Opcode.Le: {
                    const AddTVGroup = (test: Instruction): Instruction[] => {
                        let cmp1: Instruction, cmp2: Instruction;

                        cmp1 = new Instruction(chunk, Opcode.Move).Instruction(test);
                        const target1 = Array.from(chunk.Instructions)[chunk.InstructionMap.get(test) as number + 1];
                        const jmpCorrect1 = cg.NextJMP(chunk, target1.RefOperands[0] as Instruction);
                        const jmpJunk1 = cg.NextJMP(chunk, instructions[Math.floor(r() * (i - 2))]);

                        target1.RefOperands[0] = cmp1;
                        Array.from(chunk.Instructions).push(cmp1, jmpCorrect1, jmpJunk1);

                        cmp2 = new Instruction(chunk, Opcode.Move).Instruction(test);
                        const target2 = Array.from(chunk.Instructions)[chunk.InstructionMap.get(test)! + 2];
                        const jmpCorrect2 = cg.NextJMP(chunk, target2);
                        const jmpJunk2 = cg.NextJMP(chunk, instructions[Math.floor(r() * (i - 2))]);
                        const jmpStart = cg.NextJMP(chunk, cmp2);

                        Array.from(chunk.Instructions).splice(chunk.InstructionMap.get(target2)!, 0, jmpStart);
                        Array.from(chunk.Instructions).push(cmp2, jmpJunk2, jmpCorrect2);

                        chunk.UpdateMappings();
                        return [cmp1, cmp2];
                    };

                    let tv1 = AddTVGroup(instr);
                    for (let j = 0; j < 3; j++) {
                        const tv2: Instruction[] = [];
                        tv1.forEach(ins => tv2.push(...AddTVGroup(ins)));
                        tv1 = tv2;
                    }
                    break;
                }

                case Opcode.Test:
                case Opcode.TestSet: {
                    const AddTVGroup = (test: Instruction): Instruction[] => {
                        let test1: Instruction, test2: Instruction;

                        test1 = new Instruction(chunk, Opcode.Move).Instruction(test);
                        const target1 = Array.from(chunk.Instructions)[chunk.InstructionMap.get(test)! + 1];
                        const jmpCorrect1 = cg.NextJMP(chunk, target1.RefOperands[0] as Instruction);
                        const jmpJunk1 = cg.NextJMP(chunk, instructions[Math.floor(r() * (i - 2))]);

                        target1.RefOperands[0] = test1;
                        Array.from(chunk.Instructions).push(test1, jmpCorrect1, jmpJunk1);

                        test2 = new Instruction(chunk, Opcode.Move).Instruction(test);
                        const target2 = Array.from(chunk.Instructions)[chunk.InstructionMap.get(test)! + 2];
                        const jmpCorrect2 = cg.NextJMP(chunk, target2);
                        const jmpJunk2 = cg.NextJMP(chunk, instructions[Math.floor(r() * (i - 2))]);
                        const jmpStart = cg.NextJMP(chunk, test2);

                        Array.from(chunk.Instructions).splice(chunk.InstructionMap.get(target2)!, 0, jmpStart);
                        Array.from(chunk.Instructions).push(test2, jmpJunk2, jmpCorrect2);

                        chunk.UpdateMappings();
                        return [test1, test2];
                    };

                    let tv1 = AddTVGroup(instr);
                    for (let j = 0; j < 3; j++) {
                        const x = tv1.length;
                        for (let index = 0; index < x; index++) {
                            const ins = tv1[index];
                            tv1.push(...AddTVGroup(ins));
                        }
                    }
                    break;
                }
            }
        }
        chunk.UpdateMappings();
    }
}