import type Chunk from "../Bytecode Lib/IR/Chunk";
import { Opcode } from "../Bytecode Lib/Bytecode/Opcode"
import VOpcode from "./VOpcode"

export enum ChunkStep {
    ParameterCount,
    StringTable,
    Instructions,
    Functions,
    LineInfo,
    StepCount
}

export enum InstructionStep1 {
    Type,
    A,
    B,
    C,
    StepCount
}

export enum InstructionStep2 {
    Op,
    Bx,
    D,
    StepCount
}

export class ObfuscationContext {
    public HeadChunk: Chunk;
    public ChunkSteps: ChunkStep[];
    public InstructionSteps1: InstructionStep1[];
    public InstructionSteps2: InstructionStep2[];
    public ConstantMapping: number[];

    public InstructionMapping: Map<Opcode, VOpcode> = new Map<Opcode, VOpcode>()

    constructor(chunk: Chunk) {
        this.HeadChunk = chunk;
        this.ChunkSteps = this.CreateShuffleArray(ChunkStep.StepCount)
        this.InstructionSteps1 = this.CreateShuffleArray(InstructionStep1.StepCount)
        this.InstructionSteps2 = this.CreateShuffleArray(InstructionStep2.StepCount)
        this.ConstantMapping = this.ShuffleArray([0, 1, 2, 3])
    }

    public CreateShuffleArray(length: number) {
        return this.ShuffleArray(Array.from({ length }, (_, i) => i));
    }

    public ShuffleArray(array: any[]) { // Fisher-Yates!
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
}