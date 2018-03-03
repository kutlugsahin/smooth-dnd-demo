import * as Utils from './utils';
import * as constants from './constants';

const grabEvents = ['mousedown'];
const moveEvents = ['mousemove'];
const releaseEvents = ['mouseup'];

let dragListeningContainers = null;
let grabbedElement = null;
let ghostInfo = null;
let draggableInfo = null;
let containers = [];
let isDragging = false;

function listenEvents() {
	addGrabListeners();
}

function addGrabListeners() {
	grabEvents.forEach(e => {
		window.document.addEventListener(e, onMouseDown);
	});
}

function addMoveListeners() {
	moveEvents.forEach(e => {
		window.document.addEventListener(e, onMouseMove);
	});
}

function removeMoveListeners() {
	moveEvents.forEach(e => {
		window.document.removeEventListener(e, onMouseMove);
	});
}

function addReleaseListeners() {
	releaseEvents.forEach(e => {
		window.document.addEventListener(e, onMouseUp);
	});
}

function removeReleaseListeners() {
	releaseEvents.forEach(e => {
		window.document.removeEventListener(e, onMouseUp);
	});
}

function getGhostElement(element, { x, y }, container) {
	const { scaleX = 1, scaleY = 1 } = container.getScale();
	const { left, top, right, bottom } = element.getBoundingClientRect();
	if (container.getOptions().dragClass) {
		Utils.addClass(element.childNodes[0], container.getOptions().dragClass);
	}
	const midX = left + ((right - left) / 2);
	const midY = top + ((bottom - top) / 2);
	const div = document.createElement('div');
	div.style.position = 'fixed';
	div.style.pointerEvents = 'none';
	div.style.left = left + 'px';
	div.style.top = top + 'px';
	div.style.width = right - left + 'px';
	div.style.height = bottom - top + 'px';
	div.style.overflow = 'hidden';
	div.className = constants.ghostClass;
	const clone = element.cloneNode(true);
	clone.style.width = ((right - left) / scaleX) + 'px';
	clone.style.height = ((bottom - top) / scaleY) + 'px';
	clone.style.transform = `scale3d(${scaleX || 1}, ${scaleY || 1}, 1)`;
	clone.style.transformOrigin = '0 0 0';
	clone.style.margin = '0px';
	div.appendChild(clone);

	return {
		ghost: div,
		centerDelta: { x: midX - x, y: midY - y },
		positionDelta: { left: left - x, top: top - y },
		clientWidth: right - left,
		clientHeight: bottom - top
	};
}

function getDraggableInfo(draggableElement) {
	const container = containers.filter(p => Utils.hasParent(draggableElement, p.element))[0];
	const draggableIndex = container.draggables.indexOf(draggableElement);
	return {
		container,
		element: draggableElement,
		elementIndex: draggableIndex,
		payload: container.getChildPayload(draggableIndex),
		targetElement: null,
		position: { x: 0, y: 0 },
		groupName: container.groupName
	};
}

function handleDropAnimation(callback) {
	function endDrop() {
		Utils.removeClass(ghostInfo.ghost, 'animated');
		ghostInfo.ghost.style.transitionDuration = null;
		document.body.removeChild(ghostInfo.ghost);
		callback();
	}

	function animateGhostToPosition({ top, left }, duration) {
		Utils.addClass(ghostInfo.ghost, 'animated');
		ghostInfo.ghost.style.transitionDuration = duration - 10 + 'ms';
		ghostInfo.ghost.style.left = left + 'px';
		ghostInfo.ghost.style.top = top + 'px';
		setTimeout(function() {
			endDrop();
		}, duration);
	}

	if (draggableInfo.targetElement) {
		const container = containers.filter(p => p.element === draggableInfo.targetElement)[0];
		const dragResult = container.getDragResult();
		animateGhostToPosition(dragResult.shadowBeginEnd.rect, container.getOptions().animationDuration);
	} else {
		const container = containers.filter(p => p === draggableInfo.container)[0];
		if (container.getBehaviour() === 'move') {
			const { removedIndex, elementSize } = container.getDragResult();
			const layout = container.layout;
			// drag ghost to back
			container.getTranslateCalculator({
				dragResult: {
					removedIndex,
					addedIndex: removedIndex,
					elementSize
				}
			});
			const prevDraggableEnd = removedIndex > 0 ? layout.getBeginEnd(container.draggables[removedIndex - 1]).end : layout.getBeginEndOfContainer().begin;
			animateGhostToPosition(layout.getTopLeftOfElementBegin(prevDraggableEnd), container.getOptions().animationDuration);
		} else {
			Utils.addClass(ghostInfo.ghost, 'animated');
			ghostInfo.ghost.style.transitionDuration = container.getOptions().animationDuration + 'ms';
			ghostInfo.ghost.style.opacity = '0';
			ghostInfo.ghost.style.transform = 'scale(0.90)';
			setTimeout(function() {
				endDrop();
			}, container.getOptions().animationDuration);
		}
	}
}

