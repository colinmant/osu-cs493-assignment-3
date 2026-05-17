const { DataTypes } = require('sequelize')

const sequelize = require('../lib/sequelize')
const bcrypt = require('bcryptjs')

const User = sequelize.define('user', {
    name: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    password: { 
        type: DataTypes.STRING, 
        allowNull: false,
        set(value) {
            this.setDataValue('password', bcrypt.hashSync(value, 4))
        }
     },
    admin: { type: DataTypes.BOOL, defaultValue: false, allowNull: false }
})

exports.User = User
exports.UserClientFields = ['name', 'email', 'password', 'admin']

/* 
* Set up relationships if needed
*/