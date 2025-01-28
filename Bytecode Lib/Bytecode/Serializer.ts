import { ChunkStep, type ObfuscationContext } from "../../Obfuscator/ObfuscationContext";
import type ObfuscationSettings from "../../Obfuscator/ObfuscationSettings";
import type Chunk from "../IR/Chunk";
import { ConstantType, InstructionType } from "../IR/Enums";
import type Instruction from "../IR/Instruction";
import Encoder from "./Encoder";

export default class Serializer {
    private Context: ObfuscationContext;
    private Settings: ObfuscationSettings;
    public Stream: Encoder;

    constructor(Context: ObfuscationContext, Settings: ObfuscationSettings) {
        this.Context = Context;
        this.Settings = Settings;
        this.Stream = new Encoder(Context.HeadChunk)
    }

    public SerializeLChunk(chunk: Chunk) {
        let Stream = this.Stream
        function SerializeInstruction(inst: Instruction) {
            if (inst.InstructionType == InstructionType.Data) {
                Stream.WriteByte(1)
                return;
            }

            inst.UpdateRegisters();

            var cData = inst.CustomData
            let opCode: number = inst.OpCode as number;

            if (cData !== undefined) {
                var virtualOpcode = cData.Opcode;

                opCode = cData.WrittenOpcode?.VIndex as number ?? virtualOpcode.VIndex as number;

                virtualOpcode?.Mutate(inst)
            }

            let t: number = inst.InstructionType as number;
            let m: number = inst.ConstantMask as number;

            Stream.WriteByte((t << 1) | (m << 3))
            Stream.WriteInt16(opCode)
            Stream.WriteInt16(inst.A as number)

            let b: number = inst.B as number;
            let c: number = inst.C as number;

            switch (inst.InstructionType) {
                case InstructionType.AsBx:
                    b += 1 << 16
                    Stream.WriteInt32(b)
                    break;
                case InstructionType.AsBxC:
                    b += 1 << 16
                    Stream.WriteInt32(b)
                    Stream.WriteInt16(c)
                    break;
                case InstructionType.ABC:
                    Stream.WriteInt16(b)
                    Stream.WriteInt16(c)
                    break;
                case InstructionType.ABx:
                    Stream.WriteInt32(b)
                    break;
            }
        }

        chunk.UpdateMappings();

        this.Stream.WriteInt32(chunk.Constants.size)
        for (let c of chunk.Constants) {
            this.Stream.WriteByte(this.Context.ConstantMapping[c.Type as number])
            switch (c.Type) {
                case ConstantType.Boolean:
                    this.Stream.WriteBool(c.Data)
                    break;
                case ConstantType.Number:
                    this.Stream.WriteDouble(c.Data)
                    break;
                case ConstantType.String:
                    this.Stream.WriteString(c.Data)
                    break;
            }
        }

        for (let i: number = 0; i < ChunkStep.StepCount; i++) {
            switch (this.Context.ChunkSteps[i]) {
                case ChunkStep.ParameterCount:
                    this.Stream.WriteByte(chunk.ParameterCount)
                    break;
                case ChunkStep.Instructions:
                    this.Stream.WriteInt32(chunk.Instructions.size)

                    for (let ins of chunk.Instructions) {
                        SerializeInstruction(ins)
                    }

                    break;
                case ChunkStep.Functions:
                    this.Stream.WriteInt32(chunk.Functions.size)

                    for (let c of chunk.Functions) {
                        this.SerializeLChunk(c)
                    }

                    break;
            }
        }
    }

    public GetProcessed() {
        return this.Stream.Bytes
    }
}