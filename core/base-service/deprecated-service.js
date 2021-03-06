'use strict'

const Joi = require('joi')
const camelcase = require('camelcase')
const BaseService = require('./base')
const { isValidCategory } = require('./categories')
const { Deprecated } = require('./errors')
const { isValidRoute } = require('./route')

const attrSchema = Joi.object({
  route: isValidRoute,
  name: Joi.string(),
  label: Joi.string(),
  category: isValidCategory,
  // The content of examples is validated later, via `transformExamples()`.
  examples: Joi.array().default([]),
  message: Joi.string(),
  dateAdded: Joi.date().required(),
}).required()

function deprecatedService(attrs) {
  const { route, name, label, category, examples, message } = Joi.attempt(
    attrs,
    attrSchema,
    `Deprecated service for ${attrs.route.base}`
  )

  return class DeprecatedService extends BaseService {
    static name = name
      ? `Deprecated${name}`
      : `Deprecated${camelcase(route.base.replace(/\//g, '_'), {
          pascalCase: true,
        })}`

    static category = category
    static isDeprecated = true
    static route = route
    static examples = examples
    static defaultBadgeData = { label }

    async handle() {
      throw new Deprecated({ prettyMessage: message })
    }
  }
}

module.exports = deprecatedService
