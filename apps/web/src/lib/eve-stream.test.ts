import { expect, test } from "bun:test";
import { classifyEveLine } from "./eve-stream";

test("extracts assistant text deltas", () => {
  const line = JSON.stringify({ type: "message.appended", data: { messageDelta: "It is " } });
  expect(classifyEveLine(line)).toEqual({ delta: "It is ", terminal: false });
});

test("interim message.completed is not terminal and yields no delta", () => {
  const line = JSON.stringify({ type: "message.completed", data: { message: "hi" } });
  expect(classifyEveLine(line)).toEqual({ delta: "", terminal: false });
});

test("turn.completed and session.waiting are terminal", () => {
  expect(classifyEveLine(JSON.stringify({ type: "turn.completed" })).terminal).toBe(true);
  expect(classifyEveLine(JSON.stringify({ type: "session.waiting" })).terminal).toBe(true);
});

test("blank lines and malformed JSON are ignored", () => {
  expect(classifyEveLine("")).toEqual({ delta: "", terminal: false });
  expect(classifyEveLine("{not json")).toEqual({ delta: "", terminal: false });
});
