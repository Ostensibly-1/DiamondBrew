import type Instruction from "../../Bytecode Lib/IR/Instruction";
import type { ObfuscationContext } from "../ObfuscationContext";
import VOpcode from "../VOpcode";

export class OpMutated extends VOpcode {
    public Mutated!: VOpcode;
    public Registers!: number[];

    public static RegisterReplacements: string[] = ["OP__A", "OP__B", "OP__C"];

    public override IsInstruction(instruction: Instruction): boolean {
        return false
    }

    public CheckInstruction(): boolean {
        return Math.floor(Math.random() * 15) == 1;
    }

    public override GetObfuscated(context: ObfuscationContext): string {
        return this.Mutated.GetObfuscated(context);
    }

    public override Mutate(instruction: Instruction): void {
        this.Mutated.Mutate(instruction)
    }
}