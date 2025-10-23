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

    const wrapper = createElement('div', { class: 'zsl_formula_helpcontent' });

    if (syntax) {
        wrapper.appendChild(
            createElement('div', { class: 'zsl_formula_helpsection' }, [
                createElement('span', { class: 'zsl_f14_bold' }, i18nUtil('zs.client.common.syntax')),
                createElement('span', { class: 'zsl_formula_helpsyntax' }, syntax),
                createElement('p', { class: 'zsl_mT10' }, i18nUtil('zs.client.dataprep.js.fnhelp.' + func.funcName + '.desc'))
            ])
        );
    }

    if (params) {
        wrapper.appendChild(
            createElement('div', { class: 'zsl_formula_helpsection' }, [
                createElement('span', { class: 'zsl_f14_bold' }, i18nUtil('zs.client.import.datasource.url.params')),
                createElement('table', { class: 'zsl_formula_helpparams' }, createElement('tbody', {}, [
                    createElement('tr', {}, [
                        createElement('th', {}, i18nUtil('zs.client.common.js.name')),
                        createElement('th', {}, i18nUtil('zs.client.common.js.description'))
                    ]),
                    params
                ]))
            ])
        );
    }

    if (example) {
        wrapper.appendChild(
            createElement('div', { class: 'zsl_formula_helpsection' }, [
                createElement('div', { class: 'zsl_f14_bold' }, i18nUtil('zs.client.common.example')),
                createElement('div', { class: 'zsl_mT5' }, example)
            ])
        );
    }

    if (input && output) {
        wrapper.appendChild(
            createElement('div', { class: 'zsl_formula_helpsection zsl_disF_spaceBetween' }, [
                createElement('div', { class: 'zsl_per40' }, [
                    createElement('div', { class: 'zsl_f14_bold' }, i18nUtil('zs.client.common.input')),
                    createElement('div', { class: 'zsl_mT5' }, input)
                ]),
                createElement('div', { class: 'zsl_per58' }, [
                    createElement('div', { class: 'zsl_f14_bold' }, i18nUtil('zs.client.dataprep.js.transform.languagedetection.output')),
                    createElement('div', { class: 'zsl_mT5' }, output)
                ])
            ])
        );
    }

    return wrapper;
}

function getSyntax (func) {
    const params = func.argTypes;

    const fragment = document.createDocumentFragment();

    if (params.length > 0) {
        const paramsfragment = document.createDocumentFragment();

        for (let i = 0, len = params.length; i < len; i++) {
            const param = params[i].argName;
            const columnClass = (i === 0 ? '' : 'zsl_mL5 ') + 'cm-column';

            paramsfragment.appendChild(createElement('span', { class: columnClass }, param));

            if (params[i].is_vararg === true) {
                paramsfragment.appendChild(document.createTextNode(',...'));
            }

            paramsfragment.appendChild(document.createTextNode(','));
        }

        paramsfragment.lastChild.remove();

        fragment.appendChild(createElement('span', { class: 'cm-function' }, func.funcName));
        fragment.appendChild(createElement('span', {}, '('));
        fragment.appendChild(createElement('span', {}, paramsfragment));
        fragment.appendChild(createElement('span', {}, ')'));

        return fragment;
    } else {
        if (func.funcName) {
            fragment.appendChild(createElement('span', { class: 'cm-function' }, func.funcName));
            fragment.appendChild(createElement('span', {}, '()'));

            return fragment;
        } else {
            return null;
        }
    }
}

