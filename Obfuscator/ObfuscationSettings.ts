export default class ObfuscationSettings {
    public EncryptStrings: boolean;
    public EncryptImportantStrings: boolean;
    public BytecodeCompress: boolean;
    public Mutate: boolean;
    public SuperOperators: boolean;
    public CFlow: boolean;

    public MaxMutations: number;

    constructor() {
        this.EncryptStrings = false;
        this.EncryptImportantStrings = false;
        this.BytecodeCompress = false;
        this.Mutate = true;
        this.SuperOperators = true;
        this.CFlow = true;
        this.MaxMutations = 200;
    }
}