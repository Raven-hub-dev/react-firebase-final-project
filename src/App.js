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
  // Student Record Form States
  const [studentName, setStudentName] = useState("");
  const [studentCourse, setStudentCourse] = useState("");
  const [studentYearLevel, setStudentYearLevel] = useState("1");
  const [students, setStudents] = useState([]);
  const [isAddingStudent, setIsAddingStudent] = useState(false);

  // Notes States (keeping original functionality)
  const [note, setNote] = useState("");
  const [notes, setNotes] = useState([]);
  const [isAdding, setIsAdding] = useState(false);

  // Collections
  const studentsCollection = collection(db, "students");
  const notesCollection = collection(db, "notes");

  // ============ STUDENT FUNCTIONS ============

  // Fetch all students from Firestore
  const fetchStudents = useCallback(async () => {
    try {
      const data = await getDocs(studentsCollection);
      setStudents(
        data.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id
        }))
      );
    } catch (error) {
      console.error("Error fetching students:", error);
    }
  }, [studentsCollection]);

  // Add new student record
  const addStudent = async () => {
    if (studentName.trim() === "" || studentCourse.trim() === "" || isAddingStudent) {
      alert("Please fill in all fields!");
      return;
    }

    setIsAddingStudent(true);
    try {
      await addDoc(studentsCollection, {
        name: studentName,
        course: studentCourse,
        yearLevel: parseInt(studentYearLevel),
        createdAt: new Date(),
        emoji: NOTE_EMOJIS[Math.floor(Math.random() * NOTE_EMOJIS.length)]
      });

      // Clear form
      setStudentName("");
      setStudentCourse("");
      setStudentYearLevel("1");

      // Refresh student list
      await fetchStudents();
    } catch (error) {
      console.error("Error adding student:", error);
      alert("Failed to add student. Please try again.");
    } finally {
      setIsAddingStudent(false);
    }
  };

  // Delete student record
  const deleteStudent = async (id) => {
    try {
      const studentDoc = doc(db, "students", id);
      await deleteDoc(studentDoc);
      await fetchStudents();
    } catch (error) {
      console.error("Error deleting student:", error);
    }
  };

  // Handle Enter key for student form
  const handleStudentKeyDown = (e) => {
    if (e.key === "Enter") addStudent();
  };

  // ============ NOTE FUNCTIONS ============

  // Fetch all notes from Firestore
  const fetchNotes = useCallback(async () => {
    try {
      const data = await getDocs(notesCollection);
      setNotes(
        data.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id
        }))
      );
    } catch (error) {
      console.error("Error fetching notes:", error);
    }
  }, [notesCollection]);

  // Add new note
  const addNote = async () => {
    if (note.trim() === "" || isAdding) return;
    setIsAdding(true);
    try {
      await addDoc(notesCollection, {
        text: note,
        createdAt: new Date(),
        emoji: NOTE_EMOJIS[Math.floor(Math.random() * NOTE_EMOJIS.length)]
      });
      setNote("");
      await fetchNotes();
    } catch (error) {
      console.error("Error adding note:", error);
    } finally {
      setIsAdding(false);
    }
  };

  // Delete note
  const deleteNote = async (id) => {
    try {
      const noteDoc = doc(db, "notes", id);
      await deleteDoc(noteDoc);
      await fetchNotes();
    } catch (error) {
      console.error("Error deleting note:", error);
    }
  };

  // Handle Enter key for notes
  const handleKeyDown = (e) => {
    if (e.key === "Enter") addNote();
  };

  // Load data on component mount
  useEffect(() => {
    fetchStudents();
    fetchNotes();
  }, [fetchStudents, fetchNotes]);

  const titleLetters = "My Notes!".split("");

  return (
    <div className="container">
      {/* HEADER */}
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

      {/* ============ STUDENT RECORD SECTION ============ */}
      <div className="student-section">
        <h2>📚 Student Records</h2>
        
        <div className="student-form">
          <input
            type="text"
            placeholder="Student Name"
            value={studentName}
            onChange={(e) => setStudentName(e.target.value)}
            onKeyDown={handleStudentKeyDown}
          />
          <input
            type="text"
            placeholder="Course"
            value={studentCourse}
            onChange={(e) => setStudentCourse(e.target.value)}
            onKeyDown={handleStudentKeyDown}
          />
          <select
            value={studentYearLevel}
            onChange={(e) => setStudentYearLevel(e.target.value)}
          >
            <option value="1">Year 1</option>
            <option value="2">Year 2</option>
            <option value="3">Year 3</option>
            <option value="4">Year 4</option>
          </select>
          <button className="btn-add" onClick={addStudent} disabled={isAddingStudent}>
            {isAddingStudent ? "✨" : "+ Add Student"}
          </button>
        </div>

        {students.length > 0 && (
          <div className="count-badge">
            👥 {students.length} student{students.length !== 1 ? "s" : ""} recorded
          </div>
        )}

        <div className="students-list">
          {students.length === 0 ? (
            <div className="empty-state">
              <span className="big-emoji">📋</span>
              <p>No students recorded yet — add one!</p>
            </div>
          ) : (
            <div className="students-grid">
              {students.map((student) => (
                <div className="student-card" key={student.id}>
                  <div className="card-header">
                    <span className="student-emoji">{student.emoji || "👤"}</span>
                    <h3>{student.name}</h3>
                  </div>
                  <div className="card-body">
                    <p><strong>Course:</strong> {student.course}</p>
                    <p><strong>Year Level:</strong> Year {student.yearLevel}</p>
                  </div>
                  <button className="btn-delete" onClick={() => deleteStudent(student.id)}>
                    🗑️ Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* DIVIDER */}
      <hr className="divider" />

      {/* ============ NOTES SECTION ============ */}
      <div className="notes-section">
        <h2>✏️ Quick Notes</h2>

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
    </div>
  );
}

export default App;