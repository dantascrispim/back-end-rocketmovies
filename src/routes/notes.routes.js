
const { Router } = require("express");

const NotesController = require("../controllers/NotesController");
const ensureAuthenticated = require("../middleware/ensureAuthenticated");

const notesRoutes = Router()


const notesController = new NotesController();
notesRoutes.use (ensureAuthenticated);

//ROTA --->
notesRoutes.post("/", notesController.create);
notesRoutes.get("/:id", notesController.show);
notesRoutes.delete("/:id", notesController.delete);
notesRoutes.get("/", notesController.index);


module.exports = notesRoutes;