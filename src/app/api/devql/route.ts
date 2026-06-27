import { NextRequest, NextResponse } from 'next/server';
import { Lexer } from '@/lib/compiler/Lexer';
import { Parser } from '@/lib/compiler/Parser';
import { JitCompiler } from '@/lib/compiler/JitCompiler';
import prisma from '@/lib/prisma'; // In Phase 5 this will switch to our memory-mapped column DB

export async function POST(req: NextRequest) {
  try {
    const { query } = await req.json();
    
    if (!query || typeof query !== 'string') {
      return NextResponse.json({ error: 'Missing DevQL query string' }, { status: 400 });
    }

    // 1. Lexical Analysis
    const lexer = new Lexer(query);
    const tokens = lexer.tokenize();

    // 2. Syntactic Analysis (AST Generation)
    const parser = new Parser(tokens);
    const ast = parser.parse();

    // 3. JIT Compilation
    const executeQuery = JitCompiler.compile(ast);

    // Fetch raw baseline data to run the compiled function against.
    // For this prototype, we'll fetch all commits.
    const rawData = await prisma.commit.findMany();

    // 4. Execution at V8 JIT Speed
    const start = performance.now();
    const results = executeQuery(rawData);
    const end = performance.now();

    return NextResponse.json({
      executionTimeMs: end - start,
      ast,
      results
    });

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
