import { Opcode } from "../../Bytecode Lib/Bytecode/Opcode";
import Serializer from "../../Bytecode Lib/Bytecode/Serializer";
import type Chunk from "../../Bytecode Lib/IR/Chunk";
import type Instruction from "../../Bytecode Lib/IR/Instruction";
import CustomInstructionData from "../CustomInstructionData";
import { ChunkStep, type ObfuscationContext } from "../ObfuscationContext";
import type ObfuscationSettings from "../ObfuscationSettings";
import { OpMutated } from "../Opcodes/OpMutated";
import { OpSuperOperator } from "../Opcodes/OpSuperOperator";
import VOpcode from "../VOpcode";
import AllOpcodes from "./AllOpcodes";
import VMStrings from "./VMStrings";

function shuffle(array: any[]) {
    let currentIndex = array.length;

    // While there remain elements to shuffle...
    while (currentIndex != 0) {

        // Pick a remaining element...
        let randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        // And swap it with the current element.
        [array[currentIndex], array[randomIndex]] = [
            array[randomIndex], array[currentIndex]];
    }
}

const encode = (str: string) => {
    let newStr = ""

    for (let i = 0; i < str.length; i++) {
        newStr += "\\" + str.charCodeAt(i)
    }

    return newStr
}

function GetOutput(bytes: any) {
    let Out = []

    for (let arr of bytes) {
        for (let element of arr) {
            Out.push(element)
        }
    }
    // console.log(Out)

    return Out.map(v => String.fromCharCode(v)).join("");
}

export default class Generator {
    private Context: ObfuscationContext

    constructor(context: ObfuscationContext) {
        this.Context = context;
    }

    public IsUsed(chunk: Chunk, virt: VOpcode): boolean {
        let isUsed: any = false;

        for (let ins of chunk.Instructions) {
            if (virt.IsInstruction(ins)) {
                if (!this.Context.InstructionMapping.has(ins.OpCode)) {
                    Array.from(this.Context.InstructionMapping).push([ins.OpCode, virt]);
                }
                let cData = new CustomInstructionData()
                cData.Opcode = virt;
                ins.CustomData = cData;
                isUsed = true
            }
        }

        for (let sChunk of chunk.Functions) {
            isUsed |= this.IsUsed(sChunk, virt) as any // didnt check this, hope it works
        }

        return isUsed;
    }

    public GenerateMutations(opcodes: Set<VOpcode>): Set<OpMutated> {
        let mutated: Set<OpMutated> = new Set<OpMutated>();

        for (let opc of opcodes) {
            if (opc instanceof OpSuperOperator) continue;

            for (let i = 0; i < Math.floor(Math.random() + 36 * 50); i++) {
                let rand: number[] = [0, 1, 2]
                shuffle(rand)

                let mut: OpMutated = new OpMutated();

                mut.Registers = rand;
                mut.Mutated = opc;

                mutated.add(mut);
            }
        }

        // FUCK YOU TYPESCRIPT!
        let arrayVersion = Array.from(mutated)
        shuffle(arrayVersion)
        let out = new Set(arrayVersion)

        return out;
    }

    public FoldMutations(mutations: Set<OpMutated>, used: Set<OpMutated>, chunk: Chunk): void {
        let skip = new Array(chunk.Instructions.size + 1).fill(false)

        for (let i: number = 0; i < chunk.Instructions.size; i++) {
            let opc: Instruction = Array.from(chunk.Instructions)[i]

            switch (opc.OpCode) {
                case Opcode.Closure:
                    for (let j: number = 1; j <= (opc.RefOperands[0] as Chunk).UpvalueCount; j++) {
                        skip[i + j] = true;
                    }

                    break;
            }
        }

        for (let i: number = 0; i < chunk.Instructions.size; i++) {
            if (skip[i]) continue;

            let opc: Instruction = Array.from(chunk.Instructions)[i]
            let data: CustomInstructionData = opc.CustomData

            for (let mut of mutations) {
                if (data?.Opcode == mut.Mutated && data.WrittenOpcode == null) {
                    if (!used.has(mut)) {
                        used.add(mut);
                    }
                    break;
                }
            }
        }

        for (let _c of chunk.Functions) {
            this.FoldMutations(mutations, used, _c)
        }
    }

