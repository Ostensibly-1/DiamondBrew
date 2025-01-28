import type Instruction from "../../Bytecode Lib/IR/Instruction";
import type { ObfuscationContext } from "../ObfuscationContext";
import VOpcode from "../VOpcode";
import { OpMutated } from "./OpMutated";

export class OpSuperOperator extends VOpcode {
    public SubOpcodes!: VOpcode[]

    public override IsInstruction(instruction: Instruction): boolean {
        return false;
    }

    public IsInstructions(instructions: Set<Instruction>): boolean {
        if (instructions.size != this.SubOpcodes.length) return false;

        for (let i: number = 0; i < this.SubOpcodes.length; i++) {
            if (this.SubOpcodes[i] instanceof OpMutated) {
                const mut = this.SubOpcodes[i] as OpMutated
                if (!mut.Mutated.IsInstruction(Array.from(instructions)[i])) return false;
            } else if (!this.SubOpcodes[i]?.IsInstruction(Array.from(instructions)[i])) return false;
        }

        return true;
    }

    public override GetObfuscated(context: ObfuscationContext): string {
        let s: string = ""
        let locals: Set<string> = new Set<string>();

        for (var index = 0; index < this.SubOpcodes.length; index++) {
            var subOpcode = this.SubOpcodes[index]
            let s2: string = subOpcode.GetObfuscated(context)

            let reg: RegExp = new RegExp("local(.*?)[;=]");
            
            reg.exec(s2)?.forEach(m => {
                let loc: string = m[1].replaceAll(/\s/g, '')
                if (!Array.from(locals).includes(loc)) locals.add(loc);
                if (!m[0].includes(';')) {
                    s2 = s2.replaceAll(new RegExp(`local${m[1]}`, 'g'), loc)
                } else {
                    s2 = s2.replaceAll(new RegExp(`local${m[1]}`, 'g'), '')
                }
            });

            s += s2;

            if (index + 1 < this.SubOpcodes.length) {
                s += "InstrPoint = InstrPoint + 1;Inst = Instr[InstrPoint];";
            }
        }

        locals.forEach(l => {
            s = "local " + l + ";" + s;
        });

        return s;
    }
}