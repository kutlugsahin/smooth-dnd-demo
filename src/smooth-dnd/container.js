import { hasClass, addClass, removeClass } from './utils';
import { domDropHandler } from './dropHandlers';
import {
	defaultGroupName,
	wrapperClass,
	animationClass,
	stretcherElementClass,
	extraSizeForInsertion,
	translationValue,
	containerClass,
	containerInstance,
	containersInDraggable
} from './constants';
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

function getContainer(element) {
	return element[containerInstance];
}

function initOptions(props = defaultOptions) {
	const result = Object.assign({}, defaultOptions, props);
	if (result.groupName && !props.acceptGroups) {
		result.acceptGroups = [props.groupName];
	}
	return result;
}

function isDragRelevant({ element, options }) {
	return function(draggableInfo) {
		if (options.behaviour === 'copy') return false;
		if (draggableInfo.container.element === element) return true;
		if (draggableInfo.groupName && draggableInfo.groupName === options.groupName) return true;
		if (options.acceptGroups.indexOf(draggableInfo.groupName) > -1) return true;

		return false;
	};
}

function wrapChild(child, orientation) {
	const div = document.createElement('div');
	div.className = `${wrapperClass} ${orientation} ${animationClass}`;
	child.parentElement.insertBefore(div, child);
	div.appendChild(child);
	return div;
}

function wrapChildren(element, orientation) {
	const draggables = Array.prototype.map.call(element.children, child => {
		let wrapper = child;
		if (!hasClass(child, wrapperClass)) {
			wrapper = wrapChild(child, orientation);
		}
		return wrapper;
	});
	return draggables;
}

function findDraggebleAtPos({ layout }) {
	const find = (draggables, pos, startIndex, endIndex, withRespectToMiddlePoints = false) => {
		if (endIndex < startIndex) {
			return startIndex;
		}
		// binary serach draggable
		if (startIndex === endIndex) {
			let { begin, end } = layout.getBeginEnd(draggables[startIndex]);
			// mouse pos is inside draggable
			// now decide which index to return
			if (pos > begin && pos <= end) {
				if (withRespectToMiddlePoints) {
					return (pos < ((end + begin) / 2)) ? startIndex : startIndex + 1;
				} else {
					return startIndex;
				}
			} else {
				return null;
			}
		} else {
			const middleIndex = Math.floor((endIndex + startIndex) / 2);
			const { begin, end } = layout.getBeginEnd(draggables[middleIndex]);
			if (pos < begin) {
				return find(draggables, pos, startIndex, middleIndex - 1, withRespectToMiddlePoints);
			} else if (pos > end) {
				return find(draggables, pos, middleIndex + 1, endIndex, withRespectToMiddlePoints);
			} else {
				if (withRespectToMiddlePoints) {
					return (pos < ((end + begin) / 2)) ? middleIndex : middleIndex + 1;
				} else {
					return middleIndex;
				}
			}
		}
	};

	return (draggables, pos, withRespectToMiddlePoints = false) => {
		return find(draggables, pos, 0, draggables.length - 1, withRespectToMiddlePoints);
	};
}

