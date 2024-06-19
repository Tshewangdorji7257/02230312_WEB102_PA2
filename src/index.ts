import { Hono } from "hono";
import { cors } from "hono/cors";
import { PrismaClient, Prisma } from "@prisma/client";
import { HTTPException } from "hono/http-exception";
import { sign } from "hono/jwt";
import axios from "axios";
import { jwt } from "hono/jwt";
import type { JwtVariables } from "hono/jwt";

// Type definition for JWT variables
type Variables = JwtVariables;

// Create a new Hono app with JWT variables
const app = new Hono<{ Variables: Variables }>();
const prisma = new PrismaClient();

// Enable CORS for all routes
app.use("/*", cors());

// JWT authentication for protected routes
app.use(
  "/protected/*",
  jwt({
    secret: "mySecretKey",
  })
);

// Endpoint for user registration
app.post("/register", async (c) => {
  const body = await c.req.json();
  const email = body.email;
  const password = body.password;

  // Hash the password using bcrypt
  const bcryptHash = await Bun.password.hash(password, {
    algorithm: "bcrypt",
    cost: 4,
  });

  try {
    // Create a new user in the database
    const user = await prisma.user.create({
      data: {
        email: email,
        hashedPassword: bcryptHash,
      },
    }); 

    // Return success message
    return c.json({ message: `${user.email} created successfully` });
  } catch (e) {
    // Handle unique constraint error for email
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      if (e.code === "P2002") {
        return c.json({ message: "Email already exists" });
      }
    }
    // Throw internal server error for other exceptions
    throw new HTTPException(500, { message: "Internal Server Error" });
  }
});

// Endpoint for user login
app.post("/login", async (c) => {
  try {
    const body = await c.req.json();
    const email = body.email;
    const password = body.password;

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: email },
      select: { id: true, hashedPassword: true },
    });

    if (!user) {
      return c.json({ message: "User not found" }, 404);
    }

    // Verify the password
    const match = await Bun.password.verify(
      password,
      user.hashedPassword,
      "bcrypt"
    );

    if (match) {
      // Create JWT payload and sign the token
      const payload = {
        sub: user.id,
        exp: Math.floor(Date.now() / 1000) + 60 * 60, // Token expires in 60 minutes
      };
      const secret = "mySecretKey";
      const token = await sign(payload, secret);

      if (typeof token !== "string") {
        console.error("Token signing failed", token);
        throw new HTTPException(500, { message: "Token signing failed" });
      }

      // Return success message with token
      return c.json({ message: "Login successful", token: token });
    } else {
      throw new HTTPException(401, { message: "Invalid credentials" });
    }
  } catch (error) {
    console.error("Login error:", error);
    if (error instanceof HTTPException) {
      throw error;
    } else {
      throw new HTTPException(500, { message: "Internal Server Error" });
    }
  }
});

// Endpoint for fetching Pokémon data
app.get("/pokemon/:name", async (c) => {
  const { name } = c.req.param();

  try {
    // Fetch Pokémon data from external API
    const response = await axios.get(
      `https://pokeapi.co/api/v2/pokemon/${name}`
    );
    return c.json({ data: response.data });
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response && error.response.status === 404) {
        return c.json({ message: "Your Pokémon was not found!" }, 404);
      }
      return c.json(
        { message: "An error occurred while fetching the Pokémon data" },
        500
      );
    } else {
      return c.json({ message: "An unexpected error occurred" }, 500);
    }
  }
});

// Endpoint for catching and saving a Pokémon (protected)
app.post("/protected/catch", async (c) => {
  try {
    const payload = c.get("jwtPayload");
    if (!payload) {
      throw new HTTPException(401, { message: "YOU ARE UNAUTHORIZED" });
    }

    const body = await c.req.json();
    const pokemonName = body.name;

    if (!pokemonName) {
      throw new HTTPException(400, { message: "Pokemon name is required" });
    }

    // Find or create the Pokémon in the database
    let pokemon = await prisma.pokemon.findUnique({
      where: { name: pokemonName },
    });

    if (!pokemon) {
      pokemon = await prisma.pokemon.create({
        data: { name: pokemonName },
      });
    }

    // Save the caught Pokémon
    const caughtPokemon = await prisma.caughtPokemon.create({
      data: {
        userId: payload.sub,
        pokemonId: pokemon.id,
      },
    });

    // Return success message
    return c.json({ message: "Pokemon caught", data: caughtPokemon });
  } catch (error) {
    console.error(error);
    if (error instanceof HTTPException) {
      throw error;
    } else {
      throw new HTTPException(500, { message: "Internal Server Error" });
    }
  }
});

// Endpoint for releasing a Pokémon (protected)
app.delete("/protected/release/:id", async (c) => {
  const payload = c.get("jwtPayload");
  if (!payload) {
    throw new HTTPException(401, { message: "YOU ARE UNAUTHORIZED" });
  }

  const { id } = c.req.param();

  try {
    // Delete the caught Pokémon record
    const deleteResult = await prisma.caughtPokemon.deleteMany({
      where: { id: id, userId: payload.sub },
    });

    if (deleteResult.count === 0) {
      return c.json({ message: "Pokemon not found or not owned by user" }, 404);
    }

    // Return success message
    return c.json({ message: "Pokemon is released" });
  } catch (error) {
    return c.json(
      { message: "An error occurred while releasing the Pokemon" },
      500
    );
  }
});

// Endpoint for retrieving caught Pokémon (protected)
app.get("/protected/caught", async (c) => {
  const payload = c.get("jwtPayload");
  if (!payload) {
    throw new HTTPException(401, { message: "YOU ARE UNAUTHORIZED" });
  }

  try {
    // Find all caught Pokémon for the user
    const caughtPokemon = await prisma.caughtPokemon.findMany({
      where: { userId: payload.sub },
      include: { pokemon: true },
    });

    if (!caughtPokemon.length) {
      return c.json({ message: "No Pokémon found." });
    }

    // Return caught Pokémon data
    return c.json({ data: caughtPokemon });
  } catch (error) {
    console.error("Error fetching caught Pokémon:", error);
    return c.json(
      { message: "An error occurred while fetching caught Pokémon" },
      500
    );
  }
});

export default app;
