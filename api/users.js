const { Router } = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const { Business } = require('../models/business')
const { Photo } = require('../models/photo')
const { Review } = require('../models/review')
const { User, UserClientFields } = require('../models/user')
const { ValidationError } = require('sequelize')
const { generateAuthToken, requireAuth } = require('../lib/auth')




const router = Router()

/*
 * Route to list all of a user's businesses.
 */
router.get('/:userId/businesses', requireAuth, async function (req, res) {
  if (req.params.userId != res.locals.user && !res.locals.admin) {
    return res.status(403).send({ error: 'Unauthorized' })
  }
  const userId = req.params.userId
  const userBusinesses = await Business.findAll({ where: { ownerId: userId } })
  res.status(200).json({
    businesses: userBusinesses
  })
})

/*
 * Route to list all of a user's reviews.
 */
router.get('/:userId/reviews', requireAuth, async function (req, res) {
  if (req.params.userId != res.locals.user && !res.locals.admin) {
    return res.status(403).send({ error: 'Unauthorized' })
  }
  const userId = req.params.userId
  const userReviews = await Review.findAll({ where: { userId: userId } })
  res.status(200).json({
    reviews: userReviews
  })
})

/*
 * Route to list all of a user's photos.
 */
router.get('/:userId/photos', requireAuth, async function (req, res) {
  if (req.params.userId != res.locals.user && !res.locals.admin) {
    return res.status(403).send({ error: 'Unauthorized' })
  }
  const userId = req.params.userId
  const userPhotos = await Photo.findAll({ where: { userId: userId } })
  res.status(200).json({
    photos: userPhotos
  })
})


/*
* Route to create a user
*/
router.post('/', async function (req, res, next) {
  if (req.body.admin) {
    const authHeader = req.get('Authorization') || ''
    const token = authHeader.split(' ')[1]
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET)
      if (!payload.admin) {
        return res.status(403).send({ error: 'Only admins can create admin users' })
      }
    } catch (err) {
      return res.status(403).send({ error: 'Only admins can create admin users' })
    }
  }
  try {
    const fields = req.body.admin ? [...UserClientFields, 'admin'] : UserClientFields
    const user = await User.create(req.body, { fields })
    res.status(201).send({ id: user.id })
  } catch (e) {
    if (e instanceof ValidationError) {
      res.status(400).send({ error: e.message })
    } else {
      throw e
    }
  }
})

/*
* Route to allow registered users to login using their email and password
*/
router.post('/login', async function (req, res, next) {
  try {
    const { email, password } = req.body
    const user = await User.findOne({ where: { email: email } })
    if (user && await bcrypt.compare(password, user.password)) {
      const token = generateAuthToken(user.id, user.admin)
      res.status(200).send({ token })
    } else {
      res.status(401).send({ error: 'Invalid Credentials' })
    }
  } catch (e) {
    next(e)
  }
})

/*
* Route to get information about a specified user
*/
router.get('/:userId', requireAuth, async function (req, res, next) {
  if (req.params.userId != res.locals.user && !res.locals.admin) {
    return res.status(403).send({ error: 'Unauthorized' })
  }
  try {
    const user = await User.findByPk(req.params.userId, {
      attributes: { exclude: ['password'] }
    })
    if (user) {
      res.status(200).send(user)
    } else {
      next()
    }
  } catch (e) {
    next(e)
  }
})


module.exports = router