function resetDraggables({ element, draggables, layout }) {
	return function() {
		draggables.forEach(p => {
			removeClass(p, animationClass);
			layout.setTranslation(p, 0);
			layout.setVisibility(p, true);
		});

		setTimeout(() => {
			draggables.forEach(p => {
				addClass(p, animationClass);
			});
		}, 50);
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

function handleDrop({ element, draggables, layout, options }) {
	const draggablesReset = resetDraggables({ element, draggables, layout });
	const dropHandler = (options.dropHandler || domDropHandler)(({ element, draggables, layout, options }));
	return function(draggableInfo, { addedIndex, removedIndex }) {
		draggablesReset();
		// if drop zone is valid => complete drag else do nothing everything will be reverted by draggablesReset()
		if (draggableInfo.targetElement) {
			let actualAddIndex = addedIndex !== null ? ((removedIndex !== null && removedIndex < addedIndex) ? addedIndex - 1 : addedIndex) : null;
			const dropHandlerParams = {
				removedIndex,
				addedIndex: actualAddIndex,
				payload: draggableInfo.payload,
				droppedElement: draggableInfo.element.firstChild
			}
			dropHandler(dropHandlerParams, options.onDropEnd);
			console.log(removedIndex, actualAddIndex, draggableInfo.payload, draggableInfo.element.firstChild);
		}
	};
}

function handleInsertionSizeChange({ element, draggables, layout }) {
	let strectherElement = null;
	let stretcherElementAdded = false;

	return function({ addedIndex, removedIndex, elementSize }, reset = false) {
		if (reset) {
			element[extraSizeForInsertion] = 0;
			if (strectherElement) {
				element.removeChild(strectherElement);
				strectherElement = null;
			}
		} else {
			if (removedIndex === null) {
				if (addedIndex !== null) {
					if (!stretcherElementAdded) {
						const containerBeginEnd = layout.getBeginEndOfContainer();
						const hasScrollBar = layout.getScrollSize(element) > layout.getSize(element);
						const containerEnd = hasScrollBar ? (containerBeginEnd.begin + layout.getScrollSize(element) - layout.getScrollValue(element)) : containerBeginEnd.end;
						const lastDraggableEnd = layout.getBeginEnd(draggables[draggables.length - 1]).end - draggables[draggables.length - 1][translationValue];
						if (lastDraggableEnd + elementSize > containerEnd) {
							strectherElement = document.createElement('div');
							strectherElement.className = stretcherElementClass;
							const stretcherSize = (elementSize + lastDraggableEnd) - containerEnd;
							element[extraSizeForInsertion] = stretcherSize;
							layout.setSize(strectherElement.style, `${stretcherSize}px`);
							element.appendChild(strectherElement);
						}
						stretcherElementAdded = true;
					}
				} else {
					element[extraSizeForInsertion] = 0;
					if (strectherElement) {
						layout.setTranslation(strectherElement, 0);
						let toRemove = strectherElement;
						strectherElement = null;
						element.removeChild(toRemove);
						setTimeout(function() {
						}, 180);
					}
					stretcherElementAdded = false;
				}
			}
		}
	}
}

function getContainerProps(element, initialOptions) {
	const options = initOptions(initialOptions);
	const draggables = wrapChildren(element, options.orientation);
	// set flex classes before layout is inited for scroll listener
	addClass(element, `${containerClass} ${options.orientation}`);
	const layout = layoutManager(element, options.orientation);
	return {
		element,
		draggables,
		options,
		layout
	};
}

function registerToParentContainer(container) {
	setTimeout(() => {
		let currentElement = container.element;
		while (currentElement.parentElement && !getContainer(currentElement.parentElement)) {
			currentElement = currentElement.parentElement;
		}

		if (currentElement.parentElement) {
			const parentContainer = currentElement.parentElement;
			container.hasParentContainer = true;
			getContainer(parentContainer).childContainers.push(container);
			container.setParentContainer(getContainer(parentContainer));
			//current should be draggable
			currentElement[containersInDraggable].push(container);
		}

	}, 100);
}

function getRemovedItem({ draggables, element, options }) {
	let prevRemovedIndex = null;
	return ({ draggableInfo, dragResult }) => {
		let removedIndex = prevRemovedIndex;
		if (prevRemovedIndex == null && draggableInfo.container.element === element && options.behaviour === 'move') {
			removedIndex = prevRemovedIndex = draggableInfo.elementIndex;
		}

		return { removedIndex };
	}
}

function setRemovedItemVisibilty({ draggables, layout }) {
	return ({ draggableInfo, dragResult }) => {
		if (dragResult.removedIndex !== null) {
			layout.setVisibility(draggables[dragResult.removedIndex], false);
		}
	}
}

function getPosition({ element, layout }) {	
	return ({ draggableInfo }) => {
		return {
			pos: !getContainer(element).isPosInChildContainer() ? layout.getPosition(draggableInfo.position) : null
		}
	}
}

function notifyParentOnPositionCapture({ element }) {
	let isCaptured = false;
	return ({ draggableInfo, dragResult }) => {
		if (getContainer(element).getParentContainer() && isCaptured !== (dragResult.pos !== null)) {
			isCaptured = dragResult.pos !== null;
			getContainer(element).getParentContainer().onChildPositionCaptured(isCaptured);
		}
	}
}

function getElementSize({ layout }) {
	let elementSize = null;
	return ({ draggableInfo, dragResult }) => {
		if (dragResult.pos === null) {
			return elementSize = null;
		} else {
			elementSize = elementSize || layout.getSize(draggableInfo.element)
		}
		return { elementSize };
	}
}

function handleTargetContainer({ element }) {
	return ({ draggableInfo, dragResult }) => {
		setTargetContainer(draggableInfo, element, !!dragResult.pos);
	}
}

function getShadowBeginEnd({ draggables, layout }) {
	let prevAddedIndex = null;
	return ({ draggableInfo, dragResult }) => {
		const { addedIndex, removedIndex, elementSize, pos } = dragResult;
		if (pos !== null) {
			if (addedIndex !== null && (draggableInfo.invalidateShadow || addedIndex !== prevAddedIndex)) {
				prevAddedIndex = addedIndex;
				let beforeIndex = addedIndex - 1;
				let begin = 0;
				let afterBounds = null;
				let beforeBounds = null;
				if (beforeIndex === removedIndex) {
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
				let afterIndex = addedIndex;
				if (afterIndex === removedIndex) {
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
					shadowBeginEnd: {
						begin,
						end,
						rect: shadowRectTopLeft
					}
				};
			} else {
				return null;
			}
		} else {
			prevAddedIndex = null;
			return {
				shadowBeginEnd: null
			};
		}
	};
}

function handleFirstInsertShadowAdjustment() {
	let lastAddedIndex = null;
	return ({ dragResult: { pos, addedIndex, shadowBeginEnd, invalidateShadow } }) => {
		if (pos !== null) {
			if (addedIndex != null && (lastAddedIndex === null || invalidateShadow)) {
				lastAddedIndex = addedIndex;
				if (pos < shadowBeginEnd.begin) shadowBeginEnd.begin = pos - 5;
				if (pos > shadowBeginEnd.end) shadowBeginEnd.end = pos + 5;
			}
		} else {
			lastAddedIndex = null;
		}
	}
}

function getDragInsertionIndex({ draggables, layout }) {
	const findDraggable = findDraggebleAtPos({ layout });
	return ({ dragResult: { shadowBeginEnd, pos } }) => {
		if (!shadowBeginEnd) {
			const index = findDraggable(draggables, pos, true);
			return index !== null ? index : draggables.length;
		} else {
			if (shadowBeginEnd.begin <= pos && shadowBeginEnd.end >= pos) {
				// position inside ghost
				return null;
			}
		}

		if (pos < shadowBeginEnd.begin) {
			return findDraggable(draggables, pos);
		} else if (pos > shadowBeginEnd.end) {
			return findDraggable(draggables, pos) + 1;
		} else {
			return draggables.length;
		}
	};
}


function calculateTranslations({ element, draggables, layout }) {
	let prevAddedIndex = null;
	let prevRemovedIndex = null;
	return function({ dragResult: { addedIndex, removedIndex, elementSize } }) {
		if (addedIndex !== prevAddedIndex || removedIndex !== prevRemovedIndex) {
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

			prevAddedIndex = addedIndex;
			prevRemovedIndex = removedIndex;

			return { addedIndex, removedIndex };
		}
	};
}

function invalidateShadowBeginEndIfNeeded(params) {
	const shadowBoundsGetter = getShadowBeginEnd(params);
	return ({ draggableInfo, dragResult }) => {
		if (draggableInfo.invalidateShadow) {
			return shadowBoundsGetter({ draggableInfo, dragResult })
		}
		return null;
	}
}

function getNextAddedIndex(params) {
	const getIndexForPos = getDragInsertionIndex(params);
	return ({ dragResult }) => {
		let index = null;
		if (dragResult.pos !== null) {
			index = getIndexForPos({ dragResult });
			if (index === null) {
				index = dragResult.addedIndex;
			}
		}
		return {
			addedIndex: index
		}
	}
}

function getDragHandler(params) {
	return compose(params)(
		getRemovedItem,
		setRemovedItemVisibilty,
		getPosition,
		notifyParentOnPositionCapture,
		getElementSize,
		handleTargetContainer,
		invalidateShadowBeginEndIfNeeded,
		getNextAddedIndex,
		calculateTranslations,
		getShadowBeginEnd,
		handleFirstInsertShadowAdjustment
	);
}

function getDefaultDragResult() {
	return {
		addedIndex: null,
		removedIndex: null,
		elementSize: null,
		pos: null,
		shadowBeginEnd: null
	}
}

function compose(params) {
	return (...functions) => {
		const hydratedFunctions = functions.map(p => p(params));
		let result = null;
		return (draggableInfo) => {
			result = hydratedFunctions.reduce((dragResult, fn) => {
				return Object.assign(dragResult, fn({ draggableInfo, dragResult }));
			}, result || getDefaultDragResult());
			return result;
		}
	}
}

// Container definition begin
function Container(element) {
	return function(options) {
		let dragResult = null;
		let lastDraggableInfo = null;
		const props = getContainerProps(element, options);
		let dragHandler = getDragHandler(props);
		let dropHandler = handleDrop(props);
		let insertionStretcherHandler = handleInsertionSizeChange(props);
		let parentContainer = null;
		let posIsInChildContainer = false;

		function processLastDraggableInfo() {
			if (lastDraggableInfo !== null) {
				lastDraggableInfo.invalidateShadow = true;
				dragResult = dragHandler(lastDraggableInfo);
				lastDraggableInfo.invalidateShadow = false;
			}
		}

		function onChildPositionCaptured(isCaptured) {
			posIsInChildContainer = isCaptured;
			if (!parentContainer) {
				parentContainer.onChildPositionCaptured(isCaptured);
				dragResult = dragHandler(lastDraggableInfo);
			}
		}

		props.layout.setScrollListener(function() {
			processLastDraggableInfo();
		});

		return {
			element,
			draggables: props.draggables,
			isDragRelevant: isDragRelevant(props),
			getScale: props.layout.getContainerScale,
			getChildPayload: props.options.getChildPayload,
			groupName: props.options.groupName,
			layout: props.layout,
			childContainers: [],
			hasParentContainer: false,
			onChildPositionCaptured,
			isPosInChildContainer: () => posIsInChildContainer,
			handleDrag: function(draggableInfo) {
				lastDraggableInfo = draggableInfo;
				dragResult = dragHandler(draggableInfo);
				insertionStretcherHandler(dragResult);
			},
			handleDrop: function(draggableInfo) {
				lastDraggableInfo = null;
				dragHandler = getDragHandler(props);
				insertionStretcherHandler({}, true);
				dropHandler(draggableInfo, dragResult);
				props.layout.invalidate();
			},
			getDragResult: function() {
				return dragResult;
			},
			getTranslateCalculator: function(...params) {
				return calculateTranslations(props)(...params);
			},
			invalidateRect: function() {
				props.layout.invalidate();
				processLastDraggableInfo();
			},
			getBehaviour: function() {
				return props.options.behaviour;
			},
			getDragHandleSelector: function() {
				return props.options.dragHandleSelector;
			},
			getDragDelay: () => props.options.dragBeginDelay,
			setParentContainer: (e) => { parentContainer = e; },
			getParentContainer: () => parentContainer
		};
	};
}

const options = {
	onDragStart: (itemIndex) => { },
	onDragMove: () => { },
	onDrop: () => { },
	behaviour: 'move',
	groupName: 'bla bla', // if not defined => container will not interfere with other containers
	acceptGroups: [],
	orientation: 'vertical',
	dragHandleSelector: null,
	dragBeginDelay: 0,
	getChildPayload: (index) => null,
}

// exported part of container
export default function(element, options) {
	const containerIniter = Container(element);
	const container = containerIniter(options);
	element[containerInstance] = container;
	Mediator.register(container);
	registerToParentContainer(container);
	return {
		setOptions: containerIniter,
		invalidateRect: function() {
			container.invalidateRect();
		},
		dispose: function() {
			container.layout.dispose();
		}
	};
}



