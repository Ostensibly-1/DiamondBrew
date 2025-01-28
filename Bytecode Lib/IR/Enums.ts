export enum ConstantType {
    Nil,
    Boolean,
    Number,
    String
}

export enum InstructionType {
    ABC,
    ABx,
    AsBx,
    AsBxC,
    Data
}

export enum InstructionConstantMask {
    NK = 0,
    RA = 1,
    RB = 2,
    RC = 4
}