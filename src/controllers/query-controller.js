/* eslint-disable jsdoc/require-jsdoc */

import { VectorManager } from '../functions/database-interaction/vectorManager.js'

const vectorManager = new VectorManager()

export class QueryController {
  async query(req, res) {
    try {
      const query = req.body.query

      const results = await vectorManager.query(query)

      //   console.log(results)

      console.log(JSON.stringify(results, null, 2))
      //   console.log(JSON.parse())

      res.status(200).json(results)
    } catch (error) {
      res.status(500).send({ error: error.message })
      console.log(error)
    }
  }
}
