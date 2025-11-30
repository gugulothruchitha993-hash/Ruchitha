"use client";

import { useState } from "react";
import { v4 as uuidv4 } from "uuid";

/* In-memory storage */
let versions = [];

function computeDiff(prevText, nextText) {
  const tokenize = (txt) => (txt || "").toLowerCase().match(/[\w']+/g) || [];
  const prevTokens = tokenize(prevText);
  const nextTokens = tokenize(nextText);

  const map = (arr) => {
    const m = new Map();
    arr.forEach((w) => m.set(w, (m.get(w) || 0) + 1));
    return m;
  };

  const prevMap = map(prevTokens);
  const nextMap = map(nextTokens);

  const added = [];
  const removed = [];

  nextMap.forEach((count, word) => {
    const prevCount = prevMap.get(word) || 0;
    if (count > prevCount) for (let i = 0; i < count - prevCount; i++) added.push(word);
  });

  prevMap.forEach((count, word) => {
    const nextCount = nextMap.get(word) || 0;
    if (count > nextCount) for (let i = 0; i < count - nextCount; i++) removed.push(word);
  });

  return { addedWords: added, removedWords: removed, oldLength: prevText.length, newLength: nextText.length };
}

function timestamp() {
  const d = new Date();
  return (
    d.getFullYear() +
    "-" +
    String(d.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(d.getDate()).padStart(2, "0") +
    " " +
    String(d.getHours()).padStart(2, "0") +
    ":" +
    String(d.getMinutes()).padStart(2, "0")
  );
}

export default function Page() {
  const [content, setContent] = useState("");
  const [message, setMessage] = useState("");

  function saveVersion() {
    const prev = versions.length ? versions[versions.length - 1].content : "";
    const diff = computeDiff(prev, content);
    const entry = { id: uuidv4(), timestamp: timestamp(), ...diff, content };
    versions.push(entry);
    setMessage("Saved version: " + entry.id);
  }

  return (
    <div style={{ fontFamily: "sans-serif", maxWidth: 900, margin: "40px auto" }}>
      <h1>Mini Audit Trail Generator</h1>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 350px", gap: 20 }}>
        <div>
          <label><strong>Content Editor</strong></label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={18}
            style={{ width: "100%", padding: 10 }}
          />
          <div style={{ marginTop: 10 }}>
            <button onClick={saveVersion} style={{ padding: "10px 15px" }}>Save Version</button>
            <span style={{ marginLeft: 10 }}>{message}</span>
          </div>
        </div>
        <div>
          <h3>Version History</h3>
          <div style={{ border: "1px solid #ccc", padding: 10, height: 500, overflow: "auto" }}>
            {versions.length === 0 && <p>No history yet.</p>}
            {[...versions].reverse().map((v) => (
              <div key={v.id} style={{ borderBottom: "1px solid #eee", padding: 10 }}>
                <div style={{ fontSize: 12, color: "#666" }}>{v.timestamp}</div>
                <div><strong>Version:</strong> {v.id}</div>
                <div style={{ fontSize: 13 }}>
                  <div>➕ Added: {v.addedWords.join(", ") || "None"}</div>
                  <div>➖ Removed: {v.removedWords.join(", ") || "None"}</div>
                  <div>Length: {v.oldLength} → {v.newLength}</div>
                </div>
                <details style={{ marginTop: 8 }}>
                  <summary>Content</summary>
                  <pre style={{ whiteSpace: "pre-wrap", background: "#fafafa", padding: 8 }}>{v.content}</pre>
                </details>
                <button onClick={() => setContent(v.content)} style={{ marginTop: 8 }}>Load This Version</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
