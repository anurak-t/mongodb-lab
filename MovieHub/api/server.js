import "dotenv/config";
import bcrypt from "bcryptjs";
import express from "express";
import { ObjectId } from "mongodb";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { requireAuth, signAccessToken, toPublicUser } from "./auth.js";
import {
  closeDatabase,
  connectDatabase,
  getCommentsCollection,
  getMoviesCollection,
  getUsersCollection
} from "./db.js";
import {
  createMovieDocument,
  createMovieUpdate,
  escapeRegex,
  parseMovieInput
} from "./movie-utils.js";
import {
  createMovie,
  deleteMovie,
  findMovieById,
  findUser,
  getDashboardData,
  listMovies,
  registerUser,
  updateMovie
} from "./labs.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uiDirectory = path.resolve(__dirname, "../ui");
const port = Number(process.env.PORT || 3000);
const app = express();

app.use(express.json({ limit: "100kb" }));
app.use(express.static(uiDirectory));

function cleanEmail(value) {
  return String(value ?? "").trim().toLowerCase();
}

function objectIdOrThrow(id) {
  if (!ObjectId.isValid(id)) throw new Error("Movie id is not valid.");
  return new ObjectId(id);
}

function clampNumber(value, fallback, min, max) {
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;
  return Math.min(Math.max(Math.floor(number), min), max);
}

app.get("/api/health", async (_req, res) => {
  res.json({ status: "ok", service: "MovieHub API" });
});

app.post("/api/auth/register", async (req, res, next) => {
  try {
    const name = String(req.body?.name ?? "").trim();
    const email = cleanEmail(req.body?.email);
    const password = String(req.body?.password ?? "");

    if (name.length < 2) throw new Error("Name must contain at least 2 characters.");
    if (!/^\S+@\S+\.\S+$/.test(email)) throw new Error("Enter a valid email address.");
    if (password.length < 8) throw new Error("Password must contain at least 8 characters.");

    const user = {
      name,
      email,
      passwordHash: await bcrypt.hash(password, 12),
      createdAt: new Date()
    };

    const createdUser = await registerUser(getUsersCollection(), user);

    if (!createdUser?._id) {
      throw new Error("Register function must return the created user with an _id.");
    }

    res.status(201).json({
      token: signAccessToken(createdUser),
      user: toPublicUser(createdUser)
    });
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(409).json({ message: "An account already exists for this email." });
    }
    return next(error);
  }
});

app.post("/api/auth/login", async (req, res, next) => {
  try {
    const email = cleanEmail(req.body?.email);
    const password = String(req.body?.password ?? "");
    const user = await findUser(getUsersCollection(), { email });

    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).json({ message: "Email or password doesn't match." });
    }

    return res.json({ token: signAccessToken(user), user: toPublicUser(user) });
  } catch (error) {
    return next(error);
  }
});

app.get("/api/auth/me", requireAuth, async (req, res, next) => {
  try {
    const user = await findUser(
      getUsersCollection(),
      { _id: objectIdOrThrow(req.user.sub) },
      { projection: { name: 1, email: 1 } }
    );

    if (!user) return res.status(404).json({ message: "User not found." });
    return res.json({ user: toPublicUser(user) });
  } catch (error) {
    return next(error);
  }
});

app.get("/api/dashboard", requireAuth, async (_req, res, next) => {
  try {
    const dashboard = await getDashboardData(
      getMoviesCollection(),
      getCommentsCollection()
    );

    return res.json(dashboard);
  } catch (error) {
    return next(error);
  }
});

app.get("/api/movies", requireAuth, async (req, res, next) => {
  try {
    const page = clampNumber(req.query.page, 1, 1, 100000);
    const limit = clampNumber(req.query.limit, 12, 1, 50);
    const filter = {};
    const search = String(req.query.q || "").trim();
    const genre = String(req.query.genre || "").trim();
    const minimumRating = Number(req.query.minRating);

    if (search) filter.title = { $regex: escapeRegex(search), $options: "i" };
    if (genre) filter.genres = genre;
    if (Number.isFinite(minimumRating)) filter["imdb.rating"] = { $gte: minimumRating };

    const sortMap = {
      rating: { "imdb.rating": -1, "imdb.votes": -1 },
      year: { year: -1, title: 1 },
      title: { title: 1 }
    };
    const sort = sortMap[req.query.sort] || sortMap.rating;
    const result = await listMovies(getMoviesCollection(), {
      filter,
      sort,
      page,
      limit,
      projection: {
        title: 1,
        year: 1,
        runtime: 1,
        genres: 1,
        cast: 1,
        poster: 1,
        plot: 1,
        type: 1,
        createdBy: 1,
        "imdb.rating": 1
      }
    });

    return res.json(result);
  } catch (error) {
    return next(error);
  }
});

app.get("/api/movies/:id", requireAuth, async (req, res, next) => {
  try {
    const movie = await findMovieById(
      getMoviesCollection(),
      objectIdOrThrow(req.params.id)
    );
    if (!movie) return res.status(404).json({ message: "Movie not found." });
    return res.json({ movie });
  } catch (error) {
    return next(error);
  }
});

app.post("/api/movies", requireAuth, async (req, res, next) => {
  try {
    const input = parseMovieInput(req.body);
    const document = createMovieDocument(input, req.user.sub);
    const movie = await createMovie(getMoviesCollection(), document);
    return res.status(201).json({ movie });
  } catch (error) {
    return next(error);
  }
});

app.put("/api/movies/:id", requireAuth, async (req, res, next) => {
  try {
    const input = parseMovieInput(req.body, { partial: true });
    const movie = await updateMovie(
      getMoviesCollection(),
      { _id: objectIdOrThrow(req.params.id), createdBy: req.user.sub },
      createMovieUpdate(input)
    );

    if (!movie) return res.status(404).json({ message: "Movie not found." });
    return res.json({ movie });
  } catch (error) {
    return next(error);
  }
});

app.delete("/api/movies/:id", requireAuth, async (req, res, next) => {
  try {
    const deletedCount = await deleteMovie(getMoviesCollection(), {
      _id: objectIdOrThrow(req.params.id),
      createdBy: req.user.sub
    });
    if (!deletedCount) return res.status(404).json({ message: "Movie not found." });
    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
});

app.get("/app", (_req, res) => {
  res.sendFile(path.join(uiDirectory, "app.html"));
});

app.use((error, _req, res, _next) => {
  const message = error?.message || "Something went wrong.";
  const status = /required|valid|must|not allowed|not supported|JSON object/i.test(message) ? 400 : 500;
  console.error(error);
  res.status(status).json({ message });
});

async function start() {
  await connectDatabase();
  app.listen(port, () => {
    console.log(`MovieHub is ready at http://localhost:${port}`);
  });
}

start().catch(async (error) => {
  console.error("MovieHub could not start:", error.message);
  await closeDatabase();
  process.exit(1);
});
