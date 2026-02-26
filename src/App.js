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
  const [notes, setNotes] = useState({});

  useEffect(() => {
    fetch("https://69a067083188b0b1d538a235.mockapi.io/api/1/moth")
      .then(res => res.json())
      .then(data => {
        const formatted = {};
        data.forEach(item => {
          formatted[item.key] = {
            text: item.text,
            id: item.id
          };
        });
        setNotes(formatted);
      });
  }, []);

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

    const closeModal = () => setSelectedDay(null);

    if (notes[key]?.id) {
      fetch(`https://69a067083188b0b1d538a235.mockapi.io/api/1/moth/${notes[key].id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key: key,
          text: note
        })
      }).then(() => {
        setNotes(prev => ({
          ...prev,
          [key]: { ...prev[key], text: note }
        }));
        closeModal();
      });
    } else {
      fetch("https://69a067083188b0b1d538a235.mockapi.io/api/1/moth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key: key,
          text: note
        })
      })
      .then(res => res.json())
      .then(data => {
        setNotes(prev => ({
          ...prev,
          [key]: { text: note, id: data.id }
        }));
        closeModal();
      });
    }
  };

  const renderMonth = (monthIndex) => {
    const daysInMonth = getDaysInMonth(monthIndex);
    const firstDay = getFirstDay(monthIndex);
    const days = [];

    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={"empty" + i} className="empty-day"></div>);
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const key = `${monthIndex}-${d}`;
      const holidayKey = `${monthIndex + 1}-${d}`;

      const isHoliday = holidays[holidayKey];
      const hasNote = notes[key]?.text;
      const isToday =
        d === today.getDate() &&
        monthIndex === today.getMonth() &&
        currentYear === today.getFullYear();

      days.push(
        <div
          key={d}
          onClick={() => {
            setSelectedMonth(monthIndex);
            setSelectedDay(d);
            setNote(notes[key]?.text || "");
            setView("month");
          }}
          className={`day 
            ${isHoliday ? "holiday" : ""} 
            ${hasNote ? "noted" : ""} 
            ${isToday ? "today" : ""}`}
          title={isHoliday ? holidays[holidayKey] : ""}
        >
          {d}
        </div>
      );
    }

    return (
      <div className="month-card">
        <h3>{months[monthIndex]}</h3>
        <div className="weekdays">
          <div>Пн</div><div>Вт</div><div>Ср</div><div>Чт</div><div>Пт</div><div>Сб</div><div>Вс</div>
        </div>
        <div className="days-grid">
          {days}
        </div>
      </div>
    );
  };

  if (view === "year") {
    return (
      <div className="app">
        <div className="card big-card">
          <h1>Календарь {currentYear} — Сегодня: {todayString}</h1>
          <div className="year-grid">
            {months.map((_, i) => renderMonth(i))}
          </div>
        </div>
      </div>
    );
  }

  // В режиме просмотра месяца
  return (
    <div className="app">
      <div className="card">
        <button className="back" onClick={() => setView("year")}>← Назад</button>
        {renderMonth(selectedMonth)}

        {selectedDay && (
          <div className="modal" onClick={() => setSelectedDay(null)}>
            <div className="modal-box" onClick={e => e.stopPropagation()}>
              <h3>{selectedDay} {months[selectedMonth]}</h3>

              {holidays[`${selectedMonth + 1}-${selectedDay}`] && (
                <div className="holiday-label">🔴 {holidays[`${selectedMonth + 1}-${selectedDay}`]}</div>
              )}

              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Введите заметку..."
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
