import * as Utils from './utils';
import * as constants from './constants';
import { defaultGroupName, wrapperClass, animationClass } from './constants';
import layoutManager from './layoutManager';
import Mediator from './mediator';
import './container.css';

const defaultOptions = {
	groupName: defaultGroupName,
	behaviour: 'move', // move | copy
	acceptGroups: [defaultGroupName],
	orientation: 'vertical', // vertical | horizontal
	getChildPayload: () => { return undefined; }
};

function initOptions(props = defaultOptions) {
	const result = Object.assign({}, defaultOptions, props);
	if (result.groupName && !props.acceptGroups) {
		result.acceptGroups = [props.groupName];
	}
	return result;
}

function isDragRelevant({ element, options }) {
	return function(draggableInfo) {
		return draggableInfo.container.element === element ||
      draggableInfo.groupName === options.groupName ||
      options.acceptGroups.indexOf(draggableInfo.groupName) > -1;
	};
}

function wrapChild(child, orientation) {
	const div = document.createElement('div');
	div.className = `${wrapperClass} ${animationClass} ${orientation}`;
	child.parentElement.insertBefore(div, child);
	div.appendChild(child);
	return div;
}

function wrapChildren(element, orientation) {
	const draggables = Array.prototype.map.call(element.children, child => {
		let wrapper = child;
		if (!Utils.hasClass(child, wrapperClass)) {
			wrapper = wrapChild(child, orientation);
		}
		return wrapper;
	});
	return draggables;
}

function getDragInsertionIndex({ draggables, layout }) {
	const findDraggable = findDraggebleAtPos({ layout });
	return (ghostBeginEnd, pos) => {
		if (!ghostBeginEnd) {
			return findDraggable(draggables, pos);
		}

		if (pos < ghostBeginEnd.begin) {
			return findDraggable(draggables, pos);
		} else if (pos > ghostBeginEnd.end) {
			return findDraggable(draggables, pos) + 1;
		} else {
			return null;
		}
	};
}

function findDraggebleAtPos({ layout }) {
	const find = (draggables, pos, startIndex, endIndex) => {
		if (endIndex < startIndex) {
			return null;
		}
		// binary serach draggable
		if (startIndex === endIndex) {
			let { begin, end } = layout.getBeginEnd(draggables[startIndex]);
			if (pos > begin && pos <= end) {
				return startIndex;
			} else {
				return null;
			}
		} else {
			const middleIndex = Math.floor((endIndex + startIndex) / 2);
			const { begin, end } = layout.getBeginEnd(draggables[middleIndex]);
			if (pos < begin) {
				return find(draggables, pos, startIndex, middleIndex - 1);
			} else if (pos > end) {
				return find(draggables, pos, middleIndex + 1, endIndex);
			} else {
				return middleIndex;
			}
		}
	};

	return (draggables, pos) => {
		return find(draggables, pos, 0, draggables.length - 1);
	};
}

function getShadowBeginEnd({ draggables, layout }) {
	return (addIndex, removeIndex, elementSize) => {
		if (addIndex !== null) {
			let beforeIndex = addIndex - 1;
			let begin = 0;
			let afterBounds = null;
			let beforeBounds = null;
			if (beforeIndex === removeIndex) {
				beforeIndex--;
			}
			if (beforeIndex > -1) {
				const beforeSize = layout.getSize(draggables[beforeIndex]);
				beforeBounds = layout.getBeginEnd(draggables[beforeIndex]);
				if (elementSize < beforeSize) {
					const threshold = (beforeSize - elementSize) / 2;
					begin = beforeBounds.end - threshold;
				} else {
					begin = beforeBounds.end;
				}
			} else {
				beforeBounds = { end: layout.getBeginEndOfContainer().begin };
			}

			let end = 10000;
			let afterIndex = addIndex;
			if (afterIndex === removeIndex) {
				afterIndex++;
			}
			if (afterIndex < draggables.length) {
				const afterSize = layout.getSize(draggables[afterIndex]);
				afterBounds = layout.getBeginEnd(draggables[afterIndex]);

				if (elementSize < afterSize) {
					const threshold = (afterSize - elementSize) / 2;
					end = afterBounds.begin + threshold;
				} else {
					end = afterBounds.begin;
				}
			} else {
				afterBounds = { begin: layout.getContainerRectangles().end };        
			}

			const shadowRectTopLeft = beforeBounds && afterBounds ? layout.getTopLeftOfElementBegin(beforeBounds.end, afterBounds.begin) : null;

			return {
				begin,
				end,
				rect: shadowRectTopLeft
			};
		} else {
			return null;
		}
	};
}

