const BaseRoute = require('./base/baseRoute')
const Joi = require('@hapi/joi')
const Boom = require('@hapi/boom');
const Jwt = require('jsonwebtoken')
const PasswordHelper = require('./../helpers/passwordHelper')
const failAction = (request, headers, erro) => {
  throw erro;
}
const USER = {
  username: 'xuxadasilva',
  password: '123'
}

class AuthRoutes extends BaseRoute {
  constructor(secret, db) {
    super()
    this.secret = secret
    this.db = db
  }

  login() {
    return {
      path: '/login',
      method: 'POST',
      config: {
        auth: false,
        tags: ['api'],
        description: 'Obter token',
        notes: 'faz login com user e senha do banco',
        validate: {
          failAction,
          payload: Joi.object({
            username: Joi.string().required(),
            password: Joi.string().required()
          })
        }
      },
      handler: async (request) => {
        const { username, password } = request.payload
        const [user] = await this.db.read({
          username: username.toLowerCase()
        })
        if(!user) {
          return Boom.unauthorized('O Usuário informado não existe!')
        }
        const match = await PasswordHelper.comparePassword(password, user.password)
        if(!match) {
          return Boom.unauthorized('Usuário ou senha invalidos!')
        }
        // if(username.toLowerCase() !== USER.username.toLowerCase() ||
        //   password !== USER.password
        // )
        //   return Boom.unauthorized()

        const token = Jwt.sign({
          username: username,
          id: user.id
        }, this.secret)

        return {
          token
        }
      }
    }
  }
}

module.exports = AuthRoutes