import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Container, Draggable } from 'react-smooth-dnd';

class ChessBoard extends Component {
	constructor() {
		super();
		this.initBoard = this.initBoard.bind(this);
		this.onDrop = this.onDrop.bind(this);
		this.shouldAcceptDrop = this.shouldAcceptDrop.bind(this);
		this.renderPiece = this.renderPiece.bind(this);
		this.onDragEnter = this.onDragEnter.bind(this);
		this.onDragLeave = this.onDragLeave.bind(this);

		this.state = {
			board: this.initBoard()
		}
	}

	getFirstPieceRow(side) {
		return [
			{ type: 'rook', side, data: 9816 },
			{ type: 'knight', side, data: 9814 },
			{ type: 'bishop', side, data: 9815 },
			{ type: 'queen', side, data: 9813 },
			{ type: 'king', side, data: 9812 },
			{ type: 'bishop', side, data: 9815 },
			{ type: 'knight', side, data: 9814 },
			{ type: 'rook', side, data: 9816 },
		]
	}

	getSecondPieceRow(side) {
		return [
			{ type: 'pawn', side, data: 9817 },
			{ type: 'pawn', side, data: 9817 },
			{ type: 'pawn', side, data: 9817 },
			{ type: 'pawn', side, data: 9817 },
			{ type: 'pawn', side, data: 9817 },
			{ type: 'pawn', side, data: 9817 },
			{ type: 'pawn', side, data: 9817 },
			{ type: 'pawn', side, data: 9817 },
		]
	}

	initBoard() {
		const board = [];
		for (let i = 0; i < 8; i++) {
			if (i === 0) {
				board.push(this.getFirstPieceRow('black'));
			} else if (i === 1) {
				board.push(this.getSecondPieceRow('black'));
			} else if (i === 6) {
				board.push(this.getSecondPieceRow('white'));
			} else if (i === 7) {
				board.push(this.getFirstPieceRow('white'));
			} else {
				board.push([{}, {}, {}, {}, {}, {}, {}, {}]);
			}
		}

		return board;
	}

	renderPiece(piece) {
		if (piece.side) {
			const htmlcode = `&#${piece.data + (piece.side === 'black' ? 6 : 0)};`;
			const hover = piece.hover ? ' hover' : '';
			return (
				<Draggable>
					<div className={`piece${hover} ${piece.side}`}>
						<span dangerouslySetInnerHTML={{ __html: htmlcode }}></span>
					</div>
				</Draggable>
			);
		} else {
			return null;
		}
	}

	render() {
		return (
			<div className="board">
				{this.state.board.map((row, rowIndex) => {
					return (
						<div className="row" key={rowIndex}>
							{row.map((piece, colIndex) => {
								
								return (
									<div className={`square ${(rowIndex + colIndex) % 2 === 0 ? 'white' : 'black'}`} key={`${rowIndex}${colIndex}`}>
										<Container
											style={{ height: '100%' }}
											behaviour="drop-zone"
											onDrop={(result) => this.onDrop(result, rowIndex, colIndex)}
											shouldAcceptDrop={(_, payload) => this.shouldAcceptDrop(payload, rowIndex, colIndex)}
											getChildPayload={() => ({ colIndex, rowIndex, piece })}
											onDragEnter={() => this.onDragEnter(rowIndex, colIndex)}
											onDragLeave={() => this.onDragLeave(rowIndex, colIndex)}
										>
											{this.renderPiece(piece)}
										</Container>
									</div>
								);
							})}
						</div>
					);
				})}
			</div>
		);
	}

	shouldAcceptDrop(payload, rowIndex, colIndex) {
		const { colIndex: fromCol, rowIndex: fromRow } = payload;
		const fromPiece = this.state.board[fromRow][fromCol];
		const piece = this.state.board[rowIndex][colIndex];

		if (fromPiece === piece) return true;
		if (fromPiece.side === piece.side) return false;

		return true;
	}

	onDrop(dropResult, rowIndex, colIndex) {
		const { addedIndex, removedIndex, payload } = dropResult;

		if (addedIndex !== null || removedIndex !== null) {
			if (removedIndex !== null) {
				this.state.board[rowIndex][colIndex] = {};
			}

			if (addedIndex !== null) {
				this.state.board[rowIndex][colIndex] = payload.piece;
			}

			this.forceUpdate();
		}
	}

	onDragEnter(row, col) {
		this.state.board[row][col].hover = true;
		this.forceUpdate();
	}

	onDragLeave(row, col) {
		this.state.board[row][col].hover = false;
		this.forceUpdate();
	}
}

ChessBoard.propTypes = {

};

export default ChessBoard;