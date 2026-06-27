export enum TokenType {
  KEYWORD,
  IDENTIFIER,
  NUMBER,
  OPERATOR,
  COMMA,
  EOF
}

export interface Token {
  type: TokenType;
  value: string;
}

/**
 * Phase 4: Lexical Analysis Engine.
 * Tokenizes a raw DevQL string into recognized lexical symbols.
 */
export class Lexer {
  private input: string;
  private position: number = 0;

  constructor(input: string) {
    this.input = input;
  }

  public tokenize(): Token[] {
    const tokens: Token[] = [];
    
    while (this.position < this.input.length) {
      this.skipWhitespace();
      if (this.position >= this.input.length) break;

      const char = this.input[this.position];

      if (char === ',') {
        tokens.push({ type: TokenType.COMMA, value: ',' });
        this.position++;
      } else if (/[a-zA-Z_]/.test(char)) {
        const id = this.readIdentifier();
        if (id.toUpperCase() === 'SELECT' || id.toUpperCase() === 'WHERE') {
          tokens.push({ type: TokenType.KEYWORD, value: id.toUpperCase() });
        } else {
          tokens.push({ type: TokenType.IDENTIFIER, value: id });
        }
      } else if (/[0-9]/.test(char)) {
        tokens.push({ type: TokenType.NUMBER, value: this.readNumber() });
      } else if (/[=><!]/.test(char)) {
        tokens.push({ type: TokenType.OPERATOR, value: this.readOperator() });
      } else {
        throw new Error(`Syntax Error: Unexpected character '${char}' at position ${this.position}`);
      }
    }
    
    tokens.push({ type: TokenType.EOF, value: '' });
    return tokens;
  }

  private skipWhitespace() {
    while (this.position < this.input.length && /\s/.test(this.input[this.position])) {
      this.position++;
    }
  }

  private readIdentifier(): string {
    let result = '';
    while (this.position < this.input.length && /[a-zA-Z0-9_]/.test(this.input[this.position])) {
      result += this.input[this.position++];
    }
    return result;
  }

  private readNumber(): string {
    let result = '';
    while (this.position < this.input.length && /[0-9\.]/.test(this.input[this.position])) {
      result += this.input[this.position++];
    }
    return result;
  }

  private readOperator(): string {
    let result = '';
    while (this.position < this.input.length && /[=><!]/.test(this.input[this.position])) {
      result += this.input[this.position++];
    }
    return result;
  }
}
