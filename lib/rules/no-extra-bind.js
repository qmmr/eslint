/**
 * @fileoverview Rule to flag unnecessary bind calls
 * @author Bence Dányi <bence@danyi.me>
 * @copyright 2014 Bence Dányi. All rights reserved.
 */
"use strict";

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

module.exports = function(context) {

    var scope = [{
        depth: -1,
        found: 0
    }];

    /**
     * Get the topmost scope
     * @returns {Object} The topmost scope
     */
    function getTopScope() {
        return scope[scope.length - 1];
    }

    /**
     * Increment the depth of the top scope
     * @returns {void}
     */
    function incrementScopeDepth() {
        var top = getTopScope();
        top.depth++;
    }

    /**
     * Decrement the depth of the top scope
     * @returns {void}
     */
    function decrementScopeDepth() {
        var top = getTopScope();
        top.depth--;
    }

    return {
        "CallExpression": function(node) {
            if (node.arguments.length === 1 &&
                node.callee.type === "MemberExpression" &&
                node.callee.property.name === "bind" &&
                node.callee.object.type === "FunctionExpression") {
                scope.push({
                    call: node,
                    depth: -1,
                    found: 0
                });
            }
        },
        "CallExpression:exit": function(node) {
            var top = getTopScope();
            if (top.call === node && top.found === 0) {
                context.report(node, "The function binding is unnecessary.");
                scope.pop();
            }
        },
        "FunctionExpression": incrementScopeDepth,
        "FunctionExpression:exit": decrementScopeDepth,
        "FunctionDeclaration": incrementScopeDepth,
        "FunctionDeclaration:exit": decrementScopeDepth,
        "ThisExpression": function() {
            var top = getTopScope();
            if (top.depth === 0) {
                top.found++;
            }
        }
    };

};