    public GenerateSuperOperators(chunk: Chunk, maxSize: number, minSize: number = 5): Set<OpSuperOperator> {
        let results: Set<OpSuperOperator> = new Set<OpSuperOperator>()
        let skip = new Array(chunk.Instructions.size + 1).fill(false)

        for (let i = 0; i < chunk.Instructions.size - 1; i++) {
            switch (Array.from(chunk.Instructions)[i].OpCode) {
                case Opcode.Closure:
                    skip[i] = true;
                    for (let j = 0; j < (Array.from(chunk.Instructions)[i].RefOperands[0] as Chunk).UpvalueCount; j++) {
                        skip[i + j + 1] = true;
                    }
                    break;
                case Opcode.Eq:
                case Opcode.Lt:
                case Opcode.Le:
                case Opcode.Test:
                case Opcode.TestSet:
                case Opcode.TForLoop:
                case Opcode.SetList:
                    skip[i + 1] = true;
                    break;
                case Opcode.LoadBool:
                    if (Array.from(chunk.Instructions)[i].C != 0) {
                        skip[i + 1] = true;
                        break;
                    }
                    continue;
                case Opcode.ForLoop:
                case Opcode.ForPrep:
                case Opcode.Jmp:
                    Array.from(chunk.Instructions)[i].UpdateRegisters()

                    skip[i + 1] = true;
                    skip[i + (Array.from(chunk.Instructions)[i].B as number) + 1] = true;
                    break;
            }
            // Please close your eyes when reading this part
            // console.log(Array.from(chunk.Instructions)[i])
            if (Array.from(chunk.Instructions)[i].CustomData.WrittenOpcode instanceof OpSuperOperator && (Array.from(chunk.Instructions)[i].CustomData.WrittenOpcode as OpSuperOperator).SubOpcodes != null) { // oh lord.
                for (let j = 0; j < (Array.from(chunk.Instructions)[i].CustomData.WrittenOpcode as OpSuperOperator).SubOpcodes.length; j++) {
                    skip[i + j] = true;
                }
            }
        }

        let c = 0
        while (c < chunk.Instructions.size) {
            let targetCount: number = maxSize;
            let superOperator: OpSuperOperator = new OpSuperOperator()
            superOperator.SubOpcodes = new Array(targetCount)

            let d: boolean = true;
            let cutoff: number = targetCount

            for (let j = 0; j < targetCount; j++) {
                if (c + j > chunk.Instructions.size - 1 || skip[c + j]) {
                    cutoff = j;
                    d = false;
                    break;
                }
            }

            if (!d) {
                if (cutoff < minSize) {
                    c += cutoff + 1
                    continue;
                }

                targetCount = cutoff
                superOperator = new OpSuperOperator()
                superOperator.SubOpcodes = new Array(targetCount)
            }

            for (let j = 0; j < targetCount; j++) {
                superOperator.SubOpcodes[j] = Array.from(chunk.Instructions)[c + j].CustomData.Opcode;
            }

            results.add(superOperator)
            c += targetCount + 1;
        }

        for (let _c of chunk.Functions) {
            const operators = this.GenerateSuperOperators(_c, maxSize);
            operators.forEach(op => results.add(op));
        }

        return results;
    }

