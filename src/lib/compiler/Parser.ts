import { Token, TokenType } from './Lexer';

export interface ASTNode {
  type: string;
}

export interface BinaryExprAST extends ASTNode {
  type: 'BinaryExpr';
  left: string;
  operator: string;
  right: number;
}

export interface SelectAST extends ASTNode {
  type: 'Select';
  fields: string[];
  condition?: BinaryExprAST;
}

/**
 * Phase 4: Recursive Descent Parser.
 * Consumes the Lexical Tokens and builds an Abstract Syntax Tree (AST) 
 * representing the DevQL logical structure.
 */
export class Parser {
  private tokens: Token[];
  private current: number = 0;

  constructor(tokens: Token[]) {
    this.tokens = tokens;
  }

  public parse(): SelectAST {
    this.consume(TokenType.KEYWORD, 'SELECT');
    
    const fields: string[] = [];
    fields.push(this.consume(TokenType.IDENTIFIER).value);
    
    while (this.match(TokenType.COMMA)) {
      fields.push(this.consume(TokenType.IDENTIFIER).value);
    }
    
    let condition: BinaryExprAST | undefined;
    
    if (this.match(TokenType.KEYWORD, 'WHERE')) {
      const left = this.consume(TokenType.IDENTIFIER).value;
      const operator = this.consume(TokenType.OPERATOR).value;
      const right = parseFloat(this.consume(TokenType.NUMBER).value);
      
      condition = { type: 'BinaryExpr', left, operator, right };
    }
    
    this.consume(TokenType.EOF);
    
    return { type: 'Select', fields, condition };
  }

  private peek(): Token {
    return this.tokens[this.current];
  }

  private advance(): Token {
    if (this.current < this.tokens.length) {
      this.current++;
    }
    return this.tokens[this.current - 1];
  }

  private check(type: TokenType, value?: string): boolean {
    if (this.current >= this.tokens.length) return false;
    const token = this.peek();
    if (token.type !== type) return false;
    if (value !== undefined && token.value !== value) return false;
    return true;
  }

  private match(type: TokenType, value?: string): boolean {
    if (this.check(type, value)) {
      this.advance();
      return true;
    }
    return false;
  }

  private consume(type: TokenType, value?: string): Token {
    if (this.check(type, value)) {
      return this.advance();
    }
    const token = this.peek();
    throw new Error(`Parse Error: Expected token type ${TokenType[type]} but found ${TokenType[token.type]} ('${token.value}')`);
  }
}
