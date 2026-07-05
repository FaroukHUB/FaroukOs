import { del, get, patch, post } from "./client";

export function listBlocks() {
  return get("/blocks");
}

export function createBlock(data) {
  return post("/blocks", data);
}

export function updateBlock(blockId, data) {
  return patch(`/blocks/${blockId}`, data);
}

export function deleteBlock(blockId) {
  return del(`/blocks/${blockId}`);
}