    public FoldAdditionalSuperOperators(chunk: Chunk, operators: Set<OpSuperOperator>, folded: number): void {
        let skip: boolean[] = new Array(chunk.Instructions.size + 1).fill(false);
        for (let i = 0; i < chunk.Instructions.size - 1; i++) {
            switch (Array.from(chunk.Instructions)[i].OpCode) {
                case Opcode.Closure:
                    skip[i] = true;
                    for (let j = 0; j < (Array.from(chunk.Instructions)[i].RefOperands[0] as Chunk).UpvalueCount; j++) {
                        skip[i + j + 1] = true;
                    }
                    break;
                case Opcode.Eq:
                case Opcode.Lt:
                case Opcode.Le:
                case Opcode.Test:
                case Opcode.TestSet:
                case Opcode.TForLoop:
                case Opcode.SetList:
                    skip[i + 1] = true;
                    break;
                case Opcode.LoadBool:
                    if (Array.from(chunk.Instructions)[i].C != 0) {
                        skip[i + 1] = true;
                        break;
                    }
                    continue;
                case Opcode.ForLoop:
                case Opcode.ForPrep:
                case Opcode.Jmp:
                    Array.from(chunk.Instructions)[i].UpdateRegisters();
                    skip[i + 1] = true;
                    skip[i + (Array.from(chunk.Instructions)[i].B as number) + 1] = true;
                    break;
            }

            if (Array.from(chunk.Instructions)[i].CustomData.WrittenOpcode instanceof OpSuperOperator && (Array.from(chunk.Instructions)[i].CustomData.WrittenOpcode as OpSuperOperator).SubOpcodes != null) { // oh lord.
                for (let j = 0; j < (Array.from(chunk.Instructions)[i].CustomData.WrittenOpcode as OpSuperOperator).SubOpcodes.length; j++) {
                    skip[i + j] = true;
                }
            }
        }

        let c = 0
        while (c < chunk.Instructions.size) {
            if (skip[c]) {
                c++
                continue;
            }

            let used: boolean = false;

            for (let op of operators) {
                let targetCount: number = op.SubOpcodes.length;
                let cu: boolean = true;

                for (let j = 0; j < targetCount; j++) {
                    if (c + j > chunk.Instructions.size - 1 || skip[c + j]) {
                        cu = false;
                        break;
                    }
                }

                if (!cu) {
                    continue
                }

                let taken = new Set(Array.from(chunk.Instructions).slice(c, c + targetCount))
                if (op.IsInstructions(taken)) {
                    for (let j = 0; j < targetCount; j++) {
                        skip[c + j] = true;
                        Array.from(chunk.Instructions)[c + j].CustomData.WrittenOpcode = new OpSuperOperator()
                        Array.from(chunk.Instructions)[c + j].CustomData.WrittenOpcode.VIndex = 0;
                    }

                    Array.from(chunk.Instructions)[c].CustomData.WrittenOpcode = op;

                    used = true;
                    break;
                }
            }

            if (!used) {
                c++
            } else {
                folded++
            }
        }

        for (var _c of chunk.Functions) {
            this.FoldAdditionalSuperOperators(_c, operators, folded)
        }
    }