function handleDragStartConditions(container, { clientX, clientY }, startDragClb) {
	const delay = container.getDragDelay();
	const moveThreshold = 1;
	const maxMoveInDelay = 8;
	let timer = null;

	function onMove(e) {
		const { clientX: currentX, clientY: currentY } = e;
		if (!delay) {
			if (Math.abs(clientX - currentX) > moveThreshold || Math.abs(clientY - currentY) > moveThreshold) {
				return callCallback();
			}
		} else {
			if (Math.abs(clientX - currentX) > maxMoveInDelay || Math.abs(clientY - currentY) > maxMoveInDelay) {
				deregisterEvent();
			}
		}
	};

	function onUp() { deregisterEvent(); };
	function onHTMLDrag() { deregisterEvent(); }

	function registerEvents() {
		if (delay) {
			timer = setTimeout(callCallback, delay);
		}

		moveEvents.forEach(e => window.document.addEventListener(e, onMove));
		releaseEvents.forEach(e => window.document.addEventListener(e, onUp));
		document.addEventListener("drag", onHTMLDrag);
	}

	function deregisterEvent() {
		clearTimeout(timer);
		moveEvents.forEach(e => window.document.removeEventListener(e, onMove));
		releaseEvents.forEach(e => window.document.removeEventListener(e, onUp));
		document.removeEventListener("drag", onHTMLDrag);
	}

	function callCallback() {
		clearTimeout(timer);
		deregisterEvent();
		startDragClb();
	}

	registerEvents();
}

function onMouseDown(e) {
	if (!isDragging) {
		grabbedElement = Utils.getParent(e.target, '.' + constants.wrapperClass);
		if (grabbedElement) {
			const container = Utils.getParent(grabbedElement, '.' + constants.containerClass)[constants.containerInstance];
			const dragHandleSelector = container.getDragHandleSelector();

			let startDrag = true;
			if (dragHandleSelector && !Utils.getParent(e.target, dragHandleSelector)) {
				startDrag = false;
			}

			if (startDrag) {
				e.preventDefault();
				handleDragStartConditions(container, e, () => {
					addMoveListeners();
					addReleaseListeners();
				});
			}
		}
	}
}

function onMouseUp() {
	removeMoveListeners();
	removeReleaseListeners();

	if (draggableInfo) {
		handleDropAnimation(() => {
			(dragListeningContainers || []).forEach(p => {
				Utils.removeClass(p.element, 'no-user-select');
				// call handle drop function of the container if it is either source or target of drag event
				if (p === draggableInfo.container || p.element === draggableInfo.targetElement) {
					p.handleDrop(draggableInfo);
				}
			});

			dragListeningContainers = null;
			grabbedElement = null;
			ghostInfo = null;
			draggableInfo = null;
			isDragging = false;
		});
	}
}

function onMouseMove(e) {
	e.preventDefault();
	if (!draggableInfo) {
		isDragging = true;
		// first move after grabbing  draggable
		draggableInfo = getDraggableInfo(grabbedElement);
		ghostInfo = getGhostElement(grabbedElement, { x: e.clientX, y: e.clientY }, draggableInfo.container);
		draggableInfo.position = {
			x: e.clientX + ghostInfo.centerDelta.x,
			y: e.clientY + ghostInfo.centerDelta.y
		};

		document.body.appendChild(ghostInfo.ghost);

		dragListeningContainers = containers.filter(p => p.isDragRelevant(draggableInfo));
		dragListeningContainers.forEach(p => Utils.addClass(p.element, 'no-user-select'));
	} else {
		// just update ghost position && draggableInfo position
		ghostInfo.ghost.style.left = `${e.clientX + ghostInfo.positionDelta.left}px`;
		ghostInfo.ghost.style.top = `${e.clientY + ghostInfo.positionDelta.top}px`;
		draggableInfo.position.x = e.clientX + ghostInfo.centerDelta.x;
		draggableInfo.position.y = e.clientY + ghostInfo.centerDelta.y;
		draggableInfo.clientWidth = ghostInfo.clientWidth;
		draggableInfo.clientHeight = ghostInfo.clientHeight;
	}

	dragListeningContainers.forEach(p => p.handleDrag(draggableInfo));
}

function Mediator() {
	listenEvents();
	return {
		register: function(container) {
			containers.push(container);
		}
	};
}

export default Mediator();



