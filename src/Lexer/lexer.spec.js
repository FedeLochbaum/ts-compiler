import Lexer from "./lexer"
import { TOKEN } from "./token"

describe('Lexer', () => {

  const testLexer = ({ input, expected }) => {
    const lexer = new Lexer(input)
    const tokens = []
    let token = lexer.getToken()

    while (token.kind !== 'eof') { tokens.push(token); token = lexer.getToken() }

    expect(tokens).toEqual(expected)
  }

  it('simple boolean let assign', () => {
    testLexer({
      input: `
        let x = true
      `,
      expected:  [ TOKEN.LET(9), TOKEN.ID(13, 'x'), TOKEN.ASSIGNER(15), TOKEN.TRUE(17) ]
    })
  })

  it('simple boolean let assign !', () => {
    testLexer({
      input: `
        let x = !true
      `,
      expected:  [ TOKEN.LET(9), TOKEN.ID(13, 'x'), TOKEN.ASSIGNER(15), TOKEN.BANG(17), TOKEN.TRUE(18) ]
    })
  })

  it('ord op boolean let assign <', () => {
    testLexer({
      input: `
        let x = 42 < 1000
      `,
      expected:  [ TOKEN.LET(9), TOKEN.ID(13, 'x'), TOKEN.ASSIGNER(15), TOKEN.INT(17, "42"), TOKEN.LESS_THAN(20), TOKEN.INT(22, "1000")]
    })
  })

  it('ord op boolean let assign >', () => {
    testLexer({
      input: `
        let x = 42 > 1000
      `,
      expected:  [ TOKEN.LET(9), TOKEN.ID(13, 'x'), TOKEN.ASSIGNER(15), TOKEN.INT(17, "42"), TOKEN.GREATER_THAN(20), TOKEN.INT(22, "1000")]
    })
  })

  it('simple number let assign', () => {
    testLexer({
      input: `
        let x = 42
      `,
      expected:  [ TOKEN.LET(9), TOKEN.ID(13, 'x'), TOKEN.ASSIGNER(15), TOKEN.INT(17, "42") ]
    })
  })

  it('if then', () => {
    testLexer({
      input: `
        let x = 42 if (true == false)
      `,
      expected:  [
        TOKEN.LET(9), TOKEN.ID(13, 'x'), TOKEN.ASSIGNER(15), TOKEN.INT(17, "42"), TOKEN.IF(20), TOKEN.LEFT_PAREN(23),
        TOKEN.TRUE(24), TOKEN.EQUAL(29), TOKEN.FALSE(32)
      ]
    })
  })

  it('if then else', () => {
    testLexer({
      input: `
        let x = 42 if (true != false) else 23
      `,
      expected:  [
        TOKEN.LET(9), TOKEN.ID(13, 'x'), TOKEN.ASSIGNER(15), TOKEN.INT(17, "42"), TOKEN.IF(20), TOKEN.LEFT_PAREN(23),
        TOKEN.TRUE(24), TOKEN.NOT_EQUAL(29), TOKEN.FALSE(32), TOKEN.ELSE(39), TOKEN.INT(44, "23")
      ]
    })
  })

  it('fun', () => {
    testLexer({
      input: `
        fn sarasa ( a ) { return 01 }
      `,
      expected:  [
        TOKEN.FN(9), TOKEN.ID(12, 'sarasa'), TOKEN.LEFT_PAREN(19), TOKEN.ID(21, 'a'), TOKEN.RIGHT_PAREN(23),
        TOKEN.LEFT_BRACE(25), TOKEN.RET(27), TOKEN.INT(34, "01"),  TOKEN.RIGHT_BRACE(37),
      ]
    })
  })

  it('complete program', () => {
    testLexer({
      input: `
        let x = 1
        fn sarasa ( x1 ) { x1 = x - 1; x = x + 1 ; return x1 }
        sarasa ( 42 )
      `,
      expected:  [
        TOKEN.LET(9), TOKEN.ID(13, 'x'), TOKEN.ASSIGNER(15), TOKEN.INT(17, "1"),
        TOKEN.FN(27), TOKEN.ID(30, 'sarasa'), TOKEN.LEFT_PAREN(37), TOKEN.ID(39, 'x1'), TOKEN.RIGHT_PAREN(42),
        TOKEN.LEFT_BRACE(44), TOKEN.ID(46, 'x1'), TOKEN.ASSIGNER(49), TOKEN.ID(51, 'x'), TOKEN.MINUS(53),
        TOKEN.INT(55, "1"), TOKEN.SEMICOLON(56), TOKEN.ID(58, 'x'), TOKEN.ASSIGNER(60), TOKEN.ID(62, 'x'), TOKEN.PLUS(64),
        TOKEN.ID(66, 'x'), TOKEN.SEMICOLON(68), TOKEN.RET(70), TOKEN.ID(77, 'x1'), TOKEN.RIGHT_BRACE(80),
        TOKEN.ID(21, 'sarasa'), TOKEN.LEFT_PAREN(19), TOKEN.INT(21, '42'), TOKEN.RIGHT_PAREN(23),
      ]
    })
  })
})