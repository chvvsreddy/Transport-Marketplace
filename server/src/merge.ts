import fs from "fs";
import path from "path";
import { createSchema } from "graphql-yoga";
import { mergeResolvers } from "@graphql-tools/merge";
import { loadResolvers } from "./resolvers/loadResolver";


const typeDefs = fs.readFileSync(path.join(__dirname, "schema", "load.graphql"), "utf-8");

export const schema = createSchema({
  typeDefs,
  resolvers: mergeResolvers([loadResolvers]),
});
