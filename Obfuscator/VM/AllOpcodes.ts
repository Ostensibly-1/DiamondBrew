// Arithmetic Operators

import { OpAdd, OpAddB, OpAddC, OpAddBC } from "../Opcodes/OpAdd"
import { OpSub, OpSubB, OpSubC, OpSubBC } from "../Opcodes/OpSub"
import { OpMul, OpMulB, OpMulC, OpMulBC } from "../Opcodes/OpMul"
import { OpDiv, OpDivB, OpDivC, OpDivBC } from "../Opcodes/OpDiv"
import { OpPow, OpPowB, OpPowC, OpPowBC } from "../Opcodes/OpPow"
import { OpMod, OpModB, OpModC, OpModBC } from "../Opcodes/OpMod"

import { OpCall, OpCallB0, OpCallB0C0, OpCallB0C1, OpCallB1, OpCallB1C0, OpCallB1C1, OpCallB1C2, OpCallB2, OpCallC0, OpCallC0B2, OpCallC1, OpCallC1B2, OpCallC2, OpCallC2B2, OpCallB0C2 } from "../Opcodes/OpCall"
import { OpClosure, OpClosureNU } from "../Opcodes/OpClosure"
import { OpClose } from "../Opcodes/OpClose"
import { OpReturn, OpReturnB0, OpReturnB1, OpReturnB2, OpReturnB3 } from "../Opcodes/OpReturn"
import { OpTailCall, OpTailCallB0, OpTailCallB1 } from "../Opcodes/OpTailCall"

import { OpConcat } from "../Opcodes/OpConcat"
import { OpJmp } from "../Opcodes/OpJmp"
import { OpSetList, OpSetListB0, OpSetListC0 } from "../Opcodes/OpSetList"
import { OpVarArg, OpVarArgB0 } from "../Opcodes/OpVarArg"
import { OpSelf, OpSelfC } from "../Opcodes/OpSelf"
import { OpNewTable } from "../Opcodes/OpNewTable"

import { OpEq, OpEqB, OpEqBC, OpEqC } from "../Opcodes/OpEq"
import { OpNe, OpNeB, OpNeBC, OpNeC } from "../Opcodes/OpNe"
import { OpLt, OpLtB, OpLtBC, OpLtC } from "../Opcodes/OpLt"
import { OpLe, OpLeB, OpLeBC, OpLeC } from "../Opcodes/OpLe"
import { OpGe, OpGeB, OpGeBC, OpGeC } from "../Opcodes/OpGe"
import { OpGt, OpGtB, OpGtBC, OpGtC } from "../Opcodes/OpGt"

import { OpForLoop } from "../Opcodes/OpForLoop"
import { OpForPrep } from "../Opcodes/OpForPrep"
import { OpTForLoop } from "../Opcodes/OpTForLoop"

import { OpGetGlobal } from "../Opcodes/OpGetGlobal"
import { OpGetTable, OpGetTableConst } from "../Opcodes/OpGetTable"
import { OpGetUpval } from "../Opcodes/OpGetUpval"

import { OpSetGlobal } from "../Opcodes/OpSetGlobal"
import { OpSetTable, OpSetTableB, OpSetTableBC, OpSetTableC } from "../Opcodes/OpSetTable"
import { OpSetUpval } from "../Opcodes/OpSetUpval"

import { OpLen } from "../Opcodes/OpLen"
import { OpNot } from "../Opcodes/OpNot"
import { OpUnm } from "../Opcodes/OpUnm"

import { OpLoadK } from "../Opcodes/OpLoadK"
import { OpLoadBool, OpLoadBoolC } from "../Opcodes/OpLoadBool"
import { OpLoadNil } from "../Opcodes/OpLoadNil"
import { OpMove } from "../Opcodes/OpMove"

import { OpTest, OpTestC } from "../Opcodes/OpTest"
import { OpTestSet, OpTestSetC } from "../Opcodes/OpTestSet"

import { OpPushStk } from "../Opcodes/OpPushStk"
import { OpSetTop } from "../Opcodes/OpSetTop"
import { OpSetFEnv } from "../Opcodes/OpSetFEnv"
import { OpNewStk } from "../Opcodes/OpNewStk"

import { OpSuperOperator } from "../Opcodes/OpSuperOperator"
import { OpMutated } from "../Opcodes/OpMutated"

let AllOpcodes = [
    // Arithmetic operations
    new OpAdd(), new OpAddB(), new OpAddC(), new OpAddBC(),
    new OpSub(), new OpSubB(), new OpSubC(), new OpSubBC(),
    new OpMul(), new OpMulB(), new OpMulC(), new OpMulBC(),
    new OpDiv(), new OpDivB(), new OpDivC(), new OpDivBC(),
    new OpMod(), new OpModB(), new OpModC(), new OpModBC(),
    new OpPow(), new OpPowB(), new OpPowC(), new OpPowBC(),

    // Comparison operations
    new OpEq(), new OpEqB(), new OpEqC(), new OpEqBC(),
    new OpLt(), new OpLtB(), new OpLtC(), new OpLtBC(),
    new OpLe(), new OpLeB(), new OpLeC(), new OpLeBC(),

    // Opposite Comparison operations
    new OpNe(), new OpNeB(), new OpNeC(), new OpNeBC(),
    new OpGt(), new OpGtB(), new OpGtC(), new OpGtBC(),
    new OpGe(), new OpGeB(), new OpGeC(), new OpGeBC(),

    // Function operations
    new OpCall(), new OpCallB2(), new OpCallB0(), new OpCallB1(),
    new OpCallC0(), new OpCallC0B2(), new OpCallC1(), new OpCallC1B2(),
    new OpCallB0C0(), new OpCallB0C1(), new OpCallB1C0(), new OpCallB1C1(),
    new OpCallC2(), new OpCallC2B2(), new OpCallB0C2(), new OpCallB1C2(),
    new OpReturn(), new OpReturnB2(), new OpReturnB3(), new OpReturnB0(), new OpReturnB1(),
    new OpTailCall(), new OpTailCallB0(), new OpTailCallB1(),

    // Table operations
    new OpSetList(), new OpSetListB0(), new OpSetListC0(),
    new OpSetTable(), new OpSetTableB(), new OpSetTableC(), new OpSetTableBC(),
    new OpGetTable(), new OpGetTableConst(),
    new OpNewTable(),
    new OpSetUpval(), new OpGetUpval(),
    new OpSetGlobal(), new OpGetGlobal(),
    new OpSelf(), new OpSelfC(),

    // Control flow
    new OpTest(), new OpTestC(),
    new OpTestSet(), new OpTestSetC(),
    new OpJmp(),
    new OpForPrep(), new OpForLoop(),
    new OpTForLoop(),

    // Data operations
    new OpMove(),
    new OpLoadK(),
    new OpLoadBool(), new OpLoadBoolC(),
    new OpLoadNil(),

    // Special operations
    new OpClosure(), new OpClosureNU(),
    new OpConcat(),
    new OpLen(),
    new OpUnm(),
    new OpNot(),
    new OpClose(),
    new OpVarArg(), new OpVarArgB0(),

    // Meta operations
    new OpMutated(),
    new OpSuperOperator(),

    // Custom Opcodes
    new OpPushStk(),
    new OpSetFEnv(),
    new OpSetTop(),
    new OpNewStk()
]
export default AllOpcodes