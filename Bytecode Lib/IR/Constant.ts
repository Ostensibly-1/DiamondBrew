import Instruction from "./Instruction.ts"
import { ConstantType } from "./Enums.ts"

export default class Constant {
    public BackReferences: Set<Instruction> = new Set<Instruction>()

    public Type: ConstantType | undefined;
    public Data: any;

    constructor() {}

    Constant(other: Constant) {
        this.Type = other.Type;
        this.Data = other.Data;
        this.BackReferences = other.BackReferences;

        return this
    }
}