interface Store {
    enumPatterns: string[]
}

export const store: Store = {
    enumPatterns: ["A. "]
}

const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII", "XIII", "XIV", "XV"];
const ALPHA = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P"];
function _parsePattern (pattern: string, enumerator: number): string {
    return pattern.replace("N", enumerator.toString())
    .replace("n", enumerator.toString())
    .replace("R", ROMAN[enumerator - 1] || enumerator.toString())
    .replace("r", ROMAN[enumerator - 1].toLowerCase() || enumerator.toString())
    .replace("A", ALPHA[enumerator - 1] || enumerator.toString())
    .replace("a", ALPHA[enumerator - 1].toLowerCase() || enumerator.toString());
}