    public GenerateVM(settings: ObfuscationSettings): string {
        let virtuals = AllOpcodes.filter(t => this.IsUsed(this.Context.HeadChunk, t))

        if (settings.Mutate) {
            let muts: Set<OpMutated> = this.GenerateMutations(new Set(virtuals))

            let used: Set<OpMutated> = new Set<OpMutated>()
            this.FoldMutations(muts, used, this.Context.HeadChunk)

            virtuals.push(...used)
        }

        if (settings.SuperOperators) {
            let folded: number = 0
            var megaOperators = Array.from(this.GenerateSuperOperators(this.Context.HeadChunk, 500, 1))
            virtuals.push(...megaOperators)
            this.FoldAdditionalSuperOperators(this.Context.HeadChunk, new Set(megaOperators), folded)

            var miniOperators = Array.from(this.GenerateSuperOperators(this.Context.HeadChunk, 250,1))
            virtuals.push(...miniOperators)
            this.FoldAdditionalSuperOperators(this.Context.HeadChunk, new Set(miniOperators), folded)
        }

        shuffle(virtuals)

        for (let i = 0; i < virtuals.length; i++) {
            virtuals[i].VIndex = i
        }

        let VM: string = ""
        let s: Serializer = new Serializer(this.Context, settings);
        s.SerializeLChunk(this.Context.HeadChunk)
        let bs = s.GetProcessed()

        VM += `
local Byte         = string.byte;
local Char         = string.char;
local Sub          = string.sub;
local Concat       = table.concat;
local Insert       = table.insert;
local LDExp        = math.ldexp;
local GetFEnv      = getfenv or function() return _ENV end;
local Setmetatable = setmetatable;
local Select       = select;

local Unpack = unpack or table.unpack;
local ToNumber = tonumber;
local ByteString = '${encode(GetOutput(bs))}';`

        VM += VMStrings.VMP1
            .replaceAll("CONST_BOOL", this.Context.ConstantMapping[1].toString())
            .replaceAll("CONST_FLOAT", this.Context.ConstantMapping[2].toString())
            .replaceAll("CONST_STRING", this.Context.ConstantMapping[3].toString());

        for (let i = 0; i < ChunkStep.StepCount; i++) {
            switch (this.Context.ChunkSteps[i]) {
                case ChunkStep.ParameterCount:
                    VM += "Chunk[3] = gBits8();";
                    break;
                case ChunkStep.Instructions:
                    VM += `for Idx=1,gBits32() do 
									local Descriptor = gBits8();
									if (gBit(Descriptor, 1, 1) == 0) then
										local Type = gBit(Descriptor, 2, 3);
										local Mask = gBit(Descriptor, 4, 6);
										
										local Inst=
										{
											gBits16(),
											gBits16(),
											nil,
											nil
										};
	
										if (Type == 0) then 
											Inst[OP_B] = gBits16(); 
											Inst[OP_C] = gBits16();
										elseif(Type==1) then 
											Inst[OP_B] = gBits32();
										elseif(Type==2) then 
											Inst[OP_B] = gBits32() - (2 ^ 16)
										elseif(Type==3) then 
											Inst[OP_B] = gBits32() - (2 ^ 16)
											Inst[OP_C] = gBits16();
										end;
	
										if (gBit(Mask, 1, 1) == 1) then Inst[OP_A] = Consts[Inst[OP_A]] end
										if (gBit(Mask, 2, 2) == 1) then Inst[OP_B] = Consts[Inst[OP_B]] end
										if (gBit(Mask, 3, 3) == 1) then Inst[OP_C] = Consts[Inst[OP_C]] end
										
										Instrs[Idx] = Inst;
									end
								end;`

                    break;
                case ChunkStep.Functions:
                    VM += "for Idx=1,gBits32() do Functions[Idx-1]=Deserialize();end;";
                    break;
            }
        }

        VM += "return Chunk;end;";
        VM += VMStrings.VMP2;

        let _context = this.Context;
        function GetStr(opcodes: Array<number>): string {
            let str: string = ""
            if (opcodes.length == 1) {
                str += `${virtuals[opcodes[0]].GetObfuscated(_context)}`
            } else if (opcodes.length == 2) {
                if (Math.random() < 0.5) {
                    str += `if Enum > ${virtuals[opcodes[0]].VIndex} then ${virtuals[opcodes[1]].GetObfuscated(_context)}`
                    str += `else ${virtuals[opcodes[0]].GetObfuscated(_context)}`
                    str += "end;"
                } else {
                    str += `if Enum == ${virtuals[opcodes[0]].VIndex} then ${virtuals[opcodes[0]].GetObfuscated(_context)}`
                    str += `else ${virtuals[opcodes[1]].GetObfuscated(_context)}`
                    str += "end;"
                }
            } else {
                let ordered = [...opcodes].sort((a, b) => a - b);
                let half = Math.floor(ordered.length / 2)
                var sorted = [ordered.slice(0, half), ordered.slice(half)];

                str += `if Enum <= ${sorted[0][sorted[0].length - 1]} then `;
                str += GetStr(sorted[0])
                str += ` else `
                str += GetStr(sorted[1])
                str += " end; "
            }

            return str;
        }
        VM += GetStr(Array.from({ length: virtuals.length }, (_, i) => i))
        // for (let ins of virtuals) {
        //     VM += "if (Enum == " + ins.VIndex + ") then\n"
        //     VM += ins.GetObfuscated(this.Context)
        //     VM += "\nend;\n"
        // }

        VM += VMStrings.VMP3

        VM = VM.replaceAll("OP_ENUM", "1")
            .replaceAll("OP_A", "2")
            .replaceAll("OP_B", "3")
            .replaceAll("OP_C", "4");

        return VM;
    }
}