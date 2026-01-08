const bcrypt = require("bcryptjs");
const { nanoid } = require("nanoid");
const fs = require("fs");
const path = require("path");
const User = require("./models/User");

const registerHandler = async (request, h) => {
  const { name, email, password } = request.payload;

  // validasi input sederhana
  if (!name || !email || !password) {
    const response = h.response({
      status: "fail",
      message: "Nama, email, dan password wajib diisi",
    });
    response.code(400);
    return response;
  }

  // cek email duplicate
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    const response = h.response({
      status: "fail",
      message: "Email sudah terdaftar",
    });
    response.code(400);
    return response;
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const id = nanoid(16);

  const newUser = new User({
    id,
    name,
    email,
    password: hashedPassword,
  });

  await newUser.save();

  const response = h.response({
    status: "success",
    message: "User berhasil didaftarkan",
    data: {
      userId: id,
    },
  });
  response.code(201);
  return response;
};

const loginHandler = async (request, h) => {
  const { email, password } = request.payload;

  const user = await User.findOne({ email });
  if (!user) {
    const response = h.response({
      status: "fail",
      message: "Email atau password salah",
    });
    response.code(401);
    return response;
  }

  const isValidPassword = await bcrypt.compare(password, user.password);
  if (!isValidPassword) {
    const response = h.response({
      status: "fail",
      message: "Email atau password salah",
    });
    response.code(401);
    return response;
  }

  // Dalam implementasi nyata, gunakan JWT. Di sini kita kembalikan user info dasar.
  const response = h.response({
    status: "success",
    message: "Login berhasil",
    data: {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl,
      },
    },
  });
  response.code(200);
  return response;
};

const getUserByIdHandler = async (request, h) => {
  const { id } = request.params;
  const user = await User.findOne({ id }, "-password"); // exclude password

  if (!user) {
    const response = h.response({
      status: "fail",
      message: "User tidak ditemukan",
    });
    response.code(404);
    return response;
  }

  return {
    status: "success",
    data: {
      user,
    },
  };
};

const updateProfileHandler = async (request, h) => {
  const { id } = request.params;
  const { name } = request.payload;

  let avatarUrl = null;

  // Handle avatar upload
  if (request.payload.avatar) {
    const { avatar } = request.payload;
    const fileExtension = avatar.hapi.filename.split(".").pop();
    const imageName = `avatar-${id}-${nanoid(8)}.${fileExtension}`;
    const imagePath = path.join(__dirname, "..", "uploads", imageName);

    const fileStream = fs.createWriteStream(imagePath);
    avatar.pipe(fileStream);

    avatarUrl = `/uploads/${imageName}`;
  }

  const updateData = {
    updatedAt: Date.now(),
  };

  if (name) updateData.name = name;
  if (avatarUrl) updateData.avatarUrl = avatarUrl;

  const result = await User.updateOne({ id }, updateData);

  if (result.matchedCount > 0) {
    // Fetch updated user to return fresh data
    const updatedUser = await User.findOne({ id }, "-password");

    const response = h.response({
      status: "success",
      message: "Profil berhasil diperbarui",
      data: {
        user: updatedUser,
      },
    });
    response.code(200);
    return response;
  }

  const response = h.response({
    status: "fail",
    message: "Gagal memperbarui profil",
  });
  response.code(404);
  return response;
};

module.exports = {
  registerHandler,
  loginHandler,
  getUserByIdHandler,
  updateProfileHandler,
};