function getParameters (func) {
    const params = func.argTypes;

    if (params.length > 0) {
        const fragment = document.createDocumentFragment();

        for (let i = 0, len = params.length; i < len; i++) {
            const param = params[i];
            let description = i18nUtil('zs.client.dataprep.js.fnhelp.' + func.funcName + '.param.' + i + '.' + param.argName + '.desc');

            if (param.isOptional) {
                description = '<b>' + i18nUtil('zs.client.dataprep.js.formula.optional') + '</b> ' + description;
            }

            fragment.appendChild(
                createElement('tr', {}, [
                    createElement('td', {}, [
                        createElement('p', {}, param.argName),
                        createElement('p', { class: 'zsl_text_batch_bg' }, FUNCTIONSHELP_ARGTYPE[param.argType])
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
        const examples = func.examples;
        const columns = examples.columns;
        const functions = examples.functions;

        const fragment1 = document.createDocumentFragment();
        const fragment2 = document.createDocumentFragment();
        const fragment3 = document.createDocumentFragment();

        if (columns && columns.length > 0) {
            for (let i = 0, len = columns.length; i < len; i++) {
                const splits = columns[i].split(':');

                const colName = splits.shift(); // First colon split has column name
                const colValue = splits.join(':'); // Remaining part is data (Required for time related data)

                // eslint-disable-next-line no-useless-escape
                const match1 = colValue.match(/\[[^[]*]/g);
                const match2 = colValue.match(/([a-z0-9-_:'"]*,)*/i);

                let colValues;

                if (match1) {
                    colValues = match1;
                } else if (match2) {
                    colValues = colValue.split(',');
                }

                for (let j = 0, jlen = colValues.length; j < jlen; j++) {
                    fragment1.appendChild(createElement('tr', {}, createElement('td', { class: 'value' }, colValues[j])));
                }

                fragment2.appendChild(createElement('table', { class: 'zsl_formula_helpparams zsl_mB15' }, [
                    createElement('tr', {}, createElement('th', { class: 'label' }, colName)),
                    fragment1
                ]));
            }
        }

        for (let i = 0, len = functions.length; i < len; i ++) {
            if (functions[i].result) {
                const example = createElement('tr', {}, [
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

        const exampleHeader = createElement('tr', {}, createElement('th', {}, i18nUtil('zs.client.common.function')));

        if (functions[0].result) {
            exampleHeader.appendChild(createElement('th', {}, i18nUtil('zs.client.common.result')));
        } else if (functions[0].sort || functions[0].group) {
            exampleHeader.appendChild(createElement('th', {}, i18nUtil('zs.client.dataprep.transform.formula.window.sortrows')));
            exampleHeader.appendChild(createElement('th', {}, i18nUtil('zs.client.dataprep.transform.formula.window.grouprows')));
        }

        const exampleTable = createElement('table', { class: 'zsl_formula_exampletable' }, [
            exampleHeader,
            fragment3
        ]);

        if (isWindowFunctions === true) {
            exampleTable.classList.add('zsl_per100');
        }

        fragment2.appendChild(exampleTable);

        return fragment2;
    } else {
        return null;
    }
}

function getInputData (func) {
    const input = func.input;

    if (input && input.length > 0) {
        const fragment = document.createDocumentFragment();

        fragment.appendChild(
            createElement('tr', {}, [
                createElement('th', {}, input[0][0]),
                createElement('th', {}, input[0][1]),
                createElement('th', {}, input[0][2])
            ])
        );

        for (let i = 1, len = input.length; i < len; i++) {
            fragment.appendChild(
                createElement('tr', {}, [
                    createElement('td', {}, input[i][0]),
                    createElement('td', {}, input[i][1]),
                    createElement('td', {}, input[i][2])
                ])
            );
        }

        return createElement('table', { class: 'zsl_formula_exampletable zsl_per100' }, fragment);
    } else {
        return null;
    }
}

function getOutputData (func) {
    const output = func.output;

    if (output && output.length > 0) {
        const fragment = document.createDocumentFragment();

        fragment.appendChild(createElement('tr', {}, [
            createElement('th', {}, output[0][0]),
            createElement('th', {}, output[0][1]),
            createElement('th', {}, output[0][2]),
            createElement('th', {}, output[0][3])
        ]));

        for (let i = 1, len = output.length; i < len; i++) {
            fragment.appendChild(
                createElement('tr', {}, [
                    createElement('td', {}, output[i][0]),
                    createElement('td', {}, output[i][1]),
                    createElement('td', {}, output[i][2]),
                    createElement('td', {}, output[i][3])
                ])
            );
        }

        return createElement('table', { class: 'zsl_formula_exampletable zsl_per100' }, fragment);
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
