const User = require("../models/User");
const Group = require("../models/Group");
const Player = require("../models/Player");
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { Error } = require("mongoose");
require("dotenv").config({ path: "variables.env" });

//* JWT
const createToken = (user, secret, expiresIn) => {
  console.log(user);
  const { id, email } = user;

  return jwt.sign({ id, email }, secret, { expiresIn });
};

const resolvers = {
  Query: {
    getGroups: async (_, {}, ctx) => {
      const groups = await Group.find({ creator: ctx.user.id });

      return groups;
    },
    getPlayers: async (_, {}, ctx) => {
      let players = await Player.find({ creator: ctx.user.id });

      return players;
    },
  },

  Mutation: {
    //* USUARIOS //
    //* Crear nuevo usuario
    createUser: async (_, { input }, ctx) => {
      const { email, password } = input;

      const userExists = await User.findOne({ email });

      if (userExists) {
        throw new Error("El usuario ya está registrado");
      }

      try {
        //Hashear pass
        const salt = await bcryptjs.genSalt(10);
        input.password = await bcryptjs.hash(password, salt);

        //Registrar
        const newUser = new User(input);
        newUser.save();
        return "Usuario creado correctamente";
      } catch (error) {
        console.log(error);
      }
    },
    //* Autenticar usuario
    autenticateUser: async (_, { input }, ctx) => {
      const { email, password } = input;

      //Existe
      const userExists = await User.findOne({ email });

      if (!userExists) {
        throw new Error("El usuario no existe");
      }
      //Pass correcto
      const correctPass = await bcryptjs.compare(password, userExists.password);
      if (!correctPass) {
        throw new Error("Contraseña incorrecta");
      }
      //Dar acceso

      return {
        token: createToken(userExists, process.env.SECRET, "4hr"),
      };
    },

    //* GRUPOS //
    //* Grupo nuevo
    newGroup: async (_, { input }, ctx) => {
      try {
        const group = new Group(input);

        //asociar creador
        group.creator = ctx.user.id;
        // guardar en bbdd
        const result = await group.save();

        return result;
      } catch (error) {
        console.log(error);
      }
    },

    //* Actualizar grupo
    updateGroup: async (_, { id, input }, ctx) => {
      try {
        let group = await Group.findById(id);

        if (!group) {
          throw new Error("El grupo no existe");
        }
        if (group.creator.toString() !== ctx.user.id) {
          throw new Error("No tienes permisos para modificar el grupo");
        }

        group = await Group.findOneAndUpdate({ _id: id }, input, { new: true });

        return group;
      } catch (error) {
        console.log(error);
      }
    },

    //* Eliminar grupo
    removeGroup: async (_, { id }, ctx) => {
      let group = await Group.findById(id);
      if (!group) {
        throw new Error("El grupo no existe");
      }
      if (group.creator.toString() !== ctx.user.id) {
        throw new Error("No tienes permiso para borrar este grupo");
      }
      await Group.findOneAndDelete({ _id: id });

      return "El grupo ha sido eliminado correctamente";
    },

    //* JUGADORES //
    //* Nuevo jugador
    newPlayer: async (_, { input }, ctx) => {
      try {
        const player = new Player(input);
        player.creator = ctx.user.id;

        const result = await player.save();

        return result;
      } catch (error) {
        console.log(error);
      }
    },
    //* Actualizar jugador
    updatePlayer: async (_, { id, input }, ctx) => {
      try {
        let player = await Player.findById(id);

        if (!player) {
          throw new Error("El jugador no existe");
        }

        if (player.creator.toString() !== ctx.user.id) {
          throw new Error("No tienes permisos para modificar el jugador");
        }

        player = await Player.findOneAndUpdate({ _id: id }, input, {
          new: true,
        });

        return player;
      } catch (error) {
        console.log(error);
      }
    },
    //* Eliminar jugador
    removePlayer: async (_, { id }, ctx) => {
      let player = await Player.findById(id);

      if (!player) {
        throw new Error("El jugador no existe");
      }

      if (player.creator.toString() !== ctx.user.id) {
        throw new Error("No tienes permisos para eliminar el jugador");
      }

      await Player.findOneAndDelete({ _id: id });

      return "El jugador ha sido eliminado correctamente";
    },
    //* Añadir jugador a un grupo
    addPlayerToGroup: async (_, { id, input }, ctx) => {
      try {
        let player = await Player.findById(id);

        if (!player) {
          throw new Error("El jugador no existe");
        }

        if (player.creator.toString() !== ctx.user.id) {
          throw new Error("No tienes permisos para modificar el jugador");
        }

        // Mirar que no esté ya dentro de un grupo
        player.groups.forEach((group) => {
          if (group.toString() === input.group.toString()) {
            throw new Error("Ya está en ese grupo");
          }
        });

        // Añadir el grupo y guardar
        player.groups.push(input.group.toString());
        player.save();

        return player;
      } catch (error) {
        console.log(error);
      }
    },
    //* Eliminar jugador de un grupo
    removePlayerFromGroup: async (_, { id, input }, ctx) => {
      try {
        let player = await Player.findById(id);

        if (!player) {
          throw new Error("El jugador no existe");
        }

        if (player.creator.toString() !== ctx.user.id) {
          throw new Error("No tienes permisos para modificar el jugador");
        }

        // Eliminar del array
        player.groups = player.groups.filter(
          (group) => group.toString() !== input.group.toString()
        );

        // Guardar
        player.save();

        return "Eliminado correctamente";
      } catch (error) {
        console.log(error);
      }
    },
    //* Añadir victoria a un jugador
    addPlayerWin: async (_, { id }, ctx) => {
      try {
        let player = await Player.findById(id);

        if (!player) {
          throw new Error("El jugador no existe");
        }

        if (player.creator.toString() !== ctx.user.id) {
          throw new Error("No tienes permisos para modificar el jugador");
        }

        // Añadir victoria
        player.wins += 1;

        // save
        player.save();
        console.log(player);
      } catch (error) {
        console.log(error);
      }
    },
  },
};

module.exports = resolvers;
