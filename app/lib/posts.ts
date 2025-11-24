import { getAllDevlogs, getDevlog, type Devlog, type DevlogMeta } from "./devlog";

export type PostMeta = DevlogMeta;
export type Post = Devlog;

export const getAllPosts = getAllDevlogs;
export const getPost = getDevlog;