function resetDraggables({ draggables, layout }) {
	return function() {
		draggables.forEach(p => {
			Utils.removeClass(p, animationClass);
			layout.setTranslation(p, 0);
			layout.setVisibility(p, true);
		});

		setTimeout(() => {
			draggables.forEach(p => {
				Utils.addClass(p, animationClass);
			});
		},50);
	};
}

function setTargetContainer(draggableInfo, element, set = true) {
	if (element && set) {
		draggableInfo.targetElement = element;
	} else {
		if (draggableInfo.targetElement === element) {
			draggableInfo.targetElement = null;
		}
	}
}

// function drawShadowRect(shadowBeginEnd, layout) {
// 	if (!shadowBeginEnd) {
// 		if (shadowDiv) {
// 			shadowDiv.parentElement.removeChild(shadowDiv);
// 			shadowDiv = null;
// 		}
// 	} else {
// 		const { begin, end } = shadowBeginEnd;
// 		if (!shadowDiv) {
// 			shadowDiv = document.createElement('div');
// 			shadowDiv.style.position = 'fixed';
// 			shadowDiv.style.backgroundColor = '#abc';
// 			document.body.appendChild(shadowDiv);
// 		}
// 		const rect = layout.getContainerRectangles().rect;

// 		shadowDiv.style.left = rect.left + 'px';
// 		shadowDiv.style.top = begin + 'px';
// 		shadowDiv.style.width = rect.right - rect.left + 'px';
// 		shadowDiv.style.height = end - begin + 'px';
// 	}
// }

// function drawShadowRect(shadowBeginEnd, layout) {
//   if (!shadowBeginEnd) {
//     if (shadowDiv) {
//       shadowDiv.parentElement.removeChild(shadowDiv);
//       shadowDiv = null;
//     }
//   } else {
//     const { begin, end } = shadowBeginEnd;
//     if (!shadowDiv) {
//       shadowDiv = document.createElement('div');
//       shadowDiv.style.position = 'fixed';
//       shadowDiv.style.backgroundColor = '#abc';
//       document.body.appendChild(shadowDiv);
//     }
//     const rect = layout.getContainerRectangles().rect;

//     shadowDiv.style.left = rect.left + 'px';
//     shadowDiv.style.top = begin + 'px';
//     shadowDiv.style.width = rect.right - rect.left + 'px';
//     shadowDiv.style.height = end - begin + 'px'
//   }
// }

function handleRemoveItem({ element, options, draggables, layout }) {
	let removedIndex = null;
	let elementSize = null;
	return function(draggableInfo) {
		if (removedIndex === null && draggableInfo.container.element === element && options.behaviour === 'move') {
			removedIndex = draggableInfo.elementIndex;
			layout.setVisibility(draggables[removedIndex], false);
		}
		if (elementSize === null) {
			elementSize = layout.getSize(draggableInfo.element);
		}
		const pos = layout.isInVisibleRect(draggableInfo.position) ? layout.getAxisValue(draggableInfo.position) : null;
		setTargetContainer(draggableInfo, element, !!pos);
		if (pos === null) {
			elementSize = null;
		}
		return {
			pos,
			removedIndex,
			elementSize,
			invalidateShadow: draggableInfo.invalidateShadow
		};
	};
}

function handleAddItem({ draggables, layout }) {
	let addedIndex = null;
	let shadowBeginEnd = null;
	const getNextAddedIndex = getDragInsertionIndex({ draggables, layout });
	const getShadowBounds = getShadowBeginEnd({ draggables, layout });
	const translate = calculateTranslations({ draggables, layout });
	return function(draggableInfo) {
		const { pos, removedIndex, elementSize, invalidateShadow } = draggableInfo;
		if (pos === null) {
			addedIndex = null;
			shadowBeginEnd = null;
			translate({ addedIndex, removedIndex, elementSize });
		} else {
			if (invalidateShadow) {
				shadowBeginEnd = getShadowBounds(addedIndex, removedIndex, elementSize);
			}
			let nextAddedIndex = getNextAddedIndex(shadowBeginEnd, pos);
			if (nextAddedIndex === null) {
				nextAddedIndex = addedIndex;
			}
			if (addedIndex !== nextAddedIndex) {
				translate({ addedIndex: nextAddedIndex, removedIndex, elementSize });
				shadowBeginEnd = getShadowBounds(nextAddedIndex, removedIndex, elementSize);
				addedIndex = nextAddedIndex;
			}
		}
		return {
			addedIndex,
			removedIndex,
			elementSize,
			shadowBeginEnd
		};
	};
}

