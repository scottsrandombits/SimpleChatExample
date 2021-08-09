import { objectType } from "nexus";
import { resolve } from "node:path";
import { Context } from "../../context";

export const MembersSubscriptionPayload = objectType({
  name: "MembersSubcriptionPayload",
  definition(t) {
    t.list.field("members", {
      type: UserType,
      async resolve(root, _, ctx: Context) {
        return ctx.prisma.user.findMany();
      },
    });
  },
});

export const RoomType = objectType({
  name: "Room",
  definition(t) {
    t.int("id");
    t.string("name");
    t.list.field("members", {
      type: Memmbertype,
      async resolve(root, _, ctx: Context) {
        return ctx.prisma.member.findMany({
          where: {
            roomId: root.id,
          },
        });
      },
    });
    t.list.field("comments", {
      type: CommentType,
      async resolve(root, _, ctx: Context) {
        return ctx.prisma.comment.findMany({
          where: {
            roomId: root.id,
          },
        });
      },
    });
  },
});

export const Memmbertype = objectType({
  name: "Member",
  definition(t) {
    t.int("id");
    t.int("roomId");
    t.int("userId");
    t.field("user", {
      type: UserType,
      async resolve(root, args, ctx: Context) {
        return ctx.prisma.user.findFirst({
          where: { id: root.userId },
        });
      },
    });
  },
});

export const UserType = objectType({
  name: "User",
  definition(t) {
    t.int("id");
    t.string("username");
    t.string("token");
  },
});

export const CommentType = objectType({
  name: "Comment",
  definition(t) {
    t.int("id");
    t.string("comment");
    t.field("author", {
      type: UserType,
      async resolve(root, args, ctx: Context) {
        return ctx.prisma.user.findFirst({
          where: {
            id: root.userId,
          },
        });
      },
    });
    t.int("userId");
    t.int("roomId");
  },
});
