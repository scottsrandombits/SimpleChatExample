import {
  asNexusMethod,
  makeSchema,
  mutationType,
  queryType,
  stringArg,
  subscriptionType,
} from "nexus";
import { GraphQLDateTime } from "graphql-iso-date";
import { Context } from "./context";
import { CommentType, RoomType, UserType } from "./graphql/types/types";
import { sign, verify } from "jsonwebtoken";
import { Member } from ".prisma/client";

export const DateTime = asNexusMethod(GraphQLDateTime, "date");

const Subscription = subscriptionType({
  definition(t) {
    t.field("addMember", {
      type: RoomType,
      subscribe(_root, _args, ctx: Context) {
        return ctx.pubsub.asyncIterator("newMember");
      },
      resolve(payload) {
        return payload;
      },
    });
    t.field("removeMember", {
      type: RoomType,
      subscribe(_root, _args, ctx: Context) {
        return ctx.pubsub.asyncIterator("deleteMember");
      },
      resolve(payload) {
        return payload;
      },
    });
    t.field("addComment", {
      type: CommentType,
      subscribe(_root, _args, ctx: Context) {
        return ctx.pubsub.asyncIterator("newComment");
      },
      resolve(payload) {
        return payload;
      },
    });
  },
});

const Query = queryType({
  definition(t) {
    t.list.field("fetchRooms", {
      type: RoomType,
      resolve(_parent, _args, ctx: Context) {
        return ctx.prisma.room.findMany({});
      },
    }),
      t.list.field("allComments", {
        type: CommentType,
        resolve(_parent, _args, ctx: Context) {
          return ctx.prisma.comment.findMany();
        },
      });
    t.field("fetchRoom", {
      type: RoomType,
      args: { slug: stringArg() },
      async resolve(_, args, ctx: Context) {
        const room = await ctx.prisma.room.findFirst({
          where: { id: parseInt(args.slug) },
        });

        return room;
      },
    }),
      t.field("currentUser", {
        type: UserType,
        args: { token: stringArg() },
        async resolve(_, args, ctx: Context) {
          const decode: any = await verify(args.token, "secret");

          return ctx.prisma.user.findFirst({
            where: {
              username: decode.username,
            },
          });
        },
      });
  },
});

const Mutation = mutationType({
  definition(t) {
    t.field("addMember", {
      type: RoomType,
      args: { username: stringArg(), slug: stringArg() },
      async resolve(_, args, ctx: Context) {
        const room = await ctx.prisma.room.findFirst({
          where: { id: parseInt(args.slug) },
        });

        const user = await ctx.prisma.user.findFirst({
          where: { username: args.username },
        });

        const alreadyMember = await ctx.prisma.room
          .findFirst({
            where: {
              id: parseInt(args.slug),
            },
          })
          .members();

        if (
          alreadyMember.find((member) => {
            return member.userId === user.id;
          })
        ) {
          return room;
        }

        const updatedRoom = await ctx.prisma.room.update({
          where: { id: room.id },
          data: {
            members: {
              create: {
                user: { connect: { id: user.id } },
              },
            },
          },
        });

        if (updatedRoom) {
          try {
            ctx.pubsub.publish("newMember", updatedRoom);
          } catch (error) {
            console.error(error);
          }
        }

        return updatedRoom;
      },
    });
    t.field("removeMember", {
      type: RoomType,
      args: { username: stringArg(), slug: stringArg() },
      async resolve(_, args, ctx: Context) {
        const room = await ctx.prisma.room.findFirst({
          where: { id: parseInt(args.slug) },
        });

        const user = await ctx.prisma.user.findFirst({
          where: { username: args.username },
        });

        const member = await ctx.prisma.member.findFirst({
          where: { userId: user.id },
        });

        const updatedRemove = await ctx.prisma.room.update({
          where: { id: room.id },
          data: { members: { delete: { id: member.id } } },
        });

        if (updatedRemove) {
          try {
            ctx.pubsub.publish("deleteMember", updatedRemove);
          } catch (error) {
            console.error(error);
          }
        }

        return updatedRemove;
      },
    });
    t.field("createRoom", {
      type: RoomType,
      args: { name: stringArg() },
      async resolve(_, args, ctx: Context) {
        return ctx.prisma.room.create({
          data: { name: args.name },
        });
      },
    }),
      t.field("createComment", {
        type: CommentType,
        args: {
          comment: stringArg(),
          username: stringArg(),
          roomId: stringArg(),
        },
        async resolve(_, args, ctx: Context) {
          const userId = await ctx.prisma.user.findFirst({
            where: {
              username: args.username,
            },
          });
          const newComment = ctx.prisma.comment.create({
            data: {
              comment: args.comment,
              userId: userId.id,
              roomId: parseInt(args.roomId),
            },
          });

          if (newComment) {
            try {
              ctx.pubsub.publish("newComment", newComment);
            } catch (error) {
              console.error(error);
            }
          }

          return newComment;
        },
      });
    t.field("createUser", {
      type: UserType,
      args: { username: stringArg() },
      async resolve(_, args, ctx: Context) {
        const user = await ctx.prisma.user.findFirst({
          where: {
            username: args.username,
          },
        });

        if (user) {
          const token = sign({ username: user.username }, "secret");
          console.log("TOKEN", token);
          return {
            id: user.id,
            username: user.username,
            token,
          };
        } else {
          const create_user = await ctx.prisma.user.create({
            data: { username: args.username },
          });

          const token = sign({ username: create_user.username }, "secret");

          return {
            id: create_user.id,
            username: create_user.username,
            token,
          };
        }
      },
    });
  },
});

export const schema = makeSchema({
  types: [Query, Mutation, Subscription, CommentType, UserType],
  outputs: {
    schema: __dirname + "/../schema.graphql",
    typegen: __dirname + "/generated/nexus.ts",
  },
  contextType: {
    module: require.resolve("./context.ts"),
    export: "Context",
  },
  sourceTypes: {
    modules: [
      {
        module: "@prisma/client",
        alias: "prisma",
      },
    ],
  },
});
