import { Opcode } from "../../Bytecode Lib/Bytecode/Opcode";
import type Chunk from "../../Bytecode Lib/IR/Chunk";
import type Constant from "../../Bytecode Lib/IR/Constant";
import Instruction from "../../Bytecode Lib/IR/Instruction";
import Bounce from "./Types/Bounce";
import EqMutate from "./Types/EqMutate";
import Inlining from "./Types/Inlining";
import TestFlip from "./Types/TestFlip";
import TestPreserve from "./Types/TestPreserve";
import { TestSpam } from "./Types/TestSpam";

export default class CFContext {
    public lChunk: Chunk;

    public DoChunk(c: Chunk): void {
        let chunkHasCflow: boolean = false;

        let CBegin = null;

        var Instructs = c.Instructions;
        for (var index = 0; index < Instructs.size - 1; index++) {
            let instr: Instruction = Array.from(Instructs)[index]
            if (instr.OpCode == Opcode.GetGlobal && Array.from(Instructs)[index + 1].OpCode == Opcode.Call) {
                let str: string = (instr.RefOperands[0] as Constant).Data
                let do_: boolean = false;

                switch (str) {
                    case "IB_MAX_CFLOW_START\u0000": {
                        CBegin = instr;
                        do_ = true;
                        chunkHasCflow = true;
                        break;
                    }
                    case "IB_MAX_CFLOW_END\u0000": {
                        do_ = true;

                        let cBegin: number = c.InstructionMap.get(CBegin as Instruction) as number
                        let cEnd: number = c.InstructionMap.get(instr) as number

                        let nIns: Array<Instruction> = Array.from(c.Instructions).slice(cBegin, cEnd - cBegin)

                        cBegin = c.InstructionMap.get(CBegin as Instruction) as number
                        cEnd = c.InstructionMap.get(instr) as number
                        nIns = Array.from(c.Instructions).slice(cBegin, cEnd - cBegin)

                        console.log("TEST PRESERVE")
                        TestPreserve.DoInstructions(c, nIns)

                        cBegin = c.InstructionMap.get(CBegin as Instruction) as number
                        cEnd = c.InstructionMap.get(instr) as number
                        nIns = Array.from(c.Instructions).slice(cBegin, cEnd - cBegin)

                        console.log("BOUNCE")
                        Bounce.DoInstructions(c, nIns)

                        cBegin = c.InstructionMap.get(CBegin as Instruction) as number
                        cEnd = c.InstructionMap.get(instr) as number
                        nIns = Array.from(c.Instructions).slice(cBegin, cEnd - cBegin)

                        console.log("EQ MUTATE")
                        EqMutate.DoInstructions(c, nIns)

                        cBegin = c.InstructionMap.get(CBegin as Instruction) as number
                        cEnd = c.InstructionMap.get(instr) as number
                        nIns = Array.from(c.Instructions).slice(cBegin, cEnd - cBegin)

                        break;
                    }
                }

                if (do_) {
                    instr.OpCode = Opcode.Move
                    instr.A = 0
                    instr.B = 0

                    let Call: Instruction = Array.from(Instructs)[index + 1] as Instruction
                    Call.OpCode = Opcode.Move
                    Call.A = 0;
                    Call.B = 0;
                }
            }
        }

        TestFlip.DoInstructions(c, Array.from(c.Instructions))

        if (chunkHasCflow) {
            Array.from(c.Instructions)[0] = new Instruction(c, Opcode.NewStack);
        }

        for (let _c of c.Functions) {
            this.DoChunk(_c)
        }
    }

    public DoChunks(): void {
        new Inlining(this.lChunk).DoChunks()
        this.DoChunk(this.lChunk)
    }

    constructor(lChunk: Chunk) {
        this.lChunk = lChunk
    }
}