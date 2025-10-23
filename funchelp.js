/*********************** Enum datas *********************** */
var FUNCTIONSHELP_ARGTYPE = {
    'decimal': 'Decimal',
    'string': 'Text',
    'number': 'Number',
    'vararg': 'Multiple',
    'datetime': 'Datetime',
    'boolean': 'Boolean',
    'array': 'List',
    'object': 'Map',
    'date': 'Date'
};

var FUNCTIONSHELP_DATATYPE = {
    'math': 'Numeric',
    'aggregate': 'Aggregate',
    'string': 'Text',
    'date': 'Date',
    'general': 'General',
    'logical': 'Logical',
    'array': 'List',
    'object': 'Map'
};
/*********************** Rendering functions ************* */
function renderJSON (jsonhelp) {
	if (typeof jsonhelp === 'string') {
		jsonhelp = JSON.parse(jsonhelp);
	}
	
	var window = jsonhelp.window;
	var formula = jsonhelp.formula;
	var container  = document.getElementById("helptextout");

	var fragment = document.createDocumentFragment();

	for (var i = 0, len = window.length; i < len; i++) {
		fragment.appendChild(getFunctionHelp(window[i], true));
	}

	for (var i = 0, len = formula.length; i < len; i++) {
		fragment.appendChild(getFunctionHelp(formula[i], false));
	}
	
	container.innerHTML = '';
	container.appendChild(fragment);
	document.getElementById('pagecontainer').classList.add('visible');
}
function generatePreview () {
	renderJSON(JSON.parse(editor.getDoc().getValue()));
}
/***************** Help rendering functions ********************* */
function getFunctionHelp (func, isWindowFunctions) {
    const syntax = getSyntax(func);
    const example = getExample(func, isWindowFunctions);
    const params = getParameters(func);
    const input = getInputData(func);
    const output = getOutputData(func);

    var wrapper = createElement('div', { class: 'formula_formula_helpcontent' });

    if (syntax) {
        wrapper.appendChild(
            createElement('div', { class: 'formula_helpsection' }, [
                createElement('span', { class: 'f14_bold' }, 'Syntax'),
                createElement('span', { class: 'formula_helpsyntax' }, syntax),
                createElement('p', { class: 'mT10' }, func.description)
            ])
        );
    }

    if (params) {
        wrapper.appendChild(
            createElement('div', { class: 'formula_helpsection' }, [
                createElement('span', { class: 'f14_bold' }, 'Parameters'),
                createElement('table', { class: 'formula_helpparams' }, createElement('tbody', {}, [
                    createElement('tr', {}, [
                        createElement('th', {}, 'Name'),
                        createElement('th', {}, 'Description')
                    ]),
                    params
                ]))
            ])
        );
    }

    if (example) {
        wrapper.appendChild(
            createElement('div', { class: 'formula_helpsection' }, [
                createElement('div', { class: 'f14_bold' }, 'Example'),
                createElement('div', { class: 'mT5' }, example)
            ])
        );
    }

    if (input && output) {
        wrapper.appendChild(
            createElement('div', { class: 'formula_helpsection disF_spaceBetween' }, [
                createElement('div', { style: 'width: 40%' }, [
                    createElement('div', { class: 'f14_bold' }, 'Input'),
                    createElement('div', { class: 'mT5' }, input)
                ]),
                createElement('div', { style: 'width: 58%' }, [
                    createElement('div', { class: 'f14_bold' }, 'Output'),
                    createElement('div', { class: 'mT5' }, output)
                ])
            ])
        );
    }

    return wrapper;
}

function getSyntax (func) {
    var params = func.argTypes;
	var displayName = func.funcName;

    var fragment = document.createDocumentFragment();

    if (params.length > 0) {
        var paramsfragment = document.createDocumentFragment();

        for (var i = 0, len = params.length; i < len; i++) {
            var param = params[i].argName;
            var columnClass = (i === 0 ? '' : 'mL5 ') + 'cm-column';

            paramsfragment.appendChild(createElement('span', { class: columnClass }, param));

            if (params[i].is_vararg === true) {
                paramsfragment.appendChild(document.createTextNode(',...'));
            }

            paramsfragment.appendChild(document.createTextNode(','));
        }

        paramsfragment.lastChild.remove();

        fragment.appendChild(createElement('span', { class: 'cm-function' }, displayName));
        fragment.appendChild(createElement('span', {}, '('));
        fragment.appendChild(createElement('span', {}, paramsfragment));
        fragment.appendChild(createElement('span', {}, ')'));

        return fragment;
    } else {
        if (displayName) {
            fragment.appendChild(createElement('span', { class: 'cm-function' }, displayName));
            fragment.appendChild(createElement('span', {}, '()'));

            return fragment;
        } else {
            return null;
        }
    }
}

