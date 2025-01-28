export default class VMStrings {
    public static VMP1: string = `
local function gBit(Bit, Start, End)
if End then
		local Res = (Bit / 2 ^ (Start - 1)) % 2 ^ ((End - 1) - (Start - 1) + 1);
return Res - Res % 1;
	else
		local Plc = 2 ^ (Start - 1);
return (Bit % (Plc + Plc) >= Plc) and 1 or 0;
end;
end;

local Pos = 1;

local function gBits32()
    local W, X, Y, Z = Byte(ByteString, Pos, Pos + 3);

Pos = Pos + 4;
return (Z * 16777216) + (Y * 65536) + (X * 256) + W;
end;

local function gBits8()
    local F = Byte(ByteString, Pos, Pos);
Pos = Pos + 1;
return F;
end;

local function gBits16()
    local W, X = Byte(ByteString, Pos, Pos + 2);

Pos = Pos + 2;
return (X * 256) + W;
end;

local function gFloat()
	local Left = gBits32();
	local Right = gBits32();
	local IsNormal = 1;
	local Mantissa = (gBit(Right, 1, 20) * (2 ^ 32))
    + Left;
	local Exponent = gBit(Right, 21, 31);
	local Sign = ((-1) ^ gBit(Right, 32));
if (Exponent == 0) then
if (Mantissa == 0) then
return Sign * 0; -- + -0
		else
Exponent = 1;
IsNormal = 0;
end;
elseif(Exponent == 2047) then
return (Mantissa == 0) and(Sign * (1 / 0)) or(Sign * (0 / 0));
end;
return LDExp(Sign, Exponent - 1023) * (IsNormal + (Mantissa / (2 ^ 52)));
end;

local gSizet = gBits32;
local function gString(Len)
    local Str;
if (not Len) then
Len = gSizet();
if (Len == 0) then
return '';
end;
end;

Str = Sub(ByteString, Pos, Pos + Len - 1);
Pos = Pos + Len;

    return Sub(Str, 1, -2);
end;

local gInt = gBits32;
local function _R(...) return { ...}, Select('#', ...) end

local function Deserialize()
    local Instrs = {};
    local Functions = {};
	local Lines = {};
    local Chunk =
{
    Instrs,
    Functions,
    nil,
    Lines
};
	local ConstCount = gBits32()
    local Consts = {}

for Idx = 1, ConstCount do 
		local Type = gBits8();
		local Cons;

if (Type == CONST_BOOL) then Cons = (gBits8() ~= 0);
elseif(Type == CONST_FLOAT) then Cons = gFloat();
elseif(Type == CONST_STRING) then Cons = gString();
end;

Consts[Idx] = Cons;
end;
`;

    public static VMP2: string = `
local function Wrap(Chunk, Upvalues, Env)
	local Instr = Chunk[1];
	local Proto = Chunk[2];
	local Params = Chunk[3];

return function (...)
		local Instr = Instr; 
		local Proto = Proto; 
		local Params = Params;

		local _R = _R
		local InstrPoint = 1;
		local Top = -1;

		local Vararg = {};
		local Args = { ...};

		local PCount = Select('#', ...) - 1;

		local Lupvals = {};
		local Stk = {};

for Idx = 0, PCount do
    if (Idx >= Params) then
				Vararg[Idx - Params] = Args[Idx + 1];
			else
Stk[Idx] = Args[Idx + 1];
end;
end;

		local Varargsz = PCount - Params + 1

		local Inst;
		local Enum;

while true do
    Inst = Instr[InstrPoint];
			Enum = Inst[OP_ENUM]; `;

    public static VMP3: string = `
InstrPoint = InstrPoint + 1;
end;
end;
end;
return Wrap(Deserialize(), {}, GetFEnv())();
`
}