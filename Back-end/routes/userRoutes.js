const express = require("express");
const router = express.Router();

const {
  getAllUsers,
  getUserById,
  toggleUserActive,
  createAdmin,
  updateUser,
} = require("../controllers/userController");

const {protect} = require("../middlewares/auth");
const {authorize} = require("../middlewares/role");

// All routes: Auth + Super Admin only
router.use(protect);
router.use(authorize('super_admin'));

router.get('/', getAllUsers);
router.post('/create-admin', createAdmin);
router.get('/:id', getUserById);
router.put('/:id', updateUser);
router.patch('/:id/toggle', toggleUserActive);

module.exports = router;
