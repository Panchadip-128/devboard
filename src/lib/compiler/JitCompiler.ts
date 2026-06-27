import { SelectAST } from './Parser';

/**
 * Phase 4: Just-In-Time (JIT) Code Generator.
 * Traverses the AST and dynamically generates highly optimized V8 JavaScript.
 * This completely avoids the massive overhead of recursively interpreting the AST
 * against millions of rows of data.
 */
export class JitCompiler {
  /**
   * Compiles the AST into an ultra-fast raw JavaScript function.
   * Returns a function closure that takes an array of data and returns the projection.
   */
  public static compile(ast: SelectAST): (data: any[]) => any[] {
    let fnBody = `const results = [];\n`;
    fnBody += `for (let i = 0; i < data.length; i++) {\n`;
    fnBody += `  const row = data[i];\n`;
    
    // Compile the WHERE clause
    if (ast.condition) {
      // Security note: In a true prod JIT, we strictly validate operators to prevent injection.
      // The Lexer and Parser already guarantee that only valid operators/fields get here.
      fnBody += `  if (row.${ast.condition.left} ${ast.condition.operator} ${ast.condition.right}) {\n`;
    }
    
    // Compile the SELECT projection
    fnBody += `    results.push({\n`;
    for (const field of ast.fields) {
      fnBody += `      ${field}: row.${field},\n`;
    }
    fnBody += `    });\n`;
    
    // Close the WHERE branch
    if (ast.condition) {
      fnBody += `  }\n`;
    }
    
    // Close the loop
    fnBody += `}\n`;
    fnBody += `return results;\n`;
    
    // 💥 The Core Compiler Flex: Dynamically invoke V8's runtime compiler!
    return new Function('data', fnBody) as (data: any[]) => any[];
  }
}
