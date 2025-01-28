import { Opcode } from "../../../Bytecode Lib/Bytecode/Opcode";
import type Chunk from "../../../Bytecode Lib/IR/Chunk";
import Constant from "../../../Bytecode Lib/IR/Constant";
import Instruction from "../../../Bytecode Lib/IR/Instruction";

export default class Inlining {
    private _head: Chunk;

    constructor(chunk: Chunk) {
        this._head = chunk;
    }

    public ShouldInLine(target: Chunk, inlined: Chunk, calls: Array<Instruction>, closures: Array<Instruction>, inlineAll: boolean): boolean {
        calls = new Array<Instruction>();
        closures = new Array<Instruction>();
        inlineAll = false;

        if (inlined.Instructions.size < 3) return false;
        if (Array.from(inlined.Instructions)[0].OpCode != Opcode.GetGlobal || Array.from(inlined.Instructions)[1].OpCode != Opcode.LoadBool || Array.from(inlined.Instructions)[0].OpCode != Opcode.Call) return false;
        if ((Array.from(inlined.Instructions)[0].RefOperands[0] as Constant).Data.toString() != "IB_INLINING_START") return false;

        inlineAll = Array.from(inlined.Instructions)[1].B == 1;

        Array.from(inlined.Instructions)[0].OpCode = Opcode.Move;
        Array.from(inlined.Instructions)[0].A = 0;
        Array.from(inlined.Instructions)[0].B = 0;

        Array.from(inlined.Instructions)[1].OpCode = Opcode.Move;
        Array.from(inlined.Instructions)[1].A = 0;
        Array.from(inlined.Instructions)[1].B = 0;

        Array.from(inlined.Instructions)[2].OpCode = Opcode.Move;
        Array.from(inlined.Instructions)[2].A = 0;
        Array.from(inlined.Instructions)[2].B = 0;

        const bruh = Array.from(inlined.Constants).indexOf(Array.from(inlined.Instructions)[0].RefOperands[0] as Constant);
        if (bruh > -1) {
            Array.from(inlined.Constants).splice(bruh, 1)
        }

        if (target.StackSize + inlined.StackSize + 1 > 255) return false;
        if (Array.from(inlined.Instructions).some(i =>
            i.OpCode == Opcode.GetUpval ||
            i.OpCode == Opcode.SetUpval
        )) {
            return false;
        }

        let registers: boolean[] = new Array(256)
        let res = false;

        for (var i = 0; i < target.Instructions.size; i++) {
            var instr = Array.from(target.Instructions)[i];
            switch (instr.OpCode) {
                case Opcode.Move:
                    registers[instr.A] = registers[instr.B];
                    break;
                case Opcode.LoadNil:
                case Opcode.Unm:
                case Opcode.Not:
                case Opcode.Len:
                case Opcode.TestSet:
                    registers[instr.A] = false;
                    registers[instr.B] = false;
                    break;
                case Opcode.LoadConst:
                case Opcode.LoadBool:
                case Opcode.GetGlobal:
                case Opcode.SetGlobal:
                case Opcode.Return:
                case Opcode.VarArg:
                case Opcode.Test:
                case Opcode.ForPrep:
                case Opcode.ForLoop:
                case Opcode.TForLoop:
                case Opcode.NewTable:
                case Opcode.SetList:
                case Opcode.Close:
                case Opcode.GetTable:
                case Opcode.SetTable:
                case Opcode.Add:
                case Opcode.Sub:
                case Opcode.Mul:
                case Opcode.Div:
                case Opcode.Mod:
                case Opcode.Pow:
                case Opcode.Concat:
                case Opcode.Self:
                    registers[instr.A] = false;
                    break;
                case Opcode.Closure:
                    if (instr.RefOperands[0] == inlined) {
                        closures.push(instr);
                        registers[instr.A] = true;
                    }
                    break;
                case Opcode.Call:
                case Opcode.TailCall:
                    let limit = instr.A + instr.C - 1;

                    if (instr.C == 0) limit = target.StackSize;

                    if (registers[instr.A]) {
                        calls.push(instr)
                        res = true;
                    }

                    for (let c = instr.A; c <= limit; c++) {
                        registers[c] = false;
                    }

                    break;
            }
        }

        return res;
    }

