import type VOpcode from "./VOpcode";

export default class CustomInstructionData {
    public Opcode!: VOpcode;
    public WrittenOpcode!: VOpcode;
}