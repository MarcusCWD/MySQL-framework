const bookshelf = require('../bookshelf')

const User = bookshelf.model('User',{
    tableName: 'users'
})

const Role = bookshelf.model('Role',{
    tableName: 'roles'
})

const BlacklistedToken = bookshelf.model('BlacklistedToken',{
    tableName: 'blacklisted_tokens'
})

module.exports = { User, Role, BlacklistedToken };
