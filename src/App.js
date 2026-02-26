import React, { useState, useEffect } from "react";
import "./App.css";

function App() {
  const today = new Date();
  const todayString = today.toLocaleDateString("ru-RU");

  const [view, setView] = useState("year");
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth());
  const [currentYear] = useState(today.getFullYear());

  const [selectedDay, setSelectedDay] = useState(null);
  const [note, setNote] = useState("");
  const [notes, setNotes] = useState(() => {
    const saved = localStorage.getItem("calendarNotes");
    return saved ? JSON.parse(saved) : {};
  });

  useEffect(() => {
    localStorage.setItem("calendarNotes", JSON.stringify(notes));
  }, [notes]);

  const months = [
    "Январь","Февраль","Март","Апрель","Май","Июнь",
    "Июль","Август","Сентябрь","Октябрь","Ноябрь","Декабрь"
  ];

  const holidays = {
    "1-1": "Новый год",
    "1-7": "Рождество",
    "3-8": "8 марта",
    "5-1": "1 мая",
    "5-9": "9 мая",
    "8-31": "31 августа"
  };

  const getDaysInMonth = (m) =>
    new Date(currentYear, m + 1, 0).getDate();

  const getFirstDay = (m) => {
    let d = new Date(currentYear, m, 1).getDay();
    return d === 0 ? 6 : d - 1;
  };

  const saveNote = () => {
    const key = `${selectedMonth}-${selectedDay}`;
    setNotes({ ...notes, [key]: note });
  };

  const renderMonth = (monthIndex, small = false) => {
    const daysInMonth = getDaysInMonth(monthIndex);
    const firstDay = getFirstDay(monthIndex);
    const days = [];

    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={"e" + i}></div>);
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const key = `${monthIndex}-${d}`;
      const holidayKey = `${monthIndex + 1}-${d}`;

      const isHoliday = holidays[holidayKey];
      const hasNote = notes[key];
      const isToday =
        d === today.getDate() &&
        monthIndex === today.getMonth();

      days.push(
        <div
          key={d}
          onClick={() => {
            setSelectedMonth(monthIndex);
            setSelectedDay(d);
            setNote(notes[key] || "");
          }}
          className={`day 
            ${isHoliday ? "holiday" : ""} 
            ${hasNote ? "noted" : ""} 
            ${isToday ? "today" : ""}`}
        >
          {d}
        </div>
      );
    }

    return (
      <div
        className={small ? "mini-month" : "big-month"}
        onClick={() => small && setView("month")}
      >
        <h3>{months[monthIndex]}</h3>
        <div className="week small">
          <div>Пн</div><div>Вт</div><div>Ср</div>
          <div>Чт</div><div>Пт</div><div>Сб</div><div>Вс</div>
        </div>
        <div className="grid small">{days}</div>
      </div>
    );
  };

  if (view === "year") {
    return (
      <div className="app">
        <div className="card big-card">
          <h1>
            Календарь {currentYear} — Сегодня: {todayString}
          </h1>

          <div className="year-grid">
            {months.map((_, i) => (
              <div key={i} onClick={() => {
                setSelectedMonth(i);
                setView("month");
              }}>
                {renderMonth(i, true)}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <div className="card">
        <button className="back" onClick={() => setView("year")}>
          ← Назад
        </button>

        {renderMonth(selectedMonth)}

        {selectedDay && (
          <div className="modal">
            <div className="modal-box">
              <h3>{selectedDay} {months[selectedMonth]}</h3>

              {holidays[`${selectedMonth + 1}-${selectedDay}`] && (
                <div className="holiday-label">
                  🔴 {holidays[`${selectedMonth + 1}-${selectedDay}`]}
                </div>
              )}

              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />

              <div className="modal-buttons">
                <button onClick={saveNote}>Сохранить</button>
                <button onClick={() => setSelectedDay(null)}>Закрыть</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;