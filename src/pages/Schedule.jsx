import { useEffect, useMemo, useState } from 'react';
import '../styles/Schedule.css';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../utils/api';

import { ScheduleSidebar } from '../components/ScheduleSidebar';
import { CalendarGrid } from '../components/CalendarGrid';
import { SelectedSlotsModal } from '../components/SelectedSlotsModal';

function Schedule() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const navigate = useNavigate();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const [viewYear, setViewYear] = useState(2024);
    const [viewMonth, setViewMonth] = useState(10);

    const [calendarDays, setCalendarDays] = useState([]);
    const [selectedSlots, setSelectedSlots] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [submitError, setSubmitError] = useState('');

    const monthFullNames = useMemo(
        () => [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December',
        ],
        []
    );

    const refreshMonth = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await apiFetch(`/api/schedule/${viewYear}/${viewMonth}`);
            setCalendarDays(Array.isArray(data?.cells) ? data.cells : []);
            setSelectedSlots(Array.isArray(data?.selected) ? data.selected : []);
        } catch (err) {
            console.error('Load schedule error:', err);
            setError(err.message || 'Failed to load calendar...');
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
                <CalendarGrid
                    loading={loading}
                    error={error}
                    refreshMonth={refreshMonth}
                    calendarDays={calendarDays}
                    handleCellClick={handleCellClick}
                    viewYear={viewYear}
                    viewMonth={viewMonth}
                />

                <ScheduleSidebar
                    viewMonth={viewMonth}
                    viewYear={viewYear}
                    monthFullNames={monthFullNames}
                    months={months}
                    handlePrevMonth={handlePrevMonth}
                    handleNextMonth={handleNextMonth}
                    setViewMonth={setViewMonth}
                    handleLogout={handleLogout}
                    scheduleInfo={scheduleInfo}
                    submitError={submitError}
                    handleSubmit={handleSubmit}
                />
            </div>

            <SelectedSlotsModal
                isModalOpen={isModalOpen}
                setIsModalOpen={setIsModalOpen}
                modalSlots={modalSlots}
                handleDeleteFromModal={handleDeleteFromModal}
                handleModalOk={handleModalOk}
            />
        </div>
    );
}

export default Schedule;
