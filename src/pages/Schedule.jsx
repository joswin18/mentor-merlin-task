import { useEffect, useMemo, useState } from 'react';
import '../styles/Schedule.css';
import {
    FaInstagram,
    FaFacebookF,
    FaTwitter,
    FaWhatsapp,
    FaChevronLeft,
    FaChevronRight,
    FaClock,
    FaTimes,
    FaSignOutAlt
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../utils/api';

function Schedule() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const navigate = useNavigate();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const [viewYear, setViewYear] = useState(2024);
    const [viewMonth, setViewMonth] = useState(10);
    const activeMonth = months[viewMonth - 1];

    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];


    const [calendarDays, setCalendarDays] = useState([]);
    const [selectedSlots, setSelectedSlots] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [submitError, setSubmitError] = useState('');

    const monthFullNames = useMemo(
        () => [
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
        ],
        []
    );

    const refreshMonth = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await apiFetch(`/api/schedule/${viewYear}/${viewMonth}`);
            console.log('Calendar data received:', { cellsCount: data?.cells?.length, selectedCount: data?.selected?.length });
            setCalendarDays(Array.isArray(data?.cells) ? data.cells : []);
            setSelectedSlots(Array.isArray(data?.selected) ? data.selected : []);
        } catch (err) {
            console.error('Load schedule error:', err);
            setError(err.message || 'Failed to load calendar. Make sure backend is running and you are logged in.');
            setCalendarDays([]);
            setSelectedSlots([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        refreshMonth();
    }, [viewYear, viewMonth]);

    const scheduleInfo = [
        { day: 'Day 1:', topic: 'Topic 1' },
        { day: 'Day 2:', topic: 'Topic 2' },
        { day: 'Day 3:', topic: 'Topic 3' },
        { day: 'Day 4:', topic: 'Topic 4' },
        { day: 'Day 5:', topic: 'Topic 5' },
        { day: 'Day 6:', topic: 'Topic 6' },
        { day: 'Day 7:', topic: 'Topic 7' },
    ];

    const modalSlots = useMemo(() => {
        const suffix = (n) => (n % 10 === 1 && n % 100 !== 11 ? 'st' : n % 10 === 2 && n % 100 !== 12 ? 'nd' : n % 10 === 3 && n % 100 !== 13 ? 'rd' : 'th');
        return selectedSlots.map((s, index) => ({
            id: s._id,
            title: `${index + 1}${suffix(index + 1)} Schedule`,
            date: s.isoDate?.slice(8, 10) || '',
            day: `Day ${s.dayNumber}`,
            topic: s.topic,
            isoDate: s.isoDate,
        }));
    }, [selectedSlots]);

    const handleSubmit = () => {
        setSubmitError('');
        if (!selectedSlots || selectedSlots.length === 0) {
            setSubmitError('Please select at least one slot before submitting.');
            return;
        }
        setIsModalOpen(true);
    };

    const handleModalOk = () => {
        setIsModalOpen(false);
        navigate('/scheduled-classes');
    };

    const handleCellClick = async (cell) => {
        if (!cell?.isoDate) return;
        if (cell.type !== 'light' && cell.type !== 'dark') return;

        try {
            setSubmitError('');
            if (cell.type === 'light') {
                await apiFetch('/api/slots/select', { method: 'POST', body: { isoDate: cell.isoDate } });
                await refreshMonth();
                return;
            }

            const toDelete = selectedSlots.find((s) => s.isoDate === cell.isoDate);
            if (!toDelete?._id) return;
            await apiFetch(`/api/slots/${toDelete._id}`, { method: 'DELETE' });
            await refreshMonth();
        } catch (err) {
            console.error('Slot toggle error:', err);
        }
    };

    const handleDeleteFromModal = async (slotId) => {
        try {
            await apiFetch(`/api/slots/${slotId}`, { method: 'DELETE' });
            await refreshMonth();
        } catch (err) {
            console.error('Delete slot error:', err);
        }
    };

    const handlePrevMonth = () => {
        setViewMonth((m) => {
            if (m === 1) {
                setViewYear((y) => y - 1);
                return 12;
            }
            return m - 1;
        });
    };

    const handleNextMonth = () => {
        setViewMonth((m) => {
            if (m === 12) {
                setViewYear((y) => y + 1);
                return 1;
            }
            return m + 1;
        });
    };

    const handleLogout = () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('authUser');
        navigate('/');
    };

    return (
        <div className="schedule-page">
            <div className="schedule-layout">

                <div className="calendar-section">
                    <h1 className="main-title">Select your slots</h1>

                    <div className="calendar-grid-container">
                        <div className="calendar-header-row">
                            {daysOfWeek.map(day => (
                                <div key={day} className="weekday-label">{day}</div>
                            ))}
                        </div>

                        {loading ? (
                            <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
                                Loading calendar...
                            </div>
                        ) : error ? (
                            <div style={{ padding: '40px', textAlign: 'center', color: '#dc3545' }}>
                                Error: {error}
                                <br />
                                <button
                                    onClick={refreshMonth}
                                    style={{
                                        marginTop: '10px',
                                        padding: '8px 16px',
                                        background: '#725a8a',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                    }}
                                >
                                    Retry
                                </button>
                            </div>
                        ) : calendarDays.length === 0 ? (
                            <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
                                No calendar data available
                            </div>
                        ) : (
                            <div className="calendar-grid">
                                {calendarDays.map((item, idx) => (
                                    <div
                                        key={idx}
                                        className={`calendar-cell ${item.type}`}
                                        onClick={() => handleCellClick(item)}
                                    >
                                        {item.dayNum && (
                                            <div className="cell-top">
                                                <span className="cell-day-num">{item.dayNum}</span>
                                                <span className="cell-topic">{item.topic}</span>
                                            </div>
                                        )}
                                        <span className="cell-date">{item.date}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>


                <div className="sidebar-section">
                    <div className="sidebar-top">
                        <div className="sidebar-title-row">
                            <h2 className="sidebar-title">Monthly Schedule</h2>
                            <button className="logout-btn" onClick={handleLogout} title="Logout">
                                <FaSignOutAlt />
                            </button>
                        </div>
                        <div className="month-picker">
                            <button className="nav-btn" onClick={handlePrevMonth}><FaChevronLeft /></button>
                            <span className="month-year">{monthFullNames[viewMonth - 1]} {viewYear}</span>
                            <button className="nav-btn" onClick={handleNextMonth}><FaChevronRight /></button>
                        </div>
                    </div>

                    <div className="sidebar-main-wrapper">
                        <div className="sidebar-main-content">
                            <div className="time-slots">
                                <div className="time-slot-card">
                                    <FaClock className="clock-icon" />
                                    <div className="time-item">
                                        <span className="time-value">09:00 hs</span>
                                    </div>
                                    <div className="time-divider"></div>
                                    <div className="time-item">
                                        <span className="time-value">06:00 hs</span>
                                    </div>
                                </div>
                            </div>

                            <div className="info-list-card">
                                {scheduleInfo.map((info, idx) => (
                                    <div key={idx} className="info-item">
                                        <span className="info-day">{info.day}</span>
                                        <span className="info-topic">{info.topic}</span>
                                    </div>
                                ))}
                            </div>

                            {submitError && (
                                <div style={{
                                    color: '#dc3545',
                                    fontSize: '14px',
                                    fontWeight: '500',
                                    marginBottom: '12px',
                                    padding: '8px 12px',
                                    backgroundColor: '#fff5f5',
                                    border: '1px solid #fecaca',
                                    borderRadius: '8px',
                                    textAlign: 'center'
                                }}>
                                    {submitError}
                                </div>
                            )}
                            <button className="submit-button" onClick={handleSubmit}>Submit</button>
                            <div className="sidebar-footer">
                                <div className="social-icons">
                                    <FaInstagram />
                                    <FaFacebookF />
                                    <FaTwitter />
                                    <FaWhatsapp />
                                </div>
                                <div className="inquiry">
                                    For inquiry : +44 123456789
                                </div>
                            </div>
                        </div>


                        <div className="month-tab-sidebar">
                            {months.map((month, idx) => (
                                <div
                                    key={month}
                                    className={`month-tab ${(idx + 1) === viewMonth ? 'active' : ''}`}
                                    onClick={() => setViewMonth(idx + 1)}
                                    role="button"
                                    tabIndex={0}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' || e.key === ' ') setViewMonth(idx + 1);
                                    }}
                                >
                                    {month}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            
            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-wrapper">
                        <button className="modal-close-btn" onClick={() => setIsModalOpen(false)}>
                            <FaTimes />
                        </button>
                        <div className="modal-content">
                            <h2 className="modal-title">Selected Slots</h2>

                            <div className="modal-slots-container">
                                {modalSlots.map((slot) => (
                                    <div key={slot.id} className="modal-slot-card">
                                        <div className="modal-slot-header">{slot.title}</div>
                                        <div className="modal-slot-body">
                                            <div className="modal-slot-date">{slot.date}</div>
                                            <div className="modal-slot-info">
                                                <span className="modal-slot-day">{slot.day}</span>
                                                <span className="modal-slot-topic">{slot.topic}</span>
                                            </div>
                                        </div>
                                        <button className="modal-slot-delete" onClick={() => handleDeleteFromModal(slot.id)}>Delete</button>
                                    </div>
                                ))}
                            </div>

                            <div className="modal-actions">
                                <button className="modal-cancel-btn" onClick={() => setIsModalOpen(false)}>Cancel</button>
                                <button className="modal-ok-btn" onClick={handleModalOk}>Ok</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Schedule;
