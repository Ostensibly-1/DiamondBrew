import type Chunk from "../../../Bytecode Lib/IR/Chunk";
import Instruction from "../../../Bytecode Lib/IR/Instruction";

export default class Block {
    public Chunk: Chunk
    public Body: Array<Instruction> = new Array<Instruction>();
    public Successor!: Block;

    constructor(c: Chunk) {
        this.Chunk = c;
    }
}