function getParameters (func) {
    var params = func.argTypes;

    if (params.length > 0) {
        var fragment = document.createDocumentFragment();

        for (var i = 0, len = params.length; i < len; i++) {
            var param = params[i];
            var description = param.argDesc;

            if (param.isOptional) {
                description = '<b>[Optional]</b> ' + description;
            }

            fragment.appendChild(
                createElement('tr', {}, [
                    createElement('td', {}, [
                        createElement('p', {}, param.argName),
                        createElement('p', { class: 'text_batch_bg' }, FUNCTIONSHELP_ARGTYPE[param.argType])
                    ]),
                    createElement('td', {}, description)
                ])
            );
        }

        return fragment;
    } else {
        return null;
    }
}

function getExample (func, isWindowFunctions) {
    if (func.examples) {
        var examples = func.examples;
        var columns = examples.columns;
        var functions = examples.functions;

        var fragment1 = document.createDocumentFragment();
        var fragment2 = document.createDocumentFragment();
        var fragment3 = document.createDocumentFragment();

        if (columns && columns.length > 0) {
            for (var i = 0, len = columns.length; i < len; i++) {
                var splits = columns[i].split(':');

                var colName = splits.shift(); // First colon split has column name
                var colValue = splits.join(':'); // Remaining part is data (Required for time related data)

                var match1 = colValue.match(/\[[^[]*]/g);
                var match2 = colValue.match(/([a-z0-9-_:'"]*,)*/i);

                var colValues;

                if (match1) {
                    colValues = match1;
                } else if (match2) {
                    colValues = colValue.split(',');
                }

                for (var j = 0, jlen = colValues.length; j < jlen; j++) {
                    fragment1.appendChild(createElement('tr', {}, createElement('td', { class: 'value' }, colValues[j])));
                }

                fragment2.appendChild(createElement('table', { class: 'formula_helpparams mB15' }, [
                    createElement('tr', {}, createElement('th', { class: 'label' }, colName)),
                    fragment1
                ]));
            }
        }

        for (var i = 0, len = functions.length; i < len; i ++) {
            if (functions[i].result) {
                var example = createElement('tr', {}, [
                    createElement('td', {}, functions[i].function),
                    createElement('td', {}, functions[i].result)
                ]);

                if (functions[i].error === true) {
                    example.classList.add('error');
                }

                fragment3.appendChild(example);
            } else if (functions[i].sort || functions[i].group) {
                fragment3.appendChild(
                    createElement('tr', {}, [
                        createElement('td', {}, functions[i].function),
                        createElement('td', {}, functions[i].sort),
                        createElement('td', {}, functions[i].group)
                    ])
                );
            }
        }

        var exampleHeader = createElement('tr', {}, createElement('th', {}, 'Function'));

        if (functions[0].result) {
            exampleHeader.appendChild(createElement('th', {}, 'Result'));
        } else if (functions[0].sort || functions[0].group) {
            exampleHeader.appendChild(createElement('th', {}, 'Sort rows by'));
            exampleHeader.appendChild(createElement('th', {}, 'Group rows by'));
        }

        var exampleTable = createElement('table', { class: 'formula_exampletable' }, [
            exampleHeader,
            fragment3
        ]);

        if (isWindowFunctions === true) {
			exampleTable.style.width = '100%';
        }

        fragment2.appendChild(exampleTable);

        return fragment2;
    } else {
        return null;
    }
}

function getInputData (func) {
    var input = func.input;

    if (input && input.length > 0) {
        var fragment = document.createDocumentFragment();

        fragment.appendChild(
            createElement('tr', {}, [
                createElement('th', {}, input[0][0]),
                createElement('th', {}, input[0][1]),
                createElement('th', {}, input[0][2])
            ])
        );

        for (var i = 1, len = input.length; i < len; i++) {
            fragment.appendChild(
                createElement('tr', {}, [
                    createElement('td', {}, input[i][0]),
                    createElement('td', {}, input[i][1]),
                    createElement('td', {}, input[i][2])
                ])
            );
        }

        return createElement('table', { class: 'formula_exampletable', style: 'width: 100%' }, fragment);
    } else {
        return null;
    }
}

function getOutputData (func) {
    var output = func.output;

    if (output && output.length > 0) {
        var fragment = document.createDocumentFragment();

        fragment.appendChild(createElement('tr', {}, [
            createElement('th', {}, output[0][0]),
            createElement('th', {}, output[0][1]),
            createElement('th', {}, output[0][2]),
            createElement('th', {}, output[0][3])
        ]));

        for (var i = 1, len = output.length; i < len; i++) {
            fragment.appendChild(
                createElement('tr', {}, [
                    createElement('td', {}, output[i][0]),
                    createElement('td', {}, output[i][1]),
                    createElement('td', {}, output[i][2]),
                    createElement('td', {}, output[i][3])
                ])
            );
        }

        return createElement('table', { class: 'formula_exampletable', style: 'width: 100%' }, fragment);
    } else {
        return null;
    }
}

/*********** Functions to generate I18n keys ************ */
function showI18N () {
	showLoader();
	parseProps(JSON.parse(editor.getDoc().getValue()));
	hideLoader();

	document.getElementById('i18npopup').classList.add('visible');
	document.getElementById('pagecontainer').classList.remove('visible');
}

function parseProps (jsonhelp) {
	var i18nOutput = '';

	jsonhelp.window.forEach(function (item) {
		i18nOutput += "zs.client.dataprep.js.fnhelp." + item.funcName + ".desc=" + item.description + "\n";

		if (item.argTypes) {
			item.argTypes.forEach(function (jitem, jindex) {
				i18nOutput += "zs.client.dataprep.js.fnhelp." + item.funcName + ".param." + (jindex) + "." + jitem.argName + ".desc=" + jitem.argDesc + "\n";
			});
		}
	});

	jsonhelp.formula.forEach(function (item) {
		i18nOutput += "zs.client.dataprep.js.fnhelp." + item.funcName + ".desc=" + item.description + "\n";

		if (item.argTypes) {
			item.argTypes.forEach(function (jitem, jindex) {
				i18nOutput += "zs.client.dataprep.js.fnhelp." + item.funcName + ".param." + (jindex) + "." + jitem.argName + ".desc=" + jitem.argDesc + "\n";
			});
		}
	});

	document.getElementById("i18nprops").value = i18nOutput;
}
/***************** Display functions ********************* */
function closepopup(){
	document.getElementById('i18npopup').classList.remove('visible');
	document.getElementById('pagecontainer').classList.add('visible');
}

function showLoader() {
	document.getElementById('loader').classList.remove('hide');
	document.getElementById('pagecontainer').classList.add('hide');
}

function hideLoader() {
	document.getElementById('loader').classList.add('hide');
	document.getElementById('pagecontainer').classList.remove('hide');
}
/************************** Functions to be modified ****************************** */
function printFunFunTypes (jsonhelp) {
	for (var i = 0, len = jsonhelp.length; i < len; i++) {
		console.log(jsonhelp[i].dispName, "~" , jsonhelp[i].funcType);
	}
}

function distinctArgTypes (jsonhelp) {
	var argTypes = jsonhelp.map(item => item.argTypes);
	var args = [].concat.apply([], argTypes);
	var arg_types = args.map(item => item.argType);

	console.log("Param types: ", new Set(arg_types));
}

function distinctFuncTypes(jsonhelp){
	var funcTypes = jsonhelp.map(item => item.funcType);

	console.log("Function types:",new Set(funcTypes));
}
/******************************* Helper functions *********************************** */
function createElement(tagName, attributes, childNodes) {
    var element = document.createElement(tagName);

    if (isObject(attributes)) {
        var attributeKeys = Object.keys(attributes);

        for (var i = 0, len = attributeKeys.length; i < len; i++) {
            var key = attributeKeys[i];
            var val = attributes[key];
            element.setAttribute(key, val);
        }
    }

    if (childNodes) {
        switch (true) {
            case Array.isArray(childNodes):
                for (var i = 0, len = childNodes.length; i < len; i++) {
                    element.appendChild(childNodes[i]);
                }
                break;

            case typeof childNodes === 'object':
                element.appendChild(childNodes);
                break;

            case typeof childNodes === 'string':
                element.innerHTML = childNodes;
                break;

            case typeof childNodes === 'number':
                element.innerHTML = childNodes;
                break;
        }
    }

    return element;
}

function debounce (func, wait, immediate) {
    var timeout;

    return function () {
        var context = this;
		var args = arguments;

        var later = function() {
            timeout = null;
            if (!immediate) {
                func.apply(context, args);
            }
        };

        var callNow = immediate && !timeout;
        clearTimeout(timeout);

        timeout = setTimeout(later, wait);

        if (callNow) {
            func.apply(context, args);
        }
    };
}

function isObject(value) {
    return value !== undefined && value !== null && value.constructor === Object;
}
