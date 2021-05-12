const express = require('express');
const router = express.Router();

const todoController = require('../controllers/todoController');
const authController = require('../controllers/authController');

router.use( authController.protect );

router
    .route('/')
    .post( todoController.createTodo )
    .get(  todoController.getAllTodo )
    .delete( todoController.deleteAllTodo );

router
    .route('/:slug')
    .get( todoController.getTodo );

router
    .route('/all/complete')
    .get(
        todoController.getAllComplete, 
        todoController.getAllTodo 
    );

router
    .route('/all/incomplete')
    .get(
        todoController.getAllIncomplete,
        todoController.getAllTodo
    );

router
    .route('/:id')
    .delete(todoController.deleteTodo)
    .patch(todoController.updateTodo );

module.exports = router;