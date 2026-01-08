const { nanoid } = require("nanoid");
const fs = require("fs");
const path = require("path");
const Note = require("./models/Note");

const addNoteHandler = async (request, h) => {
  const {
    title,
    tags,
    body,
    status = "todo",
    bookmarked = false,
    category = "general",
    priority = "medium",
    reminder = null,
  } = request.payload;
  let imageUrl = null;

  // Handle image upload
  if (request.payload.image) {
    const { image } = request.payload;
    const fileExtension = image.hapi.filename.split(".").pop();
    const imageName = `${nanoid()}.${fileExtension}`;
    const imagePath = path.join(__dirname, "..", "uploads", imageName);

    const fileStream = fs.createWriteStream(imagePath);
    image.pipe(fileStream);

    imageUrl = `/uploads/${imageName}`;
  }

  const voiceNote = request.payload.voiceNote || null;

  // Parse tags if it's a string (sent as JSON from frontend)
  let parsedTags = tags;
  if (typeof tags === "string") {
    try {
      parsedTags = JSON.parse(tags);
    } catch (error) {
      // If parse fails, assume it's a single tag or comma-separated
      parsedTags = tags.split(",").map((t) => t.trim());
    }
  }

  const id = nanoid(16);

  const newNote = new Note({
    id,
    title,
    tags: parsedTags,
    body,
    status,
    bookmarked,
    voiceNote,
    imageUrl,
    category,
    priority,
    reminder,
  });

  try {
    await newNote.save();
    const response = h.response({
      status: "success",
      message: "Catatan berhasil ditambahkan",
      data: {
        noteId: id,
      },
    });
    response.code(201);
    return response;
  } catch (error) {
    console.error(error);
    const response = h.response({
      status: "fail",
      message: "Catatan gagal ditambahkan",
    });
    response.code(500);
    return response;
  }
};

const getAllNotesHandler = async () => {
  const notes = await Note.find({});
  return {
    status: "success",
    data: {
      notes,
    },
  };
};

const getNoteByIdHandler = async (request, h) => {
  const { id } = request.params;
  const note = await Note.findOne({ id });

  if (note) {
    return {
      status: "success",
      data: {
        note,
      },
    };
  }

  const response = h.response({
    status: "fail",
    message: "Catatan tidak ditemukan",
  });
  response.code(404);
  return response;
};

const editNoteByIdHandler = async (request, h) => {
  const { id } = request.params;
  const {
    title,
    tags,
    body,
    status,
    bookmarked,
    voiceNote,
    category,
    priority,
    reminder,
  } = request.payload;

  let imageUrl = null;
  // Handle image upload
  if (request.payload.image) {
    const { image } = request.payload;
    const fileExtension = image.hapi.filename.split(".").pop();
    const imageName = `${nanoid()}.${fileExtension}`;
    const imagePath = path.join(__dirname, "..", "uploads", imageName);
    const fileStream = fs.createWriteStream(imagePath);
    image.pipe(fileStream);
    imageUrl = `/uploads/${imageName}`;
  }

  // Parse tags if it's a string (sent as JSON from frontend)
  let parsedTags = tags;
  if (typeof tags === "string") {
    try {
      parsedTags = JSON.parse(tags);
    } catch (error) {
      parsedTags = tags.split(",").map((t) => t.trim());
    }
  }

  const updateData = {
    title,
    tags: parsedTags,
    body,
    status,
    bookmarked,
    voiceNote,
    category,
    priority,
    reminder,
    updatedAt: Date.now(),
  };

  if (imageUrl) updateData.imageUrl = imageUrl;

  // Remove undefined fields
  Object.keys(updateData).forEach(
    (key) => updateData[key] === undefined && delete updateData[key]
  );

  const result = await Note.updateOne({ id }, updateData);

  if (result.matchedCount > 0) {
    const response = h.response({
      status: "success",
      message: "Catatan berhasil diperbarui",
    });
    response.code(200);
    return response;
  }

  const response = h.response({
    status: "fail",
    message: "Gagal memperbarui catatan. Id tidak ditemukan",
  });
  response.code(404);
  return response;
};

const deleteNoteByIdHandler = async (request, h) => {
  const { id } = request.params;
  const result = await Note.deleteOne({ id });

  if (result.deletedCount > 0) {
    const response = h.response({
      status: "success",
      message: "Catatan berhasil dihapus",
    });
    response.code(200);
    return response;
  }

  const response = h.response({
    status: "fail",
    message: "Catatan gagal dihapus. Id tidak ditemukan",
  });
  response.code(404);
  return response;
};

const updateNoteStatusHandler = async (request, h) => {
  const { id } = request.params;
  const { status } = request.payload;

  const result = await Note.updateOne(
    { id },
    { status, updatedAt: Date.now() }
  );

  if (result.matchedCount > 0) {
    const response = h.response({
      status: "success",
      message: "Status catatan berhasil diperbarui",
    });
    response.code(200);
    return response;
  }

  const response = h.response({
    status: "fail",
    message: "Gagal memperbarui status. Id tidak ditemukan",
  });
  response.code(404);
  return response;
};

const toggleBookmarkHandler = async (request, h) => {
  const { id } = request.params;

  const note = await Note.findOne({ id });
  if (!note) {
    const response = h.response({
      status: "fail",
      message: "Gagal memperbarui bookmark. Id tidak ditemukan",
    });
    response.code(404);
    return response;
  }

  note.bookmarked = !note.bookmarked;
  note.updatedAt = Date.now();
  await note.save();

  const response = h.response({
    status: "success",
    message: `Catatan berhasil ${
      note.bookmarked ? "dibookmark" : "dihapus dari bookmark"
    }`,
    data: {
      bookmarked: note.bookmarked,
    },
  });
  response.code(200);
  return response;
};

const importNotesHandler = async (request, h) => {
  try {
    let importedNotes;
    if (request.payload && request.payload.notes) {
      const file = request.payload.notes;
      const buffer = await new Promise((resolve, reject) => {
        const chunks = [];
        file.on("data", (chunk) => chunks.push(chunk));
        file.on("end", () => resolve(Buffer.concat(chunks)));
        file.on("error", reject);
      });
      importedNotes = JSON.parse(buffer.toString("utf8"));
    } else if (request.payload) {
      importedNotes = request.payload.notes || request.payload;
    }

    if (!importedNotes || !Array.isArray(importedNotes)) {
      return h.response({ status: "fail", message: "Invalid data" }).code(400);
    }

    const newNotes = importedNotes.map((note) => ({
      ...note,
      id: nanoid(16),
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    await Note.insertMany(newNotes);

    const response = h.response({
      status: "success",
      message: `${newNotes.length} notes imported successfully`,
      data: {
        importedCount: newNotes.length,
      },
    });
    response.code(201);
    return response;
  } catch (error) {
    console.error(error);
    const response = h.response({
      status: "fail",
      message: "Failed to import notes",
    });
    response.code(400);
    return response;
  }
};

const permanentDeleteHandler = async (request, h) =>
  deleteNoteByIdHandler(request, h);

module.exports = {
  addNoteHandler,
  getAllNotesHandler,
  getNoteByIdHandler,
  editNoteByIdHandler,
  deleteNoteByIdHandler,
  updateNoteStatusHandler,
  toggleBookmarkHandler,
  importNotesHandler,
  permanentDeleteHandler,
};
