import type Instruction from "../Bytecode Lib/IR/Instruction";
import type { ObfuscationContext } from "./ObfuscationContext";

export default abstract class VOpcode {
    public VIndex!: number;

    public abstract IsInstruction(instruction: Instruction): boolean;
    public abstract GetObfuscated(context: ObfuscationContext): string;
    public Mutate(instruction: Instruction) { }
}