import { readFileSync, writeFileSync } from "fs"
import { spawnSync } from "child_process"

import Deserializer from "./Bytecode Lib/Bytecode/Deserializer"
import { ObfuscationContext } from "./Obfuscator/ObfuscationContext"
import ObfuscationSettings from "./Obfuscator/ObfuscationSettings"
import Generator from "./Obfuscator/VM/Generator"
import { Beautify, Minify } from "./luamin/index"
import CFContext from "./Obfuscator/Control Flow/CFContext"

spawnSync("luac", ["-o", "luac.out", "./Script.lua"])

let Bytes = readFileSync("./luac.out")
let d = new Deserializer(Uint8Array.from(Bytes))
let Chunk = d.DecodeFile()
let Context = new ObfuscationContext(Chunk)
let Settings = new ObfuscationSettings()

if (Settings.CFlow) {
    let cf: CFContext = new CFContext(Chunk)
    cf.DoChunks()
}

let g = new Generator(Context)
let VMOut = g.GenerateVM(Settings)

// VMOut = Beautify(VMOut, { RenameVariables: false, RenameGlobals: false, SolveMath: false })
VMOut = Minify(VMOut, { RenameVariables: true, RenameGlobals: false, SolveMath: false })

// console.log(Chunk)
writeFileSync("./Output.lua", VMOut)