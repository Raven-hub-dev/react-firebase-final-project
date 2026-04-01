import { useState, useEffect, useCallback } from "react";
import { db } from "./firebase";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc
} from "firebase/firestore";
import "./App.css";

const NOTE_EMOJIS = ["📝", "✨", "🌟", "🎉", "💡", "🔥", "🎈", "🍀", "🦋", "🌈"];

function App() {
  const [note, setNote] = useState("");
  const [notes, setNotes] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  const notesCollection = collection(db, "notes");

  const fetchNotes = useCallback(async () => {
    const data = await getDocs(notesCollection);
    setNotes(
      data.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id
      }))
    );
  }, [notesCollection]);

  const addNote = async () => {
    if (note.trim() === "" || isAdding) return;
    setIsAdding(true);
    await addDoc(notesCollection, {
      text: note,
      createdAt: new Date(),
      emoji: NOTE_EMOJIS[Math.floor(Math.random() * NOTE_EMOJIS.length)]
    });
    setNote("");
    await fetchNotes();
    setIsAdding(false);
  };

  const deleteNote = async (id) => {
    const noteDoc = doc(db, "notes", id);
    await deleteDoc(noteDoc);
    fetchNotes();
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") addNote();
  };

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const titleLetters = "My Notes!".split("");

  return (
    <div className="container">
      <div className="header">
        <h1>
          {titleLetters.map((char, i) =>
            char === " " ? (
              <span key={i} style={{ display: "inline-block", width: "0.3em" }}>&nbsp;</span>
            ) : (
              <span key={i}>{char}</span>
            )
          )}
        </h1>
        <p className="subtitle">your colorful little notepad 🎀</p>
      </div>

      <div className="emoji-strip">
        <span>🌸</span>
        <span>⭐</span>
        <span>🎨</span>
        <span>🍭</span>
        <span>🎪</span>
      </div>

      <div className="input-section">
        <input
          type="text"
          placeholder="Write something fun... 🎉"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button className="btn-add" onClick={addNote} disabled={isAdding}>
          {isAdding ? "✨" : "+ Add"}
        </button>
      </div>

      {notes.length > 0 && (
        <div className="count-badge">
          🗒️ {notes.length} note{notes.length !== 1 ? "s" : ""} total
        </div>
      )}

      <div className="notes">
        {notes.length === 0 ? (
          <div className="empty-state">
            <span className="big-emoji">🌀</span>
            <p>No notes yet — add one!</p>
          </div>
        ) : (
          notes.map((n) => (
            <div className="note" key={n.id}>
              <span className="note-emoji">{n.emoji || "📝"}</span>
              <p>{n.text}</p>
              <button className="btn-delete" onClick={() => deleteNote(n.id)}>
                🗑️ Delete
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default App;