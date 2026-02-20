import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/ScheduledClasses.css';
import { apiFetch } from '../utils/api';

function ScheduledClasses() {
  const navigate = useNavigate();
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadSlots = async () => {
    try {
      setLoading(true);
      const { slots } = await apiFetch('/api/slots/selected');
      if (!Array.isArray(slots) || slots.length === 0) {
        setSections([]);
        return;
      }

      const grouped = new Map();
      for (const s of slots) {
        const monthKey = `${s.year}-${String(s.month).padStart(2, '0')}`;
        if (!grouped.has(monthKey)) grouped.set(monthKey, []);
        grouped.get(monthKey).push(s);
      }

      const monthName = (m) =>
        [
          'January',
          'February',
          'March',
          'April',
          'May',
          'June',
          'July',
          'August',
          'September',
          'October',
          'November',
          'December',
        ][m - 1] || '';

      const newSections = Array.from(grouped.entries())
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([monthKey, list]) => {
          const sample = list[0];
          return {
            monthLabel: monthName(sample.month),
            yearLabel: String(sample.year),
            monthKey,
            slots: list.map((slot) => ({
              id: slot._id,
              date: slot.isoDate.slice(8, 10),
              dayNum: `Day ${slot.dayNumber}`,
              topic: slot.topic,
              raw: slot,
            })),
          };
        });

      setSections(newSections);
    } catch (err) {
      console.error('Load slots error:', err);
      setSections([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSlots();
  }, []);


  const handleDelete = async (monthKey, slotId) => {
    setSections((prev) =>
      prev.map((s) =>
        s.monthKey !== monthKey
          ? s
          : { ...s, slots: s.slots.filter((slot) => slot.id !== slotId) }
      )
    );

    try {
      await apiFetch(`/api/slots/${slotId}`, { method: 'DELETE' });
      await loadSlots();
    } catch {
      await loadSlots();
    }
  };

  return (
    <div className="scheduled-classes-page">
      <div className="scheduled-classes-shell">
        <div className="scheduled-classes-header">
          <h1 className="scheduled-classes-title">Scheduled Classes</h1>
          <button
            className="scheduled-classes-add-btn"
            type="button"
            onClick={() => navigate('/schedule')}
          >
            Add New Slot
          </button>
        </div>

        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#5c5c5cff' }}>
            Loading scheduled classes...
          </div>
        ) : sections.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#5c5c5cff' }}>
            No scheduled classes yet. Click "Add New Slot" to get started.
          </div>
        ) : (
          <div className="scheduled-classes-sections">
            {sections.map((section) => (
              <div key={section.monthKey} className="scheduled-month-row">
                <div className="scheduled-month-label">
                  <div className="scheduled-month-name">{section.monthLabel}</div>
                  <div className="scheduled-month-year">{section.yearLabel}</div>
                </div>

                <div className="scheduled-slots-grid">
                  {section.slots.map((slot) => (
                    <div key={slot.id} className="scheduled-slot-stack">
                      <div className="scheduled-slot-card">
                        <div className="scheduled-slot-top">
                          <div className="scheduled-slot-day">{slot.dayNum}</div>
                          <div className="scheduled-slot-topic">{slot.topic}</div>
                        </div>
                        <div className="scheduled-slot-date">{slot.date}</div>
                      </div>
                      <button
                        className="scheduled-slot-delete"
                        type="button"
                        onClick={() => handleDelete(section.monthKey, slot.id)}
                      >
                        Delete
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ScheduledClasses;


