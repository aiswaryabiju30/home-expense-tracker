from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, Expense
from datetime import datetime

expenses_bp = Blueprint('expenses', __name__)

# ADD a new expense
@expenses_bp.route('/api/expenses', methods=['POST'])
@jwt_required()
def add_expense():
    user_id = get_jwt_identity()
    data = request.get_json()

    amount = data.get('amount')
    category = data.get('category')
    description = data.get('description', '')
    date_str = data.get('date')  # expected format: "2026-08-26"

    if not amount or not category:
        return jsonify({"error": "Amount and category are required"}), 400

    expense_date = datetime.strptime(date_str, "%Y-%m-%d") if date_str else datetime.utcnow()

    new_expense = Expense(
        user_id=user_id,
        amount=amount,
        category=category,
        description=description,
        date=expense_date
    )
    db.session.add(new_expense)
    db.session.commit()

    return jsonify({"message": "Expense added successfully", "id": new_expense.id}), 201


# GET all expenses for logged-in user
@expenses_bp.route('/api/expenses', methods=['GET'])
@jwt_required()
def get_expenses():
    user_id = get_jwt_identity()
    expenses = Expense.query.filter_by(user_id=user_id).order_by(Expense.date.desc()).all()

    result = [{
        "id": e.id,
        "amount": e.amount,
        "category": e.category,
        "description": e.description,
        "date": e.date.strftime("%Y-%m-%d")
    } for e in expenses]

    return jsonify(result), 200


# UPDATE an expense
@expenses_bp.route('/api/expenses/<int:expense_id>', methods=['PUT'])
@jwt_required()
def update_expense(expense_id):
    user_id = get_jwt_identity()
    expense = Expense.query.filter_by(id=expense_id, user_id=user_id).first()

    if not expense:
        return jsonify({"error": "Expense not found"}), 404

    data = request.get_json()
    expense.amount = data.get('amount', expense.amount)
    expense.category = data.get('category', expense.category)
    expense.description = data.get('description', expense.description)

    db.session.commit()
    return jsonify({"message": "Expense updated successfully"}), 200


# DELETE an expense
@expenses_bp.route('/api/expenses/<int:expense_id>', methods=['DELETE'])
@jwt_required()
def delete_expense(expense_id):
    user_id = get_jwt_identity()
    expense = Expense.query.filter_by(id=expense_id, user_id=user_id).first()

    if not expense:
        return jsonify({"error": "Expense not found"}), 404

    db.session.delete(expense)
    db.session.commit()
    return jsonify({"message": "Expense deleted successfully"}), 200