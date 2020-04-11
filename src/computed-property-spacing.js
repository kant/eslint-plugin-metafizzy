function create( context ) {

  let sourceCode = context.getSourceCode();

  function reportProperty( node, property ) {
    if ( !node.computed ) {
      return;
    }

    let openBracket = sourceCode.getTokenBefore( property );
    let closeBracket = sourceCode.getTokenAfter( property );
    let hasOpeningSpace = sourceCode.isSpaceBetweenTokens( openBracket, property );
    let hasClosingSpace = sourceCode.isSpaceBetweenTokens( property, closeBracket );

    let isSingleCharIdentifier = property.type == 'Identifier' &&
      property.name.length == 1;

    if ( property.type == 'Literal' || isSingleCharIdentifier ) {
      // Strings, Numbers, and single-character Identifiers like `i` reject spaces
      if ( hasOpeningSpace ) {
        context.report({
          node: node,
          loc: openBracket.loc,
          messageId: 'rejectedOpeningSpace',
          fix: function( fixer ) {
            return fixer.removeRange([ openBracket.range[1], property.range[0] ]);
          },
        });
      }
      if ( hasClosingSpace ) {
        context.report({
          node: node,
          loc: closeBracket.loc,
          messageId: 'rejectedClosingSpace',
          fix: function( fixer ) {
            return fixer.removeRange([ property.range[1], closeBracket.range[0] ]);
          },
        });
      }
    } else {
      // everything else require spaces
      if ( !hasOpeningSpace ) {
        context.report({
          node: node,
          loc: openBracket.loc,
          messageId: 'missingOpeningSpace',
          fix: function( fixer ) {
            return fixer.insertTextAfter( openBracket, ' ' );
          },
        });
      }
      if ( !hasClosingSpace ) {
        context.report({
          node: node,
          loc: closeBracket.loc,
          messageId: 'missingClosingSpace',
          fix: function( fixer ) {
            return fixer.insertTextBefore( closeBracket, ' ' );
          },
        });
      }
    }
  }

  return {
    Property: function( node ) {
      reportProperty( node, node.key );
    },
    MemberExpression: function( node ) {
      reportProperty( node, node.property );
    },
  };
}

module.exports = {
  meta: {
    type: 'layout',
    fixable: 'whitespace',

    docs: {
      description: 'spacing inside computed property brackets',
      category: 'Stylistic Issues',
    },

    messages: {
      missingOpeningSpace: 'There must be a space after this bracket.',
      missingClosingSpace: 'There must be a space before this bracket.',
      rejectedOpeningSpace: 'There should be no space after this bracket.',
      rejectedClosingSpace: 'There should be no space before this bracket.',
    },
  },

  create: create,
};
