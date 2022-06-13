const bookshelf = require('../bookshelf')

const User = bookshelf.model('User',{
    tableName: 'users'
})

const Role = bookshelf.model('Role',{
    tableName: 'roles'
})

module.exports = { User, Role };