function calculateTranslations({ draggables, layout }) {
	let prevAddIndex = null;
	let prevRemoveIndex = null;
	return function({ addedIndex, removedIndex, elementSize, shadowBeginEnd }) {
		if (addedIndex !== prevAddIndex || removedIndex !== prevRemoveIndex) {
			for (let index = 0; index < draggables.length; index++) {
				const draggable = draggables[index];
				let translate = 0;
				if (removedIndex !== null && removedIndex < index) {
					translate -= layout.getSize(draggables[removedIndex]);
				}
				if (addedIndex !== null && addedIndex <= index) {
					translate += elementSize;
				}
				layout.setTranslation(draggable, translate);
			}
			prevAddIndex = addedIndex;
			prevRemoveIndex = removedIndex;
		}
		return {
			addedIndex: prevAddIndex,
			removedIndex: prevRemoveIndex,
			elementSize,
			shadowBeginEnd
		};
	};
}

function compose(options) {
	return function(...functions) {
		const hydratedFunctions = functions.map(p => p(options));
		return function(data) {
			return hydratedFunctions.reduce((value, fn) => {
				return fn(value);
			}, data);
		};
	};
}

function handleDrag(options) {
	const draggableInfoHandler = compose(options)(handleRemoveItem, handleAddItem);  
	return function(draggableInfo) {
		return draggableInfoHandler(draggableInfo);
	};
}

function handleDrop({ draggables, layout, options }) {
	const draggablesReset = resetDraggables({ draggables, layout });  
	return function(draggableInfo, { addedIndex, removedIndex }) {
		draggablesReset();
		// handle drop
		// ...
		let actualAddIndex = addedIndex !== null ? (removedIndex < addedIndex ? addedIndex - 1 : addedIndex) : null;
		options.onDrop && options.onDrop(actualAddIndex, removedIndex, draggableInfo.payload, draggableInfo.element);
	};
}

function getContainerProps(element, initialOptions) {
	const options = initOptions(initialOptions);
	const draggables = wrapChildren(element, options.orientation);
	// set flex classes before layout is inited for scroll listener
	Utils.addClass(element, `${constants.containerClass} ${options.orientation}`);
	const layout = layoutManager(element, options.orientation);
	return {
		element,
		draggables,
		options,
		layout
	};
}

function Container(element) {
	return function(options) {
		let dragResult = null;
		let lastDraggableInfo = null;
		const props = getContainerProps(element, options);  
		const shadowGetter = getShadowBeginEnd(props);
		let dragHandler = handleDrag(props);
		let dropHandler = handleDrop(props);

		props.layout.setScrollListener(function() {
			if (lastDraggableInfo !== null) {
				lastDraggableInfo.invalidateShadow = true;
				dragResult = dragHandler(lastDraggableInfo);
				lastDraggableInfo.invalidateShadow = false;
			}
		});

		return {
			element,
			draggables: props.draggables,
			isDragRelevant: isDragRelevant(props),
			getScale: props.layout.getContainerScale,
			getChildPayload: props.options.getChildPayload,
			groupName: props.options.groupName,
			layout: props.layout,
			shadowGetter,
			handleDrag: function(draggableInfo) {
				lastDraggableInfo = draggableInfo;
				dragResult = dragHandler(draggableInfo);
			},
			handleDrop: function(draggableInfo) {
				lastDraggableInfo = null;
				dragHandler = handleDrag(props);
				return dropHandler(draggableInfo, dragResult);
			},
			getDragResult: function() {
				return dragResult;
			},
			getTranslateCalculator: function(...params) {
				return calculateTranslations(props)(...params);
			}
		};
	};
}

export default function(element, options) {
	const containerIniter = Container(element);
	const container = containerIniter(options);
	Mediator.register(container);
	return {
		setOptions: containerIniter,
		dispose: () => { }
	};
}

