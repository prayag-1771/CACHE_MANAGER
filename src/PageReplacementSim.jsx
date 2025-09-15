import React, { useState } from "react";
import { Card, CardContent } from "./components/ui/card";
import { Button } from "./components/ui/button";
import { motion } from "framer-motion";

// Print frames component
function printFrames(frames) {
  return (
    <div className="flex gap-2">
      {frames.map((f, i) => (
        <span
          key={i}
          className="px-2 py-1 border rounded-md w-8 text-center bg-gray-100"
        >
          {f === -1 ? "-" : f}
        </span>
      ))}
    </div>
  );
}

// FIFO algorithm
function runFIFO(pages, frameSize) {
  let frames = Array(frameSize).fill(-1);
  let rear = 0;
  let faults = 0;
  let steps = [];

  pages.forEach((p) => {
    if (!frames.includes(p)) {
      frames[rear] = p;
      rear = (rear + 1) % frameSize;
      faults++;
    }
    steps.push([...frames]);
  });

  return { steps, faults };
}

// LRU algorithm with doubly linked list + hash
function runLRU(pages, frameSize) {
  const cache = new Map();
  let head = null;
  let tail = null;
  let faults = 0;
  let steps = [];

  function addToHead(node) {
    node.next = head;
    node.prev = null;
    if (head) head.prev = node;
    head = node;
    if (!tail) tail = node;
  }

  function removeNode(node) {
    if (node.prev) node.prev.next = node.next;
    else head = node.next;
    if (node.next) node.next.prev = node.prev;
    else tail = node.prev;
  }

  pages.forEach((p) => {
    if (cache.has(p)) {
      const node = cache.get(p);
      removeNode(node);
      addToHead(node);
    } else {
      faults++;
      const node = { val: p, prev: null, next: null };
      if (cache.size === frameSize) {
        cache.delete(tail.val);
        removeNode(tail);
      }
      addToHead(node);
      cache.set(p, node);
    }

    const frameSnapshot = [];
    let current = head;
    while (current && frameSnapshot.length < frameSize) {
      frameSnapshot.push(current.val);
      current = current.next;
    }
    while (frameSnapshot.length < frameSize) frameSnapshot.push(-1);
    steps.push(frameSnapshot);
  });

  return { steps, faults };
}

// Optimal algorithm
function runOptimal(pages, frameSize) {
  let frames = Array(frameSize).fill(-1);
  let faults = 0;
  let steps = [];

  pages.forEach((p, i) => {
    if (!frames.includes(p)) {
      let index = -1;
      let farthest = -1;
      for (let j = 0; j < frameSize; j++) {
        if (frames[j] === -1) {
          index = j;
          break;
        }
        let k = pages.slice(i + 1).indexOf(frames[j]);
        if (k === -1) {
          index = j;
          break;
        }
        if (k > farthest) {
          farthest = k;
          index = j;
        }
      }
      frames[index] = p;
      faults++;
    }
    steps.push([...frames]);
  });

  return { steps, faults };
}

// AFR algorithm
function runAFR(pages, frameSize, w1, w2) {
  let frames = Array(frameSize).fill(-1);
  let freq = Array(frameSize).fill(0);
  let rec = Array(frameSize).fill(0);
  let faults = 0;
  let steps = [];

  pages.forEach((p) => {
    let found = false;
    let empty = frames.indexOf(-1);

    for (let i = 0; i < frameSize; i++) {
      if (frames[i] === p) {
        found = true;
        freq[i]++;
        rec[i] = 0;
      } else if (frames[i] !== -1) {
        rec[i]++;
      }
    }

    if (!found) {
      faults++;
      if (empty !== -1) {
        frames[empty] = p;
        freq[empty] = 1;
        rec[empty] = 0;
      } else {
        let victim = 0;
        let minScore = w1 * freq[0] + w2 / (rec[0] + 1);
        for (let i = 1; i < frameSize; i++) {
          let score = w1 * freq[i] + w2 / (rec[i] + 1);
          if (score < minScore) {
            minScore = score;
            victim = i;
          }
        }
        frames[victim] = p;
        freq[victim] = 1;
        rec[victim] = 0;
      }
    }

    steps.push([...frames]);
  });

  return { steps, faults };
}

// Main React Component
export default function PageReplacementSim() {
  const [pages, setPages] = useState("7 0 1 2 0 3 0 4 2 3 0 3 2");
  const [frameSize, setFrameSize] = useState(3);
  const [choice, setChoice] = useState("FIFO");
  const [w1, setW1] = useState(1);
  const [w2, setW2] = useState(1);
  const [result, setResult] = useState(null);
  const [runId, setRunId] = useState(0);

  const handleRun = () => {
    const arr = pages.trim().split(/\s+/).map(Number);
    let res;
    if (choice === "FIFO") res = runFIFO(arr, frameSize);
    else if (choice === "LRU") res = runLRU(arr, frameSize);
    else if (choice === "Optimal") res = runOptimal(arr, frameSize);
    else if (choice === "AFR") res = runAFR(arr, frameSize, w1, w2);
    setResult(res);
    setRunId((id) => id + 1);
  };

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold">Page Replacement Simulator</h1>
      <Card>
        <CardContent className="space-y-3 p-4">
          <div>
            <label className="font-medium">Reference String</label>
            <input
              className="w-full border p-2 rounded"
              value={pages}
              onChange={(e) => setPages(e.target.value)}
            />
          </div>
          <div>
            <label className="font-medium">Number of Frames</label>
            <input
              type="number"
              className="w-full border p-2 rounded"
              value={frameSize}
              onChange={(e) => setFrameSize(Number(e.target.value))}
            />
          </div>
          <div>
            <label className="font-medium">Algorithm</label>
            <select
              className="w-full border p-2 rounded"
              value={choice}
              onChange={(e) => setChoice(e.target.value)}
            >
              <option>FIFO</option>
              <option>LRU</option>
              <option>Optimal</option>
              <option>AFR</option>
            </select>
          </div>
          {choice === "AFR" && (
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label>w1 (frequency)</label>
                <input
                  type="number"
                  className="w-full border p-2 rounded"
                  value={w1}
                  onChange={(e) => setW1(Number(e.target.value))}
                />
              </div>
              <div>
                <label>w2 (recency)</label>
                <input
                  type="number"
                  className="w-full border p-2 rounded"
                  value={w2}
                  onChange={(e) => setW2(Number(e.target.value))}
                />
              </div>
            </div>
          )}
          <Button onClick={handleRun} className="w-full">Run</Button>
        </CardContent>
      </Card>

      {result && (
        <div className="space-y-2" key={runId}>
          {result.steps.map((f, i) => (
            <motion.div
              key={i}
              className="p-2 border rounded-md bg-white shadow flex items-center gap-3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: i * 0.1 }}
            >
              <span className="text-sm text-gray-500">Step {i + 1}</span>
              {printFrames(f)}
            </motion.div>
          ))}
          <div className="mt-3 font-bold">Total Page Faults: {result.faults}</div>
        </div>
      )}
    </div>
  );
}
