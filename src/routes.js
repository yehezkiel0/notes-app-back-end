const {
  addNoteHandler,
  getAllNotesHandler,
  getNoteByIdHandler,
  editNoteByIdHandler,
  deleteNoteByIdHandler,
  updateNoteStatusHandler,
  toggleBookmarkHandler,
  importNotesHandler,
  permanentDeleteHandler, // Keeping this just in case, though deleteNoteById is likely primary
} = require("./handler");
const {
  registerHandler,
  loginHandler,
  getUserByIdHandler,
  updateProfileHandler,
} = require("./userHandler");

const routes = [
  // User Authentication Routes
  {
    method: "POST",
    path: "/register",
    handler: registerHandler,
  },
  {
    method: "POST",
    path: "/login",
    handler: loginHandler,
  },
  {
    method: "GET",
    path: "/users/{id}",
    handler: getUserByIdHandler,
  },
  {
    method: "PUT",
    path: "/users/{id}",
    handler: updateProfileHandler,
    options: {
      payload: {
        allow: "multipart/form-data",
        multipart: true,
        output: "stream",
        parse: true,
        maxBytes: 10485760, // 10MB
      },
    },
  },
  {
    method: "POST",
    path: "/notes",
    handler: addNoteHandler,
    options: {
      payload: {
        multipart: true,
        output: "stream",
        parse: true,
        maxBytes: 10 * 1024 * 1024, // 10MB
      },
    },
  },
  {
    method: "GET",
    path: "/notes",
    handler: getAllNotesHandler,
  },
  {
    method: "GET",
    path: "/notes/{id}",
    handler: getNoteByIdHandler,
  },
  {
    method: "PUT",
    path: "/notes/{id}",
    handler: editNoteByIdHandler,
    options: {
      payload: {
        multipart: true,
        output: "stream",
        parse: true,
        maxBytes: 10 * 1024 * 1024, // 10MB
      },
    },
  },
  {
    method: "DELETE",
    path: "/notes/{id}",
    handler: deleteNoteByIdHandler,
  },
  {
    method: "PATCH",
    path: "/notes/{id}/status",
    handler: updateNoteStatusHandler,
  },
  {
    method: "PUT",
    path: "/notes/{id}/bookmark",
    handler: toggleBookmarkHandler,
  },
  {
    method: "POST",
    path: "/notes/import",
    handler: importNotesHandler,
    options: {
      payload: {
        multipart: true,
        output: "stream",
        parse: true,
        maxBytes: 10 * 1024 * 1024, // 10MB
      },
    },
  },

  {
    method: "DELETE",
    path: "/notes/{id}/permanent",
    handler: permanentDeleteHandler,
  },
];

module.exports = routes;
