exports.parse = function(bem) {
    var util = require('util');
    var _ = require('lodash');
    var esprima = require('esprima');
    var esdispatch = require('esdispatch');
    var dispatcher = new esdispatch();

    var ast = esprima.parse(bem);

    var bemKeys = [
        'block',
        'elem',
        'elems',
        'mods'
    ];

    var shouldDeps = [];
    var result;

    function generateMods(ast) {
        var mods = {};
        ast.forEach(function(item) {
            var val = item.value;
            mods[item.key.name] = val.type === 'Literal' ? val.value : generateArray(val);
        });

        return mods;
    }

    function generateArray(ast) {
        return ast.elements.map(function(item) {
            return item.value;
        });
    }

    function getBlockByContext(ast) {
        var block;

        ast = ast.filter(function(item) {
            return item.type === 'ObjectExpression';
        });

        for (var i = 0, len = ast.length; i < len; i++) {
            var node = ast[i],
                props = node.properties;

            for (var j = 0, propsLen = props.length; j < propsLen; j++) {
                if (props[j].key.name === 'block') return props[j].value.value;
            }
        }
    }

    dispatcher.on('ObjectExpression', function(node, ancestors) {
        var entity = {};

        node.properties.forEach(function(prop) {
            var key = prop.key.name;
            if (bemKeys.indexOf(key) < 0) return;

            var val = key === 'mods' ? generateMods(prop.value.properties) : prop.value.value;

            entity[key] = val;

        });

        if (!Object.keys(entity).length) return;

        if (!entity.block) {
            var block = getBlockByContext(ancestors);
            block && (entity.block = block);
        }

        Object.keys(entity).length && shouldDeps.push(entity);
    });

    function normalizeDeps(deps) {
        var newDeps = [],
            elem = [];

        deps.forEach(function(item) {
            if (Object.keys(item).length === 1) {
                if (item.block) {
                    newDeps.indexOf(item.block) < 0 && newDeps.push(item.block);
                    return;
                }

                if (item.elem) {
                    elem.indexOf(item.elem) < 0 && elem.push(item.elem);
                    return;
                }
                _.find(newDeps, item) || newDeps.push(item);
                return;
            } else {
                _.find(newDeps, item) || newDeps.push(item);
            }
        });

        elem.length && newDeps.push({ elem: elem });

        return newDeps;
    }

    dispatcher.observe(ast, function() {
        result = '{ shouldDeps: ' + util.inspect(normalizeDeps(shouldDeps), { depth: null }) + ' }';
    });

    return result;
};
