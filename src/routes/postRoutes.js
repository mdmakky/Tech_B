import express from "express"
import { postController } from "../controllers/postController.js"
import { requireAuth } from "../middlewares/authMiddleware.js"

const router = express.Router()

router.get('/', postController.index)

router.get('/new/create', requireAuth, postController.showCreatePost)
router.post('/new/create', requireAuth, postController.createPost)

router.get('/:slug', postController.show)

router.get('/:slug/edit', requireAuth, postController.showEditePost)
router.post('/:slug/edit', requireAuth, postController.update)
router.post('/:slug/delete', requireAuth, postController.deletePost)

export { router }