    public DoChunk(chunk: Chunk): void {
        for (let sub of chunk.Functions) {
            this.DoChunk(sub)
            var locations: Array<Instruction> = new Array<Instruction>();
            var closures: Array<Instruction> = new Array<Instruction>();
            var inlineAll: boolean = false;
            if (this.ShouldInLine(chunk, sub, locations, closures, inlineAll)) {
                if (inlineAll) {
                    const bruh = Array.from(chunk.Functions).indexOf(sub)
                    if (bruh > -1) {
                        Array.from(chunk.Functions).splice(bruh, 1)
                    }
                }

                for (var loc of locations) {
                    let target = loc.A + loc.B + 1;
                    if (loc.B == 0) target = chunk.StackSize + 1;

                    sub.Rebase(target, target);

                    let modified = new Array<Instruction>();

                    let idx = Array.from(chunk.Instructions).indexOf(loc)
                    if (idx > -1) {
                        Array.from(chunk.Functions).splice(idx, 1)
                    }

                    for (var bRef of loc.BackReferences) {
                        bRef.SetupRefs()
                    }

                    chunk.UpdateMappings()

                    let next = Array.from(chunk.Instructions)[idx]

                    let lim = sub.ParameterCount - 1;
                    if (loc.B == 0) lim = chunk.StackSize - loc.A;

                    for (let i = 0; i <= lim; i++) {
                        let nInstr = new Instruction(chunk, Opcode.Move)
                        nInstr.A = target + i;
                        nInstr.B = loc.A + i + 1;
                        Array.from(chunk.Instructions)[idx++] = nInstr
                    }

                    let map: Map<Instruction, Instruction> = new Map<Instruction, Instruction>();

                    let done: boolean = false;
                    for (var i = 0; i < sub.Instructions.size; i++) {
                        var _instr = new Instruction(chunk, Opcode.Move)
                        var instr = _instr.Instruction(Array.from(sub.Instructions)[i])
                        instr.Chunk = chunk;

                        map.set(Array.from(sub.Instructions)[i], instr)
                        switch (instr.OpCode) {
                            case Opcode.Return:
                                {
                                    let callLimit = loc.C - 1;

                                    if (callLimit == -1) callLimit = instr.B - 2;

                                    if (callLimit <= -1) callLimit = sub.StackSize;

                                    let t = new Array<Instruction>();

                                    for (let j = 0; j <= callLimit; j++) {
                                        const skibidi = new Instruction(chunk, Opcode.Move)
                                        skibidi.A = loc.A + j;
                                        skibidi.B = instr.A + j;
                                        t.push(skibidi)
                                    }

                                    let setTop = new Instruction(chunk, Opcode.SetTop)
                                    setTop.A = loc.A + callLimit;

                                    t.push(setTop)
                                    t.push(new Instruction(chunk, Opcode.Jmp, next))

                                    map.set(Array.from(sub.Instructions)[i], t[0])
                                    modified.push(...t)
                                    done = true;
                                    break;
                                }
                            case Opcode.TailCall:
                                {
                                    let callLimit = loc.C - 1;

                                    if (callLimit == -1) callLimit = instr.B - 2;

                                    if (callLimit <= -1) callLimit = sub.StackSize;

                                    let t = new Array<Instruction>();

                                    for (let j = 0; j <= callLimit; j++) {
                                        const skibidi = new Instruction(chunk, Opcode.Move)
                                        skibidi.A = loc.A + j;
                                        skibidi.B = instr.A + j;
                                        t.push(skibidi)
                                    }

                                    instr.OpCode = Opcode.Call;
                                    instr.A = loc.A;

                                    t.push(instr)
                                    t.push(new Instruction(chunk, Opcode.Jmp, next))

                                    map.set(Array.from(sub.Instructions)[i], t[0])
                                    modified.push(...t)
                                    done = true;
                                    break;
                                }
                            default:
                                modified.push(instr)
                                break;
                        }

                        if (done)
                            break;
                    }

                    const temp = Array.from(chunk.Instructions)
                    temp.splice(idx, 0, ...modified)
                    chunk.Instructions = new Set(temp) // didnt test this, hope it works fr, KYS TYPESCRIPT!

                    for (let k of map.keys()) {
                        map.get(k)?.BackReferences.clear()
                        for (let i = 0; i < k.BackReferences.size; i++) {
                            map.get(k)?.BackReferences.add(map.get(Array.from(k.BackReferences)[i]) as Instruction)
                        }

                        if (k.RefOperands[0] instanceof Instruction) {
                            let i2 = k.RefOperands[0]
                            map.get(k)!.RefOperands[0] = map.get(i2)
                        }
                    }
                }

                chunk.UpdateMappings()

                for (let clos of closures) {
                    const index = Array.from(chunk.Instructions).indexOf(clos)
                    if (index > -1) {
                        const upvalueCount = (clos.RefOperands[0] as Chunk).UpvalueCount;
                        Array.from(chunk.Instructions).splice(index, upvalueCount + 1)
                    }
                    for (const bRef of clos.BackReferences) {
                        bRef.SetupRefs()
                    }
                }

                for (let c of sub.Constants) {
                    var nc = Array.from(sub.Constants).find(c2 => c2.Type == c.Type && c2.Data == c.Data);
                    if (!nc) {
                        nc = new Constant().Constant(c)
                        chunk.Constants.add(nc)
                    }

                    for (var inst of chunk.Instructions) {
                        if (inst.RefOperands[0] instanceof Constant && c == inst.RefOperands[0]) {
                            inst.RefOperands[0] = nc;
                        }

                        if (inst.RefOperands[1] instanceof Constant && c == inst.RefOperands[1]) {
                            inst.RefOperands[1] = nc;
                        }
                    }
                }

                for (let c of sub.Functions) {
                    chunk.Functions.add(c);
                }

                chunk.UpdateMappings()

                for (var _ins of chunk.Instructions) {
                    _ins.UpdateRegisters()
                }
            }
        }
    }

    public DoChunks(): void {
        this.DoChunk(this._head)
    }
}