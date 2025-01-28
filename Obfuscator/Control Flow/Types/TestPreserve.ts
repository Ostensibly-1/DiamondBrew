import { Opcode } from "../../../Bytecode Lib/Bytecode/Opcode";
import type Chunk from "../../../Bytecode Lib/IR/Chunk";
import Constant from "../../../Bytecode Lib/IR/Constant";
import Instruction from "../../../Bytecode Lib/IR/Instruction";

export default class TestPreserve {
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

    public static DoInstructions(chunk: Chunk, instructions: Array<Instruction>) {
        instructions = [...instructions];
        for (let idx = 0; idx < instructions.length; idx++) {
            this.used = []
            let i: Instruction = instructions[idx]
            switch (i.OpCode) {
                case Opcode.Lt:
                case Opcode.Le:
                case Opcode.Eq:
                    {
                        let mReg1 = 250
                        let mReg2 = 251

                        let ma: Instruction;
                        let mb: Instruction;

                        if (i.RefOperands[0] instanceof Constant) {
                            ma = new Instruction(chunk, Opcode.LoadConst, i.RefOperands[0])
                            ma.A = mReg1;
                        } else {
                            ma = new Instruction(chunk, Opcode.Move)
                            ma.A = mReg1;
                            ma.B = i.B;
                        }

                        if (i.RefOperands[1] instanceof Constant) {
                            mb = new Instruction(chunk, Opcode.LoadConst, i.RefOperands[1])
                            mb.A = mReg2;
                        } else {
                            mb = new Instruction(chunk, Opcode.Move)
                            mb.A = mReg2;
                            mb.B = i.C;
                        }

                        let loadBool1 = new Instruction(chunk, Opcode.LoadBool)
                        loadBool1.A = mReg1
                        loadBool1.B = 0;

                        let loadBool2 = new Instruction(chunk, Opcode.LoadBool)
                        loadBool1.A = mReg2
                        loadBool1.B = 0;

                        i.B = mReg1;
                        i.C = mReg2;

                        i.SetupRefs()

                        const insertIndex = chunk.InstructionMap.get(i)!;
                        Array.from(chunk.Instructions).splice(insertIndex + 2, 0, loadBool1, loadBool2)
                        Array.from(chunk.Instructions).splice(insertIndex, 0, ma, mb)
                        chunk.UpdateMappings()

                        const refIndex = chunk.InstructionMap.get(Array.from(chunk.Instructions)[insertIndex + 1].RefOperands[0] as Instruction)!;
                        Array.from(chunk.Instructions).splice(refIndex, 0, loadBool1, loadBool2)
                        Array.from(chunk.Instructions)[insertIndex + 1].RefOperands[0] = loadBool1
                        chunk.UpdateMappings()

                        for (let ins of i.BackReferences) {
                            ins.RefOperands[0] = ma;
                        }
                        break;
                    }
                case Opcode.Test:
                case Opcode.TestSet:
                    {
                        let rReg = this.NIntD(0, 128)
                        let pReg = this.NIntD(257, 512)

                        let m1 = new Instruction(chunk, Opcode.Move)
                        m1.A = pReg;
                        m1.B = rReg;

                        let m2 = new Instruction(chunk, Opcode.Move);
                        m2.A = rReg;
                        m2.B = i.A;

                        let lb = new Instruction(chunk, Opcode.LoadBool);
                        lb.A = pReg;
                        lb.B = 0;

                        let m3 = new Instruction(chunk, Opcode.Move);
                        m3.A = rReg;
                        m3.B = pReg;

                        const insertIndex = chunk.InstructionMap.get(i)!;
                        Array.from(chunk.Instructions).splice(insertIndex + 2, 0, m3, lb)
                        Array.from(chunk.Instructions).splice(insertIndex, 0, m1, m2)
                        chunk.UpdateMappings()

                        const refIndex = chunk.InstructionMap.get(Array.from(chunk.Instructions)[insertIndex + 1].RefOperands[0] as Instruction)!;
                        Array.from(chunk.Instructions).splice(refIndex, 0, m3, lb)
                        Array.from(chunk.Instructions)[insertIndex + 1].RefOperands[0] = m3
                        chunk.UpdateMappings()

                        for (let ins of i.BackReferences) {
                            ins.RefOperands[0] = m1;
                        }
                        break;
                    }
            }
        }
    